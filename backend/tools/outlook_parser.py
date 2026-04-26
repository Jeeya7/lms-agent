from __future__ import annotations

from models.contracts import BusyBlock
from tools.ics_parser import extract_events, parse_ics_datetime


def parse_outlook_busy_blocks(ics_text: str) -> list[BusyBlock]:
    busy_blocks: list[BusyBlock] = []

    for event in extract_events(ics_text):
        summary = event.get("SUMMARY", "Busy")
        start_raw = event.get("DTSTART") or event.get("DTSTART;VALUE=DATE")
        end_raw = event.get("DTEND") or event.get("DTEND;VALUE=DATE")

        if not start_raw or not end_raw:
            continue

        busy_blocks.append(
            BusyBlock(
                title=summary,
                start=parse_ics_datetime(start_raw),
                end=parse_ics_datetime(end_raw),
            )
        )

    return busy_blocks
