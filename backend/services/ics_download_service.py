from __future__ import annotations

from urllib.parse import urlparse

from tools.ics_fetcher import fetch_ics_from_url


def validate_ics_url(url: str, field_name: str) -> str:
    cleaned = (url or "").strip()
    if not cleaned:
        raise ValueError(f"'{field_name}' is required.")

    parsed = urlparse(cleaned)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError(f"'{field_name}' must be a valid http(s) URL.")
    if not parsed.path.lower().endswith(".ics"):
        raise ValueError(f"'{field_name}' must point to a URL ending in .ics.")

    return cleaned


def download_ics_text(url: str, field_name: str) -> str:
    validated = validate_ics_url(url, field_name)
    print(f"[ics_download_service] URL received for {field_name}: {validated}")
    return fetch_ics_from_url(validated)
