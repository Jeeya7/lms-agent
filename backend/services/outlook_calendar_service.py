from __future__ import annotations

from services.ics_download_service import validate_ics_url
from tools.outlook_parser import parse_outlook_links


def _dedupe_busy_events(events: list[dict[str, str]]) -> list[dict[str, str]]:
    deduped: dict[tuple[str, str, str], dict[str, str]] = {}
    for event in events:
        key = (event.get("title", ""), event.get("start", ""), event.get("end", ""))
        deduped[key] = event
    return list(deduped.values())


def parse_outlook_calendars(outlook_ics_urls: list[str]) -> dict:
    if not outlook_ics_urls:
        raise ValueError("'outlook_ics_urls' must include at least one URL.")

    validated_urls: list[str] = []
    for i, url in enumerate(outlook_ics_urls):
        validated = validate_ics_url(url, f"outlook_ics_urls[{i}]")
        print(f"[outlook_calendar_service] URL received: {validated}")
        validated_urls.append(validated)

    parsed = parse_outlook_links(validated_urls)
    merged = _dedupe_busy_events(parsed["busy_events"])
    if not merged:
        raise ValueError("Outlook calendar contains no parsable events.")

    merged.sort(key=lambda item: item.get("start", ""))
    print(f"[outlook_calendar_service] merged busy blocks: {len(merged)}")

    return {
        "source": "outlook",
        "event_count": len(merged),
        "busy_blocks": merged,
    }
