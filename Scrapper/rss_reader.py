# ingest_rss.py
import os, re, time, requests, feedparser, hashlib
from datetime import datetime, timedelta, timezone
from dateutil import parser as dateparse
from PyPDF2 import PdfReader
from bs4 import BeautifulSoup, NavigableString
from readability import Document
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from image_resolver import resolve_best_image

API_URL = os.getenv("API_URL", "http://localhost:5000/api/stories/bulk")
PDF_PATH = os.getenv("RSS_PDF", "rss-urls-1.pdf")

# ---------- knobs ----------
CUTOFF_DAYS = 5
MAX_ITEMS_PER_FEED = 20
BATCH_SIZE = 100
REQUEST_TIMEOUT = 60
PAGE_TIMEOUT = 10
MIN_WORDS = 120
SLEEP_BETWEEN_FEEDS = 0.2
# ---------------------------

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

SPORTS_DOMAINS = [
    "espn.com","sports.yahoo.com","si.com","cbssports.com","theguardian.com/sport",
    "latimes.com/sports","reuters.com","apnews.com","washingtonpost.com/early-lead",
    "buzzfeed.com/sports","nytimes.com/nyt/sports","cbssports.com","si.com/rss"
]
MOVIE_DOMAINS = [
    "variety.com","hollywoodreporter.com","latimes.com/entertainment",
    "deadline.com","tmz.com","ew.com","rollingstone.com","people.com","popsugar.com",
    "reuters.com/lifestyle/entertainment","buzzfeed.com/tvandmovies","mtv.com/rss/news",
    "ign.com","gamespot.com","screenrant.com","indiewire.com"
]
BLOG_DOMAINS = [
    "medium.com","substack.com","blogspot.","wordpress.","newyorker.com","theatlantic.com",
    "vox.com","qz.com","huffpost.com","mashable.com"
]

URL_RE = re.compile(r"https?://[^\s<>\"']+", re.I)
TRACK_PARAMS = {"utm_source","utm_medium","utm_campaign","utm_term","utm_content","fbclid","gclid","mc_cid","mc_eid"}

# --------- URL + de-dupe helpers ---------
def canonicalize_url(raw: str) -> str | None:
    if not raw: return None
    try:
        u = urlparse(raw)
        query = [(k,v) for (k,v) in parse_qsl(u.query, keep_blank_values=True) if k.lower() not in TRACK_PARAMS]
        u = u._replace(netloc=u.netloc.lower(), fragment="", query=urlencode(query))
        return urlunparse(u)
    except Exception:
        return raw

def make_fingerprint(source: str, guid: str, title: str, published_iso: str, canonical_url: str) -> str:
    basis = (canonical_url or "").strip().lower() or \
            f"{(source or '').strip().lower()}|{(guid or '').strip().lower()}" or \
            f"{(source or '').strip().lower()}|{(title or '').strip().lower()}|{(published_iso or '')[:10]}"
    return hashlib.sha256(basis.encode("utf-8")).hexdigest()

# --------- feed list helpers ---------
def extract_urls_from_pdf(pdf_path: str) -> list[str]:
    reader = PdfReader(pdf_path)
    text = "\n".join((page.extract_text() or "") for page in reader.pages)
    urls = URL_RE.findall(text)
    rss_like = [u for u in urls if any(x in u.lower() for x in ("/rss","feed",".xml","atom","feeds"))]
    seen, deduped = set(), []
    for u in rss_like:
        if u not in seen:
            seen.add(u); deduped.append(u)
    return deduped

def categorize_feed(url: str) -> str | None:
    lu = url.lower()
    if any(d in lu for d in SPORTS_DOMAINS): return "sports"
    if any(d in lu for d in MOVIE_DOMAINS):  return "movies"
    if any(d in lu for d in BLOG_DOMAINS):   return "blogs"
    if "/sport" in lu or "sports" in lu:     return "sports"
    if "entertainment" in lu or "movies" in lu or "film" in lu: return "movies"
    if "blog" in lu:                          return "blogs"
    return None

# --------- content utilities ---------
def word_count(s: str) -> int:
    return len((s or "").strip().split())

def normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())

def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html or "", "lxml")
    for t in soup(["script","style","noscript"]): t.extract()
    text = soup.get_text(separator=" ")
    return normalize_ws(text)

def extract_paragraphs_from_html(content_html: str) -> list[str]:
    """
    Parse article HTML into meaningful paragraphs:
    - Keep <p>, list items (<li>), headings (<h1-6>), blockquotes, and pre/code blocks.
    - Collapse whitespace, drop empty/trivial lines, strip share/caption junk.
    - Join consecutive inline text & <br> as one paragraph.
    """
    if not content_html:
        return []

    soup = BeautifulSoup(content_html, "lxml")

    # Remove obvious junk containers commonly injected in article bodies
    junk_selectors = [
        ".share", ".social", ".advert", ".ad", ".promo", ".newsletter",
        ".caption", ".credit", ".byline", ".meta", ".tag-list", ".breadcrumbs",
        "figure figcaption", ".inline-share", ".subscribe", ".read-more"
    ]
    for sel in junk_selectors:
        for node in soup.select(sel):
            node.decompose()

    blocks: list[str] = []

    def push(text: str):
        t = normalize_ws(text)
        # filter tiny residues like "Photo:" or single punctuation
        if not t or len(t) < 2:
            return
        blocks.append(t)

    # Prefer the top-most container of the Readability summary
    container = soup
    # Walk through top-level children to preserve order
    for el in container.descendants:
        if isinstance(el, NavigableString):
            continue
        name = el.name.lower() if el.name else ""

        # Treat these as block-level paragraph sources
        if name in ("p", "li"):
            push(el.get_text(" ", strip=True))
        elif name in ("h1","h2","h3","h4","h5","h6"):
            # Headings become their own paragraphs
            push(el.get_text(" ", strip=True))
        elif name in ("blockquote",):
            txt = el.get_text(" ", strip=True)
            if txt:
                push(txt)
        elif name in ("pre","code"):
            # Preserve code/pre with linebreaks collapsed to spaces
            txt = " ".join(el.get_text("\n", strip=True).splitlines())
            if txt:
                push(txt)
        # Skip duplicating by only pushing at element level, not on container end

    # Fallback: if nothing was found (some sites wrap everything in <div>s)
    if not blocks:
        # Rebuild by breaking on <br> sequences and div boundaries
        # Convert <br> runs into newline markers
        for br in soup.find_all("br"):
            br.replace_with("\n")
        text = soup.get_text("\n", strip=True)
        # Split on blank lines or single newlines if dense
        paras = [normalize_ws(p) for p in re.split(r"\n{2,}|\r{2,}", text)]
        if len(paras) <= 1:
            paras = [normalize_ws(p) for p in text.split("\n")]
        blocks = [p for p in paras if p]

    # Merge spurious tiny “paras” that are just continuations (e.g., caption remnants)
    merged: list[str] = []
    for b in blocks:
        if merged and (len(b) < 40 or not re.search(r"[.!?]$", b)):
            # If current block is too short and previous doesn't end with hard punctuation,
            # treat as a continuation.
            if not re.search(r"[.!?]$", merged[-1]):
                merged[-1] = normalize_ws(merged[-1] + " " + b)
                continue
        merged.append(b)

    return merged

def split_paragraphs_plain(text: str | None) -> list[str]:
    """
    Plain-text fallback if we have no article HTML.
    Uses blank-line separation, then newline, then chunking.
    """
    if not text:
        return []
    normalized = text.replace("\r\n", "\n")
    parts = [p.strip() for p in re.split(r"\n\s*\n", normalized) if p.strip()]
    if len(parts) == 1:
        parts = [p.strip() for p in normalized.split("\n") if p.strip()]
    if len(parts) <= 1 and len(normalized.split()) > 120:
        words = normalized.split()
        chunk, out = [], []
        for w in words:
            chunk.append(w)
            if len(chunk) >= 80:
                out.append(" ".join(chunk)); chunk = []
        if chunk: out.append(" ".join(chunk))
        parts = out or parts
    return parts

def fetch_page(url: str) -> str | None:
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=PAGE_TIMEOUT)
        r.raise_for_status()
        return r.text
    except Exception:
        return None

def fetch_fulltext_artifact(url: str) -> tuple[str | None, str | None, str | None]:
    """
    Returns: (plain_text_from_readability, full_html, readability_content_html)
    """
    html = fetch_page(url)
    if not html:
        return None, None, None
    try:
        doc = Document(html)
        content_html = doc.summary(html_partial=True)
        text = html_to_text(content_html)
        return (text or None), html, (content_html or None)
    except Exception:
        return None, html, None

def best_entry_html(entry) -> str | None:
    """
    Try to get embedded fulltext HTML from the feed item itself.
    """
    if hasattr(entry, "content"):
        try:
            parts = entry.content
            if parts and isinstance(parts, list) and parts[0].get("value"):
                return parts[0]["value"]
        except Exception:
            pass
    return None

def best_entry_text(entry) -> str:
    val = entry.get("summary") or entry.get("description")
    return html_to_text(val) if val else ""

def parse_date(entry):
    for key in ("published", "updated", "created"):
        val = getattr(entry, key, None) or entry.get(key)
        if val:
            try:
                dt = dateparse.parse(val)
                if dt and dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except Exception:
                pass
    return None

def clean_entry(feed, entry, category):
    link = entry.get("link")
    title = (entry.get("title") or "").strip()
    if not link or not title:
        return None

    # 1) Prefer HTML from the entry itself (many feeds embed full article)
    entry_html = best_entry_html(entry)
    content_arr = []
    html_cache = None

    if entry_html:
        content_arr = extract_paragraphs_from_html(entry_html)

    # 2) If too short, fetch page and use Readability HTML
    if sum(len(p.split()) for p in content_arr) < MIN_WORDS:
        text_fallback = best_entry_text(entry)
        txt, html_cache, content_html = fetch_fulltext_artifact(link)
        # Prefer the Readability HTML; otherwise fallback text
        if content_html:
            content_arr = extract_paragraphs_from_html(content_html)
        elif txt:
            content_arr = split_paragraphs_plain(txt)
        elif text_fallback:
            content_arr = split_paragraphs_plain(text_fallback)
        else:
            content_arr = []

    # Still not enough content? Skip.
    if sum(len(p.split()) for p in content_arr) < MIN_WORDS:
        return None

    # 3) Image: feed media → resolve via page HTML
    image = None
    try:
        if "media_content" in entry and entry.media_content:
            image = entry.media_content[0].get("url")
        if not image and "media_thumbnail" in entry and entry.media_thumbnail:
            image = entry.media_thumbnail[0].get("url")
    except Exception:
        pass
    if not image:
        if not html_cache:
            html_cache = fetch_page(link)
        if html_cache:
            image = resolve_best_image(html_cache, link, UA)

    source = (feed.feed.get("title") or feed.feed.get("link") or "").strip()
    guid = entry.get("id") or entry.get("guid")
    dt = parse_date(entry)
    published_iso = dt.isoformat() if dt else None

    canonical_url = canonicalize_url(link)
    fingerprint = make_fingerprint(source, guid or "", title, published_iso or "", canonical_url or "")

    # Trim excessive paragraph length
    capped = []
    total_words = 0
    for p in content_arr:
        if len(p) > 4000:
            p = p[:4000] + "…"
        capped.append(p)
        total_words += len(p.split())

    return {
        "title": title[:250],
        "link": link.strip(),
        "canonicalUrl": canonical_url,
        "guid": guid,
        "fingerprint": fingerprint,
        "summary": " ".join(capped)[:2000],
        "content": capped,                   # proper ARRAY of paragraphs
        "image": image,
        "source": source,
        "category": category,
        "tags": [],
        "publishedAt": published_iso,
    }

def post_batch(items_batch):
    try:
        resp = requests.post(API_URL, json={"items": items_batch}, timeout=REQUEST_TIMEOUT)
        print("Posted batch:", len(items_batch), resp.status_code)
        if resp.status_code >= 400:
            print(resp.text[:500])
    except Exception as e:
        print("POST error:", e)

def main():
    urls = extract_urls_from_pdf(PDF_PATH)
    selected = []
    for u in urls:
        cat = categorize_feed(u)
        if cat:
            selected.append((u, cat))
    print(f"Selected {len(selected)} feeds")

    cutoff = datetime.now(timezone.utc) - timedelta(days=CUTOFF_DAYS)
    batch = []

    for url, cat in selected:
        print("Feed:", url, "->", cat)
        try:
            r = requests.get(url, headers={"User-Agent": UA}, timeout=REQUEST_TIMEOUT)
            r.raise_for_status()
            feed = feedparser.parse(r.content)
            if feed.bozo and not getattr(feed, "entries", None):
                print("  Skipping (bozo/no entries)")
                continue

            count = 0
            for e in feed.entries:
                if count >= MAX_ITEMS_PER_FEED:
                    break

                doc = clean_entry(feed, e, cat)
                if not doc:
                    continue

                # date filter (if we have a date)
                if doc["publishedAt"]:
                    try:
                        dt = dateparse.parse(doc["publishedAt"])
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=timezone.utc)
                        if dt < cutoff:
                            continue
                    except Exception:
                        pass

                batch.append(doc)
                count += 1

                if len(batch) >= BATCH_SIZE:
                    post_batch(batch)
                    batch = []

        except requests.exceptions.Timeout:
            print("  Timeout (60s) -> skipped")
        except Exception as ex:
            print("  Error:", ex)

        time.sleep(SLEEP_BETWEEN_FEEDS)

    if batch:
        post_batch(batch)
    print("Done.")

if __name__ == "__main__":
    main()
