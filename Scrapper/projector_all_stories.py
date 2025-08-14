#!/usr/bin/env python3
import os
import time
import json
import hashlib
from typing import Any, Dict, List, Iterable
from urllib.parse import urljoin


import requests

API_BASE = os.getenv("API_BASE", "http://localhost:5000")
STORIES_ENDPOINT = os.getenv("STORIES_ENDPOINT", "/api/stories")  # GET
MOVIES_BULK = os.getenv("MOVIES_BULK", "/api/movies/bulk")        # POST
BLOGS_BULK  = os.getenv("BLOGS_BULK",  "/api/blogs/bulk")         # POST
SPORTS_BULK = os.getenv("SPORTS_BULK", "/api/sports/bulk")        # POST

TIMEOUT = int(os.getenv("TIMEOUT", "30"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "100"))     # split further on 413
MIN_BATCH  = int(os.getenv("MIN_BATCH", "10"))

UA = "projector/1.0 (+cron)"

def get_json(url: str, params: Dict[str, Any] | None = None) -> Any:
    r = requests.get(url, params=params or {}, headers={"User-Agent": UA}, timeout=TIMEOUT)
    r.raise_for_status()
    try:
        return r.json()
    except Exception as e:
        raise RuntimeError(f"Non-JSON at {url}: {r.text[:200]}") from e

def fetch_all_stories() -> List[Dict[str, Any]]:
    """
    Fetch all stories. If your API supports pagination, adapt this to loop pages:
      /api/stories?limit=100&offset=0
    """
    url = urljoin(API_BASE, STORIES_ENDPOINT)
    data = get_json(url)
    if isinstance(data, dict) and "items" in data:
        return data["items"]
    if isinstance(data, list):
        return data
    raise RuntimeError("Unexpected stories payload shape; expected array or {items: [...]}")

def idempotency_key(payload: Any) -> str:
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(blob).hexdigest()

def post_bulk(endpoint: str, items: List[Dict[str, Any]]):
    """
    Post items in batches; split if server returns 413.
    """
    def _send(_items: List[Dict[str, Any]]):
        headers = {
            "Content-Type": "application/json",
            "User-Agent": UA,
            "Idempotency-Key": idempotency_key({"items": _items}),
        }
        resp = requests.post(urljoin(API_BASE, endpoint), json={"items": _items}, headers=headers, timeout=TIMEOUT)
        return resp

    n = len(items)
    if n == 0:
        return

    size = min(BATCH_SIZE, n)
    i = 0
    while i < n:
        chunk = items[i : i + size]
        resp = _send(chunk)
        if resp.status_code == 413 and size > MIN_BATCH:
            # Too large, split further for this window
            size = max(MIN_BATCH, size // 2)
            continue
        if resp.status_code in (200, 201, 207, 409):
            print(f"{endpoint}: sent {len(chunk)} -> {resp.status_code}")
            i += len(chunk)
            continue
        if resp.status_code >= 400:
            print(f"{endpoint}: error {resp.status_code} {resp.text[:300]}")
            # attempt one quick retry
            time.sleep(1)
            resp2 = _send(chunk)
            if resp2.status_code in (200, 201, 207, 409):
                print(f"{endpoint}: retry ok ({len(chunk)})")
                i += len(chunk)
                continue
            resp2.raise_for_status()
        else:
            i += len(chunk)

def split_paragraphs(text: str | None) -> List[str]:
    """
    Your category schemas expect content as [String]. Convert Story.content (str)
    into paragraphs. This is simple; tweak as needed.
    """
    if not text:
        return []
    # split on double newlines first; fallback to single
    parts = [p.strip() for p in text.replace("\r\n", "\n").split("\n\n")]
    if len(parts) == 1:
        parts = [p.strip() for p in text.split("\n")]
    return [p for p in parts if p]

def classify(story: Dict[str, Any]) -> List[str]:
    """
    Return any of: "movies", "blogs", "sports".
    Uses story['category'] primarily, falls back to tags/genre/sport/type.
    """
    labels = set()
    cat = (story.get("category") or "").lower()
    tags = [t.lower() for t in (story.get("tags") or [])]
    genre = (story.get("genre") or "").lower()
    sport = (story.get("sport") or "").lower()
    stype = (story.get("type") or "").lower()
    source = (story.get("source") or "").lower()

    if cat in ("movies", "movie", "entertainment", "film"):
        labels.add("movies")
    if cat in ("blogs", "blog", "opinion", "culture", "feature"):
        labels.add("blogs")
    if cat in ("sports", "sport"):
        labels.add("sports")

    if any(t in tags for t in ("film", "movie", "cinema", "tv")) or genre in {"action","drama","comedy","thriller"}:
        labels.add("movies")
    if any(t in tags for t in ("opinion","essay","blog")) or stype == "blog":
        labels.add("blogs")
    if sport or any(t in tags for t in ("football","soccer","tennis","cricket","nba","nfl","mlb","sport")):
        labels.add("sports")

    # If nothing matched but source hints:
    if not labels and "sport" in source:
        labels.add("sports")
    if not labels and ("entertainment" in source or "hollywood" in source):
        labels.add("movies")

    return list(labels)

def to_movie_item(story: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "reference_id": str(story["_id"]),              # idempotent key
        "title": story.get("title"),
        "description": story.get("summary"),
        "content": split_paragraphs(story.get("content")),
        "contentImages": story.get("contentImages") or [],
        "images": story.get("images") or [],
        "thumbnail": story.get("image") or story.get("thumbnail"),
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
        "image": story.get("image") or story.get("thumbnail"),
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
        "thumbnail": story.get("image") or story.get("thumbnail"),
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

    for s in stories:
        labels = classify(s)
        if "movies" in labels:
            movies_payload.append(to_movie_item(s))
        if "blogs" in labels:
            blogs_payload.append(to_blog_item(s))
        if "sports" in labels:
            sports_payload.append(to_sport_item(s))

    # send in batches (will split on 413 automatically)
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

if __name__ == "__main__":
    main()
