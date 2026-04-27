from __future__ import annotations

from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def _validate_url(url: str) -> str:
    cleaned = (url or "").strip()
    if not cleaned:
        raise ValueError("ICS URL is required.")

    parsed = urlparse(cleaned)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("ICS URL must be a valid http(s) URL.")

    return cleaned


def fetch_ics_from_url(url: str) -> str:
    """Download raw ICS text from a remote URL.

    Raises:
        ValueError: Invalid or empty URL, or non-ICS response payload.
        RuntimeError: Network and HTTP download issues.
    """
    validated_url = _validate_url(url)
    request = Request(validated_url, headers={"User-Agent": "StudyPilot/1.0"})

    try:
        with urlopen(request, timeout=20) as response:
            payload = response.read()
    except HTTPError as exc:
        raise RuntimeError(f"Failed to fetch ICS URL (HTTP {exc.code}).") from exc
    except URLError as exc:
        raise RuntimeError(f"Failed to fetch ICS URL ({exc.reason}).") from exc

    try:
        text = payload.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = payload.decode("latin-1")

    if "BEGIN:VCALENDAR" not in text:
        raise ValueError("Response does not appear to be valid ICS data.")

    return text
