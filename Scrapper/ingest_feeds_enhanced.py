# ingest_feeds_enhanced.py
import os, re, time, json, requests, feedparser, hashlib, math
from datetime import datetime, timedelta, timezone
from dateutil import parser as dateparse
from PyPDF2 import PdfReader
from bs4 import BeautifulSoup, NavigableString
from readability import Document
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from collections import Counter, defaultdict

# Optional, but strongly recommended for better extraction
try:
    import trafilatura
    from trafilatura.settings import use_config
    TRAFILATURA_OK = True
except Exception:
    TRAFILATURA_OK = False

API_URL   = os.getenv("API_URL", "http://localhost:5000/api/stories/bulk")
PDF_PATH  = os.getenv("RSS_PDF", "rss-urls-1.pdf")

# ---------- knobs ----------
CUTOFF_DAYS         = int(os.getenv("CUTOFF_DAYS", "5"))
MAX_ITEMS_PER_FEED  = int(os.getenv("MAX_ITEMS_PER_FEED", "20"))
BATCH_SIZE          = int(os.getenv("BATCH_SIZE", "100"))
REQUEST_TIMEOUT     = int(os.getenv("REQUEST_TIMEOUT", "60"))
PAGE_TIMEOUT        = int(os.getenv("PAGE_TIMEOUT", "15"))
MIN_WORDS           = int(os.getenv("MIN_WORDS", "120"))
SLEEP_BETWEEN_FEEDS = float(os.getenv("SLEEP_BETWEEN_FEEDS", "0.2"))
WPM                 = int(os.getenv("WPM", "250"))
IMG_SECONDS         = int(os.getenv("IMG_SECONDS", "10"))
# ---------------------------

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

SPORTS_HINTS = ("sport", "sports", "football", "soccer", "cricket", "nba", "nfl", "mlb", "tennis", "f1", "golf", "ipl")
MOVIE_HINTS  = ("entertainment","movie","movies","film","hollywood","bollywood","tv","showbiz","box office")
BLOG_HINTS   = ("blog","opinion","analysis","essay","column")

SPORTS_DOMAINS = [
    "espn.com","sports.yahoo.com","si.com","cbssports.com","theguardian.com/sport",
    "latimes.com/sports","reuters.com","apnews.com","washingtonpost.com/early-lead",
    "buzzfeed.com/sports","nytimes.com/nyt/sports","si.com/rss","cbssports.com"
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

# simple multilingual-ish stopword set (extend as needed)
STOP = set("""
a an and the or of for in on to with from as by about into over after before up down off out at across under again
is are was were be been being do does did doing have has had having can could should would will may might must
this that these those it its it's he she they them we you i me my our your their his her not no nor only same
very just than too also more most other some any each such own so because while where when how which who whom
""".split())

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
    if any(h in lu for h in MOVIE_HINTS):    return "movies"
    if "blog" in lu:                          return "blogs"
    return None

def req_get(url: str, timeout: int) -> requests.Response | None:
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=timeout)
        r.raise_for_status()
        return r
    except Exception:
        return None

def readability_extract(html: str) -> tuple[str|None, str|None]:
    try:
        doc = Document(html)
        content_html = doc.summary(html_partial=True)
        return content_html, doc.title()
    except Exception:
        return None, None

def trafilatura_extract(url: str, html: str | None = None) -> dict:
    """Return dict with keys: text, title, html, images(list of urls) if available."""
    if not TRAFILATURA_OK:
        return {}
    cfg = use_config()
    cfg.set("DEFAULT", "EXTRACTION_TIMEOUT", "0")  # disable per-page hard timeout
    try:
        if html:
            res = trafilatura.extract(html, output="json", with_metadata=True, include_comments=False, config=cfg)
        else:
            downloaded = trafilatura.fetch_url(url, config=cfg, no_ssl=True)
            res = trafilatura.extract(downloaded, output="json", with_metadata=True, include_comments=False, config=cfg)
        if not res:
            return {}
        data = json.loads(res)
        return {
            "text": data.get("text"),
            "title": data.get("title"),
            "html": data.get("raw_html") or None,  # raw_html present in some versions
            "images": data.get("images") or [],
        }
    except Exception:
        return {}

def html_to_soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html or "", "lxml")

def clean_junk(soup: BeautifulSoup) -> None:
    junk_selectors = [
        ".share",".social",".advert",".ad",".promo",".newsletter",
        ".caption",".credit",".byline",".meta",".tag-list",".breadcrumbs",
        "figure figcaption",".inline-share",".subscribe",".read-more",".cookie",".consent"
    ]
    for sel in junk_selectors:
        for n in soup.select(sel):
            n.decompose()

def extract_paragraphs_and_images(content_html: str) -> tuple[list[str], list[dict], list[str], str|None]:
    """
    Returns (paragraphs, contentImages[{index,url,alt}], all_images[], thumbnail)
    """
    soup = html_to_soup(content_html)
    clean_junk(soup)

    # prefer og:image / twitter:image as thumbnail
    thumb = None
    head = soup.find("head")
    if head:
        og = head.find("meta", attrs={"property":"og:image"}) or head.find("meta", attrs={"name":"og:image"})
        tw = head.find("meta", attrs={"name":"twitter:image"}) or head.find("meta", attrs={"property":"twitter:image"})
        thumb = (og and og.get("content")) or (tw and tw.get("content"))

    # traverse content blocks
    paragraphs: list[str] = []
    content_images: list[dict] = []
    all_images: list[str] = []

    # attempt to find main article container if obvious
    candidates = soup.select("article") or soup.select('[itemprop="articleBody"]') or [soup.body or soup]
    container = candidates[0] if candidates else soup

    para_idx = -1
    for el in container.descendants:
        if isinstance(el, NavigableString):
            continue
        name = (el.name or "").lower()
        if name in ("p","li","blockquote","h1","h2","h3","h4","h5","h6","pre","code"):
            text = el.get_text(" ", strip=True)
            if not text: 
                continue
            para_idx += 1
            if name in ("pre","code"):
                text = " ".join(text.splitlines())
            paragraphs.append(text)
        elif name == "img":
            url = el.get("src") or el.get("data-src") or el.get("data-original")
            if url:
                all_images.append(url)
                # attach to the last paragraph if exists, else index 0
                target = max(para_idx, 0)
                alt = el.get("alt") or ""
                content_images.append({"index": target, "url": url, "alt": alt})

    # fallback if no paragraphs: break on <br> or big text chunk
    if not paragraphs:
        for br in soup.find_all("br"):
            br.replace_with("\n")
        text = soup.get_text("\n", strip=True)
        chunks = [t.strip() for t in re.split(r"\n{2,}", text) if t.strip()]
        if len(chunks) <= 1:
            chunks = [t.strip() for t in text.split("\n") if t.strip()]
        paragraphs = chunks

    # choose a thumbnail if none from meta
    if not thumb and all_images:
        thumb = all_images[0]

    # limit overly long paras
    normalized = []
    for p in paragraphs:
        if len(p) > 4000:
            normalized.append(p[:4000] + "…")
        else:
            normalized.append(p)

    return normalized, content_images, list(dict.fromkeys(all_images)), thumb

def split_paragraphs_plain(text: str | None) -> list[str]:
    if not text: return []
    normalized = text.replace("\r\n","\n")
    parts = [p.strip() for p in re.split(r"\n\s*\n", normalized) if p.strip()]
    if len(parts) == 1:
        parts = [p.strip() for p in normalized.split("\n") if p.strip()]
    # chunk long text if still single
    if len(parts) <= 1 and len(normalized.split()) > 120:
        words = normalized.split()
        out, chunk = [], []
        for w in words:
            chunk.append(w)
            if len(chunk) >= 80:
                out.append(" ".join(chunk)); chunk=[]
        if chunk: out.append(" ".join(chunk))
        parts = out or parts
    return parts

def best_entry_html(entry) -> str | None:
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
    if not val: return ""
    soup = BeautifulSoup(val, "lxml")
    for t in soup(["script","style","noscript"]): t.extract()
    text = soup.get_text(separator=" ")
    return re.sub(r"\s+", " ", text).strip()

def parse_date(entry):
    for key in ("published","updated","created"):
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

def cheap_keywords(text: str, topn: int = 10) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z\-']+", text)
    norm = [w.lower() for w in words if w.lower() not in STOP and len(w) > 2]
    freq = Counter(norm)

    # capture simple capitalized multi-words (names/teams/titles)
    caps = re.findall(r"(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})", text)
    caps = [c.strip() for c in caps if len(c.split())<=4]
    for c in caps:
        token = c.lower()
        if token not in STOP:
            freq[token] += 2  # light boost

    return [k.replace(" ", "-") for k,_ in freq.most_common(topn)]

def guess_category(source_title: str, link: str, text: str) -> str | None:
    s = (source_title or "") + " " + (link or "") + " " + (text or "")
    s = s.lower()
    if any(d in s for d in SPORTS_DOMAINS) or any(h in s for h in SPORTS_HINTS):
        return "sports"
    if any(d in s for d in MOVIE_DOMAINS) or any(h in s for h in MOVIE_HINTS):
        return "movies"
    if any(d in s for d in BLOG_DOMAINS) or any(h in s for h in BLOG_HINTS):
        return "blogs"
    return None

def compute_read_time(words: int, n_images: int) -> str:
    minutes = words / max(WPM, 150)
    bonus = (n_images * IMG_SECONDS) / 60.0
    total = minutes + bonus
    m = max(1, int(round(total)))
    return f"{m} min read"

def post_batch(items_batch):
    try:
        resp = requests.post(API_URL, json={"items": items_batch}, timeout=REQUEST_TIMEOUT)
        print("Posted batch:", len(items_batch), resp.status_code)
        if resp.status_code >= 400:
            print(resp.text[:500])
    except Exception as e:
        print("POST error:", e)

def clean_one(feed, entry):
    link  = entry.get("link")
    title = (entry.get("title") or "").strip()
    if not link or not title:
        return None

    # 1) try entry-embedded html
    paras, cimgs, images, thumb = [], [], [], None
    entry_html = best_entry_html(entry)
    if entry_html:
        p, ci, im, th = extract_paragraphs_and_images(entry_html)
        paras, cimgs, images, thumb = p, ci, im, th

    # 2) if too short, fetch full article
    if sum(len(p.split()) for p in paras) < MIN_WORDS:
        r = req_get(link, PAGE_TIMEOUT)
        html = r.text if r else None

        if TRAFILATURA_OK:
            tf = trafilatura_extract(link, html)
        else:
            tf = {}

        used_any = False
        if tf.get("text"):
            p2 = split_paragraphs_plain(tf["text"])
            if sum(len(x.split()) for x in p2) >= MIN_WORDS:
                paras = p2; used_any = True

        if not used_any and html:
            content_html, _ = readability_extract(html)
            if content_html:
                p3, ci3, im3, th3 = extract_paragraphs_and_images(content_html)
                if sum(len(x.split()) for x in p3) >= MIN_WORDS:
                    paras, cimgs, images, thumb = p3, ci3, im3, th3
                    used_any = True

        if not used_any:
            # fallback to summary/description
            text_fb = best_entry_text(entry)
            p4 = split_paragraphs_plain(text_fb)
            if sum(len(x.split()) for x in p4) >= MIN_WORDS:
                paras = p4

    if sum(len(p.split()) for p in paras) < MIN_WORDS:
        return None

    # Feed/media images as additional hints
    try:
        if "media_content" in entry and entry.media_content:
            murl = entry.media_content[0].get("url")
            if murl: images.append(murl)
        if "media_thumbnail" in entry and entry.media_thumbnail:
            murl = entry.media_thumbnail[0].get("url")
            if murl: images.append(murl)
    except Exception:
        pass

    images = list(dict.fromkeys([u for u in images if u]))
    if not thumb and images:
        thumb = images[0]

    text_full = " ".join(paras)
    tags = cheap_keywords(text_full, topn=10)

    dt = parse_date(entry)
    published_iso = dt.isoformat() if dt else None

    source_title = (feed.feed.get("title") or feed.feed.get("link") or "").strip()
    category = guess_category(source_title, link, text_full)

    canonical_url = canonicalize_url(link)
    guid = entry.get("id") or entry.get("guid")
    fingerprint = make_fingerprint(source_title, guid or "", title, published_iso or "", canonical_url or "")

    words = len(text_full.split())
    read_time = compute_read_time(words, len(images) or len(cimgs))

    # Final story doc your fanout script can consume
    story = {
        "title": title[:250],
        "link": link.strip(),
        "canonicalUrl": canonical_url,
        "guid": guid,
        "fingerprint": fingerprint,

        "summary": text_full[:2000],
        "content": paras,                 # ARRAY of paragraphs
        "contentImages": cimgs,           # [{index,url,alt}]
        "images": images,                 # gallery
        "thumbnail": thumb,

        "author": (entry.get("author") or feed.feed.get("author") or None),
        "source": source_title,
        "category": category,             # guessed if not obvious
        "tags": tags,

        "readTime": read_time,
        "publishedAt": published_iso,
        "featured": False,
        "genre": None,
        "type": None,
    }
    return story

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

    for url, cat_hint in selected:
        print("Feed:", url, "->", cat_hint)
        r = req_get(url, REQUEST_TIMEOUT)
        if not r:
            print("  fetch error -> skipped"); continue
        feed = feedparser.parse(r.content)
        if getattr(feed, "bozo", 0) and not getattr(feed, "entries", None):
            print("  Skipping (bozo/no entries)"); continue

        count = 0
        for e in feed.entries:
            if count >= MAX_ITEMS_PER_FEED: break
            doc = clean_one(feed, e)
            if not doc: continue

            # date filter
            if doc.get("publishedAt"):
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

        time.sleep(SLEEP_BETWEEN_FEEDS)

    if batch:
        post_batch(batch)
    print("Done.")

if __name__ == "__main__":
    main()
