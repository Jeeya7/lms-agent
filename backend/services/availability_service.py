from __future__ import annotations

from datetime import datetime, timedelta


def _parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)


def build_study_blocks(
    assignments: list[dict],
    busy_blocks: list[dict],
    confidence_level: str = "medium",
) -> list[dict[str, str]]:
    if not assignments:
        return []

    duration_minutes = {
        "confused": 90,
        "low": 90,
        "medium": 60,
        "high": 45,
    }.get((confidence_level or "medium").lower(), 60)

    blocks: list[dict[str, str]] = []
    busy_ranges = [(_parse_iso(b["start"]), _parse_iso(b["end"])) for b in busy_blocks if b.get("start") and b.get("end")]

    for assignment in assignments:
        due = _parse_iso(assignment["due_at"])
        start_candidate = due - timedelta(days=1)
        block_start = start_candidate.replace(hour=16, minute=0, second=0, microsecond=0)
        block_end = block_start + timedelta(minutes=duration_minutes)

        for busy_start, busy_end in busy_ranges:
            if block_start < busy_end and block_end > busy_start:
                block_start = busy_end + timedelta(minutes=15)
                block_end = block_start + timedelta(minutes=duration_minutes)

        blocks.append(
            {
                "title": f"Study for {assignment['title']}",
                "start": block_start.isoformat(),
                "end": block_end.isoformat(),
                "description": "Work block generated from Canvas deadline and Outlook availability.",
            }
        )

    return blocks
