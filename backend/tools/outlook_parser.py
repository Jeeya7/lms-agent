from __future__ import annotations

from models.contracts import BusyBlock
from tools.ics_fetcher import fetch_ics_from_url
from tools.ics_parser import parse_ics_events


def parse_outlook_busy_blocks(ics_text: str) -> list[BusyBlock]:
    """Backward-compatible parser for a single raw ICS payload."""
    busy_blocks: list[BusyBlock] = []

    for event in parse_ics_events(ics_text, source="outlook"):
        busy_blocks.append(
            BusyBlock(
                title=event["title"],
                start=event["start"],
                end=event["end"],
            )
        )

    return busy_blocks


def _event_key(event: dict[str, str]) -> tuple[str, str, str, str]:
    return (
        event.get("title", ""),
        event.get("start", ""),
        event.get("end", ""),
        event.get("location", ""),
    )


def parse_outlook_links(outlook_links: list[str]) -> dict[str, list[dict[str, str]]]:
    """Fetch and parse multiple Outlook ICS links into one busy event list."""
    if not outlook_links:
        raise ValueError("'outlook_links' must include at least one URL.")

    all_events: list[dict[str, str]] = []
    for link in outlook_links:
        ics_text = fetch_ics_from_url(link)
        all_events.extend(parse_ics_events(ics_text, source="outlook"))

    deduped: dict[tuple[str, str, str, str], dict[str, str]] = {}
    for event in all_events:
        deduped[_event_key(event)] = event

    busy_events = sorted(deduped.values(), key=lambda item: item.get("start", ""))
    return {"busy_events": busy_events}
