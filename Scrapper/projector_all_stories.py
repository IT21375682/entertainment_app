#!/usr/bin/env python3
import os
import time
import json
import hashlib
from typing import Any, Dict, List
from urllib.parse import urljoin
import requests

API_BASE = os.getenv("API_BASE", "http://localhost:5000")
STORIES_ENDPOINT = os.getenv("STORIES_ENDPOINT", "/api/stories")  # GET
MOVIES_BULK = os.getenv("MOVIES_BULK", "/api/movies/bulk")        # POST
BLOGS_BULK  = os.getenv("BLOGS_BULK",  "/api/blogs/bulk")         # POST
SPORTS_BULK = os.getenv("SPORTS_BULK", "/api/sports/bulk")        # POST

TIMEOUT = int(os.getenv("TIMEOUT", "30"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "100"))
MIN_BATCH  = int(os.getenv("MIN_BATCH", "10"))

UA = "projector/1.1 (+cron)"

def get_json(url: str, params: Dict[str, Any] | None = None) -> Any:
    r = requests.get(url, params=params or {}, headers={"User-Agent": UA}, timeout=TIMEOUT)
    r.raise_for_status()
    try:
        return r.json()
    except Exception as e:
        raise RuntimeError(f"Non-JSON at {url}: {r.text[:200]}") from e

def fetch_all_stories() -> List[Dict[str, Any]]:
    url = urljoin(API_BASE, STORIES_ENDPOINT)
    limit = 200
    offset = 0
    out: List[Dict[str, Any]] = []
    while True:
        params = {"limit": limit, "offset": offset}
        try:
            data = get_json(url, params=params)
        except Exception:
            try:
                raw = requests.get(url, params=params, headers={"User-Agent": UA}, timeout=TIMEOUT)
                print("DEBUG /api/stories:", raw.status_code, raw.text[:200])
            except Exception as e2:
                print("DEBUG /api/stories error:", repr(e2))
            raise
        if isinstance(data, list):
            out.extend(data); break
        items = (data or {}).get("items", [])
        out.extend(items)
        page = (data or {}).get("page", {})
        next_offset = page.get("nextOffset")
        if next_offset is None or not items: break
        offset = next_offset
    if not out:
        try:
            raw = requests.get(url, headers={"User-Agent": UA}, timeout=TIMEOUT)
            print("DEBUG (no params):", raw.status_code, raw.text[:300])
        except Exception as e:
            print("DEBUG fetch error:", repr(e))
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

def classify(story: Dict[str, Any]) -> List[str]:
    labels = set()
    cat = (story.get("category") or "").lower()
    tags = [t.lower() for t in (story.get("tags") or [])]
    genre = (story.get("genre") or "").lower()
    sport = (story.get("sport") or "").lower()
    stype = (story.get("type") or "").lower()
    source = (story.get("source") or "").lower()
    if cat in ("movies","movie","entertainment","film"): labels.add("movies")
    if cat in ("blogs","blog","opinion","culture","feature"): labels.add("blogs")
    if cat in ("sports","sport"): labels.add("sports")
    if any(t in tags for t in ("film","movie","cinema","tv")) or genre in {"action","drama","comedy","thriller"}:
        labels.add("movies")
    if any(t in tags for t in ("opinion","essay","blog")) or stype == "blog":
        labels.add("blogs")
    if sport or any(t in tags for t in ("football","soccer","tennis","cricket","nba","nfl","mlb","sport")):
        labels.add("sports")
    if not labels and "sport" in source: labels.add("sports")
    if not labels and ("entertainment" in source or "hollywood" in source): labels.add("movies")
    return list(labels)

def get_story_image(s: Dict[str, Any]) -> str | None:
    for key in ("image","thumbnail"):
        val = s.get(key)
        if isinstance(val, str) and val.strip(): return val.strip()
    imgs = s.get("images")
    if isinstance(imgs, list) and imgs:
        first = imgs[0]
        if isinstance(first, str) and first.strip(): return first.strip()
    cimgs = s.get("contentImages")
    if isinstance(cimgs, list) and cimgs:
        first = cimgs[0] or {}
        url = first.get("url") if isinstance(first, dict) else None
        if isinstance(url, str) and url.strip(): return url.strip()
    return None

def nonempty_images_list(s: Dict[str, Any]) -> bool:
    imgs = s.get("images")
    return isinstance(imgs, list) and any(isinstance(x, str) and x.strip() for x in imgs)

def allow_for_category(s: Dict[str, Any], label: str) -> bool:
    """
    Movies/Sports: require primary image AND non-empty images[].
    Blogs: require primary image; if images key exists and is [], skip.
    """
    primary = get_story_image(s)
    if not primary:
        return False
    if label in ("movies","sports"):
        return nonempty_images_list(s)  # strict
    # blogs
    if "images" in s and isinstance(s["images"], list) and len(s["images"]) == 0:
        return False
    return True

def to_movie_item(story: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reference_id": str(story["_id"]),
        "title": story.get("title"),
        "description": story.get("summary"),
        "content": split_paragraphs(story.get("content")),
        "contentImages": story.get("contentImages") or [],
        "images": story.get("images") or [],
        "thumbnail": get_story_image(story),
        "author": story.get("author"),
        "date": story.get("publishedAt"),
        "readTime": story.get("readTime"),
        "category": "Review" if "review" in (story.get("tags") or []) else "News",
        "tags": story.get("tags") or [],
        "featured": bool(story.get("featured", False)),
        "genre": story.get("genre"),
        "type": story.get("type") or "Movie",
    }

def to_blog_item(story: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reference_id": str(story["_id"]),
        "title": story.get("title"),
        "description": story.get("summary"),
        "content": split_paragraphs(story.get("content")),
        "contentImages": story.get("contentImages") or [],
        "image": get_story_image(story),
        "author": story.get("author"),
        "date": story.get("publishedAt"),
        "readTime": story.get("readTime"),
        "category": story.get("category") or "Blog",
        "tags": story.get("tags") or [],
        "comments": 0,
        "featured": bool(story.get("featured", False)),
        "type": story.get("type") or "Blog",
    }

def to_sport_item(story: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reference_id": str(story["_id"]),
        "title": story.get("title"),
        "description": story.get("summary"),
        "content": split_paragraphs(story.get("content")),
        "contentImages": story.get("contentImages") or [],
        "images": story.get("images") or [],
        "thumbnail": get_story_image(story),
        "author": story.get("author"),
        "date": story.get("publishedAt"),
        "readTime": story.get("readTime"),
        "category": story.get("category") or "News",
        "tags": story.get("tags") or [],
        "featured": bool(story.get("featured", False)),
        "sport": story.get("sport"),
        "type": story.get("type") or "News",
    }

def main():
    stories = fetch_all_stories()
    print(f"fetched {len(stories)} stories")

    movies_payload: List[Dict[str, Any]] = []
    blogs_payload: List[Dict[str, Any]]  = []
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
