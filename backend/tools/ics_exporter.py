from __future__ import annotations

from datetime import datetime


def _normalize_day_to_date(day_label: str) -> str:
    parsed = datetime.strptime(f"{day_label} {datetime.utcnow().year}", "%a %b %d %Y")
    return parsed.strftime("%Y-%m-%d")


def _to_ics_timestamp(date_part: str, time_part: str) -> str:
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %I:%M %p"):
        try:
            parsed = datetime.strptime(f"{date_part} {time_part}", fmt)
            return parsed.strftime("%Y%m%dT%H%M%S")
        except ValueError:
            continue
    raise ValueError(f"Unsupported time format: {time_part}")


def _normalize_block_times(block: dict) -> tuple[str, str]:
    if "startTime" in block and "endTime" in block:
        return block["startTime"], block["endTime"]

    time_range = block.get("time", "")
    if "-" in time_range:
        start_time, end_time = time_range.split("-", 1)
        end_time = end_time.strip()
        if end_time.endswith(("AM", "PM")) and not start_time.strip().endswith(("AM", "PM")):
            meridiem = end_time[-2:]
            start_time = f"{start_time.strip()} {meridiem}"
        return start_time.strip(), end_time

    raise ValueError("Study block must include either startTime/endTime or a time range string.")


def export_schedule_to_ics(schedule: list[dict], calendar_name: str = "Study Planner") -> str:
    dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    chunks = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LMS Agent//Study Planner//EN",
        "CALSCALE:GREGORIAN",
        f"X-WR-CALNAME:{calendar_name}",
    ]

    for day in schedule:
        date_value = day.get("date") or _normalize_day_to_date(day.get("day", ""))
        for index, block in enumerate(day.get("blocks", []), start=1):
            start_time, end_time = _normalize_block_times(block)
            start = _to_ics_timestamp(date_value, start_time)
            end = _to_ics_timestamp(date_value, end_time)
            description = block.get("reason", "").replace("\n", "\\n")
            chunks.extend(
                [
                    "BEGIN:VEVENT",
                    f"UID:study-block-{date_value}-{index}@lms-agent",
                    f"DTSTAMP:{dtstamp}",
                    f"DTSTART:{start}",
                    f"DTEND:{end}",
                    f"SUMMARY:Study: {block['assignment']} [{block['course']}]",
                    f"DESCRIPTION:{description}",
                    "CATEGORIES:Study Block",
                    "END:VEVENT",
                ]
            )

    chunks.append("END:VCALENDAR")
    return "\r\n".join(chunks) + "\r\n"
