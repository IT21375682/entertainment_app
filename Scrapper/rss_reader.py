# ingest_rss.py
import os, re, time, requests, feedparser
from datetime import datetime, timedelta, timezone
from dateutil import parser as dateparse
from PyPDF2 import PdfReader
from bs4 import BeautifulSoup
from readability import Document

API_URL = os.getenv("API_URL", "http://localhost:5000/api/stories/bulk")
PDF_PATH = os.getenv("RSS_PDF", "rss-urls-1.pdf")

# ---------- knobs you can tweak ----------
CUTOFF_DAYS = 5
MAX_ITEMS_PER_FEED = 20         # reduce if still too many
BATCH_SIZE = 100                # reduce if you still see 413
REQUEST_TIMEOUT = 60            # per-feed timeout (you asked for 60s)
PAGE_TIMEOUT = 10               # HTML fetch timeout for full text
MIN_WORDS = 120                 # skip anything with fewer words
SLEEP_BETWEEN_FEEDS = 0.2
# ----------------------------------------

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
    # fallbacks by path keywords
    if "/sport" in lu or "sports" in lu:     return "sports"
    if "entertainment" in lu or "movies" in lu or "film" in lu: return "movies"
    if "blog" in lu:                          return "blogs"
    return None

def word_count(s: str) -> int:
    return len((s or "").strip().split())

def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html or "", "lxml")
    # remove script/style
    for t in soup(["script","style","noscript"]):
        t.extract()
    text = soup.get_text(separator=" ")
    # collapse whitespace
    return re.sub(r"\s+", " ", text).strip()

def fetch_fulltext(url: str) -> str | None:
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=PAGE_TIMEOUT)
        r.raise_for_status()
        # Use readability to extract the main article
        doc = Document(r.text)
        content_html = doc.summary(html_partial=True)
        text = html_to_text(content_html)
        return text or None
    except Exception:
        return None

def best_entry_content(entry) -> str:
    # 1) entry.content (full text on many feeds)
    if hasattr(entry, "content"):
        try:
            parts = entry.content
            if parts and isinstance(parts, list) and parts[0].get("value"):
                return html_to_text(parts[0]["value"])
        except Exception:
            pass
    # 2) summary/description
    val = entry.get("summary") or entry.get("description")
    if val:
        return html_to_text(val)
    return ""

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

    # try to get content without fetching page
    text = best_entry_content(entry)
    if word_count(text) < MIN_WORDS:
        # fetch the article and extract main text
        fulltext = fetch_fulltext(link)
        if fulltext and word_count(fulltext) >= MIN_WORDS:
            text = fulltext
        else:
            # still no meaningful content -> skip
            return None

    # pick an image if available
    image = None
    try:
        if "media_content" in entry and entry.media_content:
            image = entry.media_content[0].get("url")
        if not image and "media_thumbnail" in entry and entry.media_thumbnail:
            image = entry.media_thumbnail[0].get("url")
    except Exception:
        pass

    source = (feed.feed.get("title") or feed.feed.get("link") or "").strip()

    dt = parse_date(entry)
    published_iso = dt.isoformat() if dt else None

    # trim big fields
    if len(text) > 10000:
        text = text[:10000] + "…"

    return {
        "title": title[:250],
        "link": link.strip(),
        "summary": text[:2000],      # short preview (optional)
        "content": text,             # full extracted text
        "image": image,
        "source": source,
        "category": category,        # 'sports' | 'movies' | 'blogs'
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
