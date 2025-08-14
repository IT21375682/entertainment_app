#!/usr/bin/env python3
import os, re, time, json, hashlib, requests, feedparser
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta, timezone
from dateutil import parser as dateparse
from bs4 import BeautifulSoup
from readability import Document
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode, urljoin
from image_resolver import resolve_best_image

API_URL      = os.getenv("API_URL", "http://localhost:5000/api/stories/bulk")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "60"))
PAGE_TIMEOUT    = int(os.getenv("PAGE_TIMEOUT", "10"))
BATCH_SIZE      = int(os.getenv("BATCH_SIZE", "100"))
MIN_WORDS       = int(os.getenv("MIN_WORDS", "120"))
CUTOFF_DAYS     = int(os.getenv("CUTOFF_DAYS", "5"))
SLEEP_BETWEEN_FEEDS = float(os.getenv("SLEEP_BETWEEN_FEEDS", "0.25"))
MAX_ITEMS_PER_FEED  = int(os.getenv("MAX_ITEMS_PER_FEED", "20"))

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# Curated movie & sports RSS feeds (only these two categories)
MOVIE_FEEDS = [
    "https://variety.com/feed/",
    "https://www.hollywoodreporter.com/t/rss",
    "https://deadline.com/feed/",
    "https://www.indiewire.com/feed/",
    "https://screenrant.com/feed/",
    "https://ew.com/feeds/rss/",
]
SPORTS_FEEDS = [
    "https://feeds.reuters.com/reuters/sportsNews",
    "https://www.theguardian.com/sport/rss",
    "https://www.cbssports.com/rss/headlines/",
    "https://apnews.com/hub/apf-sports?utm_source=apnews.com&utm_medium=rss",  # AP sports RSS
    "https://www.espn.com/espn/rss/news",  # general ESPN news feed
]

URL_RE = re.compile(r"https?://[^\s<>\"']+", re.I)
TRACK_PARAMS = {"utm_source","utm_medium","utm_campaign","utm_term","utm_content","fbclid","gclid","mc_cid","mc_eid"}

def canonicalize_url(raw: str) -> str | None:
    if not raw: return None
    try:
        u = urlparse(raw)
        # strip trackers & fragments; lowercase host
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

def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html or "", "lxml")
    for t in soup(["script","style","noscript"]): t.extract()
    text = soup.get_text(separator=" ")
    return re.sub(r"\s+", " ", text).strip()

def split_paragraphs(text: str | None) -> List[str]:
    if not text: return []
    normalized = text.replace("\r\n", "\n")
    parts = [p.strip() for p in normalized.split("\n\n") if p.strip()]
    if len(parts) == 1:
        parts = [p.strip() for p in normalized.split("\n") if p.strip()]
    if len(parts) <= 1 and len(normalized.split()) > 120:
        words, chunk, out = normalized.split(), [], []
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

def fetch_text_and_html(url: str) -> Tuple[str | None, str | None]:
    html = fetch_page(url)
    if not html: return None, None
    try:
        doc = Document(html)
        content_html = doc.summary(html_partial=True)
        text = html_to_text(content_html)
        return (text or None), html
    except Exception:
        return None, html

def best_entry_content(entry) -> str:
    if hasattr(entry, "content"):
        try:
            parts = entry.content
            if parts and isinstance(parts, list) and parts[0].get("value"):
                return html_to_text(parts[0]["value"])
        except Exception: pass
    val = entry.get("summary") or entry.get("description")
    return html_to_text(val) if val else ""

def parse_date(entry):
    for key in ("published", "updated", "created"):
        val = getattr(entry, key, None) or entry.get(key)
        if val:
            try:
                dt = dateparse.parse(val)
                if dt and dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except Exception: pass
    return None

def clean_entry(feed, entry, category: str) -> Dict[str, Any] | None:
    """
    Build a story ONLY if:
      - we have enough text (>= MIN_WORDS), AND
      - we have an image (either from feed or resolved from the page).
    """
    link = entry.get("link")
    title = (entry.get("title") or "").strip()
    if not link or not title: return None

    text = best_entry_content(entry)
    html_cache = None
    if len(text.split()) < MIN_WORDS:
        text, html_cache = fetch_text_and_html(link)
        if not text or len(text.split()) < MIN_WORDS:
            return None

    content_arr = split_paragraphs(text)

    # Image: feed media first
    image = None
    try:
        if "media_content" in entry and entry.media_content:
            image = entry.media_content[0].get("url")
        if not image and "media_thumbnail" in entry and entry.media_thumbnail:
            image = entry.media_thumbnail[0].get("url")
    except Exception:
        pass

    # If no image, resolve from page HTML (required for this script)
    if not image:
        if not html_cache: html_cache = fetch_page(link)
        if html_cache:
            image = resolve_best_image(html_cache, link, UA)
    if not image:
        # hard requirement: skip imageless items
        return None

    source = (feed.feed.get("title") or feed.feed.get("link") or "").strip()
    guid = entry.get("id") or entry.get("guid")
    dt = parse_date(entry)
    published_iso = dt.isoformat() if dt else None

    canonical_url = canonicalize_url(link)
    fingerprint = make_fingerprint(source, guid or "", title, published_iso or "", canonical_url or "")

    summary = " ".join(content_arr)[:2000] if content_arr else text[:2000]

    return {
        "title": title[:250],
        "summary": summary,
        "content": content_arr,        # ARRAY of paragraphs
        "image": image,
        "link": link.strip(),
        "canonicalUrl": canonical_url,
        "source": source,
        "guid": guid,
        "fingerprint": fingerprint,
        "category": category,          # "movies" or "sports"
        "tags": [],
        "publishedAt": published_iso,
    }

def post_batch(items: List[Dict[str, Any]]):
    if not items: return
    try:
        resp = requests.post(API_URL, json={"items": items}, timeout=REQUEST_TIMEOUT)
        print("POST", len(items), "->", resp.status_code)
        if resp.status_code >= 400:
            print(resp.text[:500])
    except Exception as e:
        print("POST error:", e)

def ingest_feeds(feed_urls: List[str], category: str, cutoff: datetime) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for url in feed_urls:
        print(f"[{category}] {url}")
        try:
            r = requests.get(url, headers={"User-Agent": UA}, timeout=REQUEST_TIMEOUT)
            r.raise_for_status()
            feed = feedparser.parse(r.content)
            if feed.bozo and not getattr(feed, "entries", None):
                print("  Skipping (bozo/no entries)")
                continue

            count = 0
            for e in feed.entries:
                if count >= MAX_ITEMS_PER_FEED: break
                doc = clean_entry(feed, e, category)
                if not doc: continue

                # cutoff by published date
                if doc.get("publishedAt"):
                    try:
                        dt = dateparse.parse(doc["publishedAt"])
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=timezone.utc)
                        if dt < cutoff:
                            continue
                    except Exception:
                        pass

                out.append(doc)
                count += 1

        except requests.exceptions.Timeout:
            print("  Timeout -> skipped")
        except Exception as ex:
            print("  Error:", ex)

        time.sleep(SLEEP_BETWEEN_FEEDS)
    return out

def main():
    cutoff = datetime.now(timezone.utc) - timedelta(days=CUTOFF_DAYS)
    movies = ingest_feeds(MOVIE_FEEDS, "movies", cutoff)
    sports = ingest_feeds(SPORTS_FEEDS, "sports", cutoff)

    print(f"Collected: movies={len(movies)} sports={len(sports)}")

    # batch post (split if needed)
    batch, n = [], 0
    all_items = movies + sports
    for item in all_items:
        batch.append(item); n += 1
        if len(batch) >= BATCH_SIZE:
            post_batch(batch); batch = []
    if batch: post_batch(batch)
    print("Done.")

if __name__ == "__main__":
    main()
