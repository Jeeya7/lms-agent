from __future__ import annotations

from datetime import UTC, datetime
from hashlib import sha1
from typing import Literal, TypedDict


class NormalizedCalendarEvent(TypedDict):
    title: str
    start: str
    end: str
    description: str
    location: str
    source: Literal["outlook", "canvas"]
    uid: str


def unfold_ics_lines(ics_text: str) -> list[str]:
    """Unfold RFC5545 folded lines into single logical lines."""
    lines = ics_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    unfolded: list[str] = []
    for line in lines:
        if line.startswith((" ", "\t")) and unfolded:
            unfolded[-1] += line[1:]
        else:
            unfolded.append(line)
    return unfolded


def _normalize_ics_key(raw_key: str) -> str:
    return raw_key.split(";", 1)[0].strip().upper()


def _decode_ics_text(value: str) -> str:
    return (
        value.replace("\\n", "\n")
        .replace("\\,", ",")
        .replace("\\;", ";")
        .replace("\\\\", "\\")
        .strip()
    )


def _parse_ics_datetime_value(value: str) -> str:
    value = value.strip()
    for fmt in ("%Y%m%dT%H%M%SZ", "%Y%m%dT%H%M%S", "%Y%m%d"):
        try:
            parsed = datetime.strptime(value, fmt)
            if fmt.endswith("Z"):
                parsed = parsed.replace(tzinfo=UTC)
            return parsed.isoformat()
        except ValueError:
            continue
    return value


def _compute_uid(raw_event: dict[str, str], title: str, start: str, end: str) -> str:
    existing_uid = raw_event.get("UID", "").strip()
    if existing_uid:
        return existing_uid

    digest = sha1(f"{title}|{start}|{end}".encode("utf-8")).hexdigest()
    return digest


def extract_events(ics_text: str) -> list[dict[str, str]]:
    """Extract VEVENT blocks into simple key-value dictionaries."""
    events: list[dict[str, str]] = []
    current: dict[str, str] | None = None

    for raw_line in unfold_ics_lines(ics_text):
        line = raw_line.strip()
        if line == "BEGIN:VEVENT":
            current = {}
            continue

        if line == "END:VEVENT":
            if current is not None:
                events.append(current)
            current = None
            continue

        if current is None or ":" not in line:
            continue

        raw_key, value = line.split(":", 1)
        key = _normalize_ics_key(raw_key)
        if key not in current:
            current[key] = value

    return events


def parse_ics_events(ics_text: str, source: Literal["outlook", "canvas"]) -> list[NormalizedCalendarEvent]:
    """Parse ICS text into normalized calendar event objects."""
    normalized: list[NormalizedCalendarEvent] = []

    for raw_event in extract_events(ics_text):
        start_raw = raw_event.get("DTSTART") or raw_event.get("DUE")
        end_raw = raw_event.get("DTEND") or start_raw
        if not start_raw or not end_raw:
            continue

        title = _decode_ics_text(raw_event.get("SUMMARY", "Untitled"))
        start = _parse_ics_datetime_value(start_raw)
        end = _parse_ics_datetime_value(end_raw)
        description = _decode_ics_text(raw_event.get("DESCRIPTION", ""))
        location = _decode_ics_text(raw_event.get("LOCATION", ""))

        normalized.append(
            {
                "title": title,
                "start": start,
                "end": end,
                "description": description,
                "location": location,
                "source": source,
                "uid": _compute_uid(raw_event, title, start, end),
            }
        )

    return normalized


def parse_ics_datetime(value: str) -> str:
    """Backward-compatible wrapper used by older parsers."""
    return _parse_ics_datetime_value(value)
