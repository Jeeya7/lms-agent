from __future__ import annotations

from datetime import datetime


def unfold_ics_lines(ics_text: str) -> list[str]:
    lines = ics_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    unfolded: list[str] = []
    for line in lines:
        if not line:
            unfolded.append(line)
            continue
        if line.startswith((" ", "\t")) and unfolded:
            unfolded[-1] += line[1:]
        else:
            unfolded.append(line)
    return unfolded


def extract_events(ics_text: str) -> list[dict[str, str]]:
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

        key, value = line.split(":", 1)
        current[key] = value

    return events


def parse_ics_datetime(value: str) -> str:
    for fmt in ("%Y%m%dT%H%M%SZ", "%Y%m%dT%H%M%S", "%Y%m%d"):
        try:
            parsed = datetime.strptime(value, fmt)
            return parsed.isoformat()
        except ValueError:
            continue
    return value
