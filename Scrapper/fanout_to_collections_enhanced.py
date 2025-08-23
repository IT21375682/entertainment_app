# fanout_to_collections_enhanced.py
#!/usr/bin/env python3
import os, time, json, hashlib, re
from typing import Any, Dict, List
from urllib.parse import urljoin
import requests

API_BASE        = os.getenv("API_BASE", "http://localhost:5000")
STORIES_ENDPOINT= os.getenv("STORIES_ENDPOINT", "/api/stories")     # GET
MOVIES_BULK     = os.getenv("MOVIES_BULK",     "/api/movies/bulk")  # POST
BLOGS_BULK      = os.getenv("BLOGS_BULK",      "/api/blogs/bulk")   # POST
SPORTS_BULK     = os.getenv("SPORTS_BULK",     "/api/sports/bulk")  # POST

TIMEOUT   = int(os.getenv("TIMEOUT", "30"))
BATCH_SIZE= int(os.getenv("BATCH_SIZE", "100"))
MIN_BATCH = int(os.getenv("MIN_BATCH", "10"))

UA = "projector/1.2 (+cron)"

SPORTS_CUES = {"sport","sports","football","soccer","cricket","tennis","nba","nfl","mlb","f1","formula","golf","ipl","uefa","olympic"}
MOVIE_CUES  = {"entertainment","movie","movies","film","hollywood","bollywood","tv","series","showbiz","box-office","trailer","review","casting"}
BLOG_CUES   = {"blog","opinion","analysis","essay","column","feature"}

def get_json(url: str, params=None) -> Any:
    r = requests.get(url, params=params or {}, headers={"User-Agent": UA}, timeout=TIMEOUT)
    r.raise_for_status()
    try:
        return r.json()
    except Exception as e:
        raise RuntimeError(f"Non-JSON at {url}: {r.text[:200]}") from e

def fetch_all_stories() -> List[Dict[str, Any]]:
    url = urljoin(API_BASE, STORIES_ENDPOINT)
    limit, offset = 200, 0
    out: List[Dict[str, Any]] = []
    while True:
        data = get_json(url, params={"limit": limit, "offset": offset})
        if isinstance(data, list):
            out.extend(data); break
        items = (data or {}).get("items", [])
        out.extend(items)
        page = (data or {}).get("page", {})
        next_offset = page.get("nextOffset")
        if next_offset is None or not items: break
        offset = next_offset
    return out

def idempotency_key(payload: Any) -> str:
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(blob).hexdigest()

def post_bulk(endpoint: str, items: List[Dict[str, Any]]):
    def _send(_items: List[Dict[str, Any]]):
        headers = {
            "Content-Type": "application/json",
            "User-Agent": UA,
            "Idempotency-Key": idempotency_key({"items": _items}),
        }
        return requests.post(urljoin(API_BASE, endpoint), json={"items": _items}, headers=headers, timeout=TIMEOUT)

    n = len(items)
    if n == 0: return
    size = min(BATCH_SIZE, n)
    i = 0
    while i < n:
        chunk = items[i : i + size]
        resp = _send(chunk)
        if resp.status_code == 413 and size > MIN_BATCH:
            size = max(MIN_BATCH, size // 2); continue
        if resp.status_code in (200, 201, 207, 409):
            print(f"{endpoint}: sent {len(chunk)} -> {resp.status_code}")
            i += len(chunk); continue
        if resp.status_code >= 400:
            print(f"{endpoint}: error {resp.status_code} {resp.text[:300]}")
            time.sleep(1)
            resp2 = _send(chunk)
            if resp2.status_code in (200, 201, 207, 409):
                print(f"{endpoint}: retry ok ({len(chunk)})")
                i += len(chunk); continue
            resp2.raise_for_status()
        else:
            i += len(chunk)

def split_paragraphs(text_or_array) -> List[str]:
    if not text_or_array: return []
    if isinstance(text_or_array, list):
        return [str(p).strip() for p in text_or_array if str(p).strip()]
    text = str(text_or_array)
    parts = [p.strip() for p in text.replace("\r\n","\n").split("\n\n") if p.strip()]
    if len(parts) == 1:
        parts = [p.strip() for p in text.split("\n") if p.strip()]
    return parts

def get_primary_image(s: Dict[str, Any]) -> str | None:
    for key in ("thumbnail","image"):
        val = s.get(key)
        if isinstance(val, str) and val.strip(): return val.strip()
    imgs = s.get("images")
    if isinstance(imgs, list):
        for v in imgs:
            if isinstance(v, str) and v.strip(): return v.strip()
    cimgs = s.get("contentImages")
    if isinstance(cimgs, list):
        for v in cimgs:
            if isinstance(v, dict) and v.get("url"):
                return v["url"].strip()
    return None

def has_gallery(s: Dict[str, Any]) -> bool:
    imgs = s.get("images")
    return isinstance(imgs, list) and any(isinstance(x, str) and x.strip() for x in imgs)

def classify(story: Dict[str, Any]) -> List[str]:
    labels = set()
    cat = (story.get("category") or "").lower()
    if cat in {"movies","movie","entertainment","film"}: labels.add("movies")
    if cat in {"blogs","blog","opinion","feature","analysis"}: labels.add("blogs")
    if cat in {"sports","sport"}: labels.add("sports")

    text = f"{story.get('title','')} {story.get('summary','')} {' '.join(story.get('tags',[]))}".lower()
    if not labels and any(k in text for k in SPORTS_CUES): labels.add("sports")
    if not labels and any(k in text for k in MOVIE_CUES):  labels.add("movies")
    if not labels and any(k in text for k in BLOG_CUES):   labels.add("blogs")

    source = (story.get("source") or "").lower()
    if not labels and "sport" in source: labels.add("sports")
    if not labels and any(k in source for k in ("entertainment","hollywood","bollywood")): labels.add("movies")
    return list(labels)

def allow_for_category(s: Dict[str, Any], label: str) -> bool:
    primary = get_primary_image(s)
    if not primary:
        return False
    if label in ("movies","sports"):
        return has_gallery(s)
    # blogs: allow without gallery
    if "images" in s and isinstance(s["images"], list) and len(s["images"]) == 0:
        return False
    return True

def coerce_content_images(arr) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    if not isinstance(arr, list): return out
    for x in arr:
        if isinstance(x, dict) and x.get("url") is not None:
            idx = x.get("index")
            try:
                idx = int(idx)
            except Exception:
                idx = 0
            out.append({"index": idx, "url": str(x.get("url")).strip(), "alt": str(x.get("alt") or "").strip()})
    return out

def to_movie_item(s: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reference_id": str(s.get("_id", s.get("fingerprint",""))),
        "title": s.get("title"),
        "description": s.get("summary"),
        "content": split_paragraphs(s.get("content")),
        "contentImages": coerce_content_images(s.get("contentImages")),

        "images": s.get("images") or [],
        "thumbnail": get_primary_image(s),

        "author": s.get("author"),
        "date": s.get("publishedAt"),
        "readTime": s.get("readTime"),
        "category": "Review" if "review" in [t.lower() for t in (s.get("tags") or [])] else "News",
        "tags": s.get("tags") or [],

        "featured": bool(s.get("featured", False)),
        "genre": s.get("genre"),
        "type": s.get("type") or "Movie",
    }

def to_blog_item(s: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reference_id": str(s.get("_id", s.get("fingerprint",""))),
        "title": s.get("title"),
        "description": s.get("summary"),
        "content": split_paragraphs(s.get("content")),
        "contentImages": coerce_content_images(s.get("contentImages")),

        "image": get_primary_image(s),

        "author": s.get("author"),
        "date": s.get("publishedAt"),
        "readTime": s.get("readTime"),
        "category": s.get("category") or "Blog",
        "tags": s.get("tags") or [],
        "comments": 0,
        "featured": bool(s.get("featured", False)),
        "type": s.get("type") or "Blog",
    }

def to_sport_item(s: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reference_id": str(s.get("_id", s.get("fingerprint",""))),
        "title": s.get("title"),
        "description": s.get("summary"),
        "content": split_paragraphs(s.get("content")),
        "contentImages": coerce_content_images(s.get("contentImages")),

        "images": s.get("images") or [],
        "thumbnail": get_primary_image(s),

        "author": s.get("author"),
        "date": s.get("publishedAt"),
        "readTime": s.get("readTime"),
        "category": s.get("category") or "News",
        "tags": s.get("tags") or [],
        "featured": bool(s.get("featured", False)),
        "sport": s.get("sport"),
        "type": s.get("type") or "News",
    }

def main():
    stories = fetch_all_stories()
    print(f"fetched {len(stories)} stories")

    movies_payload: List[Dict[str, Any]] = []
    blogs_payload:  List[Dict[str, Any]] = []
    sports_payload: List[Dict[str, Any]] = []

    skipped = {"movies":0, "blogs":0, "sports":0, "unlabeled":0}

    for s in stories:
        labels = classify(s)
        if not labels:
            skipped["unlabeled"] += 1
            continue

        if "movies" in labels and allow_for_category(s, "movies"):
            movies_payload.append(to_movie_item(s))
        elif "movies" in labels:
            skipped["movies"] += 1

        if "blogs" in labels and allow_for_category(s, "blogs"):
            blogs_payload.append(to_blog_item(s))
        elif "blogs" in labels:
            skipped["blogs"] += 1

        if "sports" in labels and allow_for_category(s, "sports"):
            sports_payload.append(to_sport_item(s))
        elif "sports" in labels:
            skipped["sports"] += 1

    if movies_payload:
        post_bulk(MOVIES_BULK, movies_payload)
    if blogs_payload:
        post_bulk(BLOGS_BULK, blogs_payload)
    if sports_payload:
        post_bulk(SPORTS_BULK, sports_payload)

    print("done:",
          f"{len(movies_payload)} movies,",
          f"{len(blogs_payload)} blogs,",
          f"{len(sports_payload)} sports")
    print("skipped:", skipped)

if __name__ == "__main__":
    main()
