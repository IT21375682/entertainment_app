# image_resolver.py
import json, requests
from io import BytesIO
from urllib.parse import urljoin
from bs4 import BeautifulSoup

IMG_TIMEOUT = 12
MIN_BYTES = 15_000                    # ignore tiny icons
ACCEPT_TYPES = {"image/jpeg","image/jpg","image/png","image/webp"}

def _abs(url: str, base: str) -> str:
    try:
        return urljoin(base, url)
    except Exception:
        return url

def _is_image_content_type(ct: str | None) -> bool:
    if not ct:
        return False
    ct = ct.split(";")[0].strip().lower()
    return (ct in ACCEPT_TYPES) or ct.startswith("image/")

def _head_ok(url: str, ua: str) -> bool:
    try:
        r = requests.head(url, headers={"User-Agent": ua}, allow_redirects=True, timeout=IMG_TIMEOUT)
        ct = (r.headers.get("Content-Type") or "").lower()
        if not _is_image_content_type(ct):
            return False
        cl = r.headers.get("Content-Length")
        if cl and cl.isdigit() and int(cl) < MIN_BYTES:
            return False
        return True
    except Exception:
        return False

def _probe_dims(url: str, ua: str) -> tuple[int,int] | None:
    try:
        from PIL import Image  # optional; pip install pillow
        r = requests.get(url, headers={"User-Agent": ua}, stream=True, timeout=IMG_TIMEOUT)
        r.raise_for_status()
        data = BytesIO(r.content if len(r.content) < 2_000_000 else r.raw.read(1_000_000))
        im = Image.open(data)
        return im.size  # (w,h)
    except Exception:
        return None

def _first_meta(soup: BeautifulSoup, names: list[str]) -> str | None:
    for n in names:
        tag = soup.find("meta", attrs={"property": n}) or soup.find("meta", attrs={"name": n})
        if tag and tag.get("content"):
            return tag["content"].strip()
    return None

def _jsonld_images(soup: BeautifulSoup) -> list[str]:
    out = []
    for s in soup.find_all("script", attrs={"type":"application/ld+json"}):
        try:
            data = json.loads(s.string or "{}")
        except Exception:
            continue
        items = data if isinstance(data, list) else [data]
        for obj in items:
            img = obj.get("image")
            if isinstance(img, str):
                out.append(img)
            elif isinstance(img, dict) and img.get("url"):
                out.append(img["url"])
            elif isinstance(img, list):
                for v in img:
                    if isinstance(v, str):
                        out.append(v)
                    elif isinstance(v, dict) and v.get("url"):
                        out.append(v["url"])
    return out

def _article_imgs(soup: BeautifulSoup) -> list[str]:
    sels = [
        "figure img", ".hero img", ".headline img", ".lead img",
        "[class*='hero'] img", "[class*='lead'] img", "article img", "main img"
    ]
    seen, out = set(), []
    for sel in sels:
        for img in soup.select(sel):
            src = (img.get("src") or img.get("data-src") or img.get("data-original") or "").strip()
            if src and src not in seen:
                seen.add(src); out.append(src)
    if not out:
        for img in soup.find_all("img"):
            src = (img.get("src") or img.get("data-src") or img.get("data-original") or "").strip()
            if src and src not in seen:
                seen.add(src); out.append(src)
    return out

def _valid(url: str, ua: str) -> bool:
    if not url:
        return False
    low = url.lower()
    if low.endswith(".svg") or low.endswith(".gif"):
        return False
    if not _head_ok(url, ua):
        return False
    dims = _probe_dims(url, ua)
    if dims:
        w, h = dims
        if (w or 0) < 400 or (h or 0) < 250:
            return False
    return True

def resolve_best_image(html: str, page_url: str, ua: str) -> str | None:
    soup = BeautifulSoup(html or "", "lxml")

    meta = _first_meta(soup, ["og:image","twitter:image","twitter:image:src","image"])
    if meta:
        url = _abs(meta, page_url)
        if _valid(url, ua):
            return url

    for raw in _jsonld_images(soup):
        url = _abs(raw, page_url)
        if _valid(url, ua):
            return url

    for raw in _article_imgs(soup):
        url = _abs(raw, page_url)
        if _valid(url, ua):
            return url

    return None
