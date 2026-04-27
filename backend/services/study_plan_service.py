from __future__ import annotations

from collections import defaultdict
from datetime import datetime

from services.availability_service import build_study_blocks
from services.calendar_ingestion_service import parse_all_calendars
from tools.ics_exporter import export_schedule_to_ics


def build_study_plan_preview(
    canvas_ics_url: str,
    outlook_ics_urls: list[str],
    selected_course: str | None = None,
    confidence_level: str | None = None,
) -> dict:
    parsed = parse_all_calendars(canvas_ics_url, outlook_ics_urls)

    assignments = parsed["canvas"]["assignments"]
    if selected_course:
        assignments = [a for a in assignments if a.get("course") == selected_course]

    busy_blocks = parsed["outlook"]["busy_blocks"]
    study_blocks = build_study_blocks(assignments, busy_blocks, confidence_level or "medium")

    return {
        "selected_course": selected_course,
        "confidence_level": confidence_level or "medium",
        "assignments_used": assignments,
        "busy_blocks_used": busy_blocks,
        "study_blocks": study_blocks,
    }


def export_preview_blocks_to_ics(study_blocks: list[dict]) -> str:
    if not study_blocks:
        raise ValueError("'study_blocks' must include at least one block.")

    grouped: dict[str, list[dict]] = defaultdict(list)

    for block in study_blocks:
        start = block.get("start", "")
        end = block.get("end", "")
        title = block.get("title", "Study Session")
        description = block.get("description", "")

        if not start or not end:
            raise ValueError("Each study block must include 'start' and 'end' ISO datetimes.")

        start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
        date_key = start_dt.date().isoformat()

        grouped[date_key].append(
            {
                "startTime": start_dt.strftime("%H:%M"),
                "endTime": end_dt.strftime("%H:%M"),
                "assignment": title,
                "course": "StudyPilot",
                "reason": description,
            }
        )

    schedule = [{"date": day, "blocks": blocks} for day, blocks in sorted(grouped.items())]
    return export_schedule_to_ics(schedule, calendar_name="StudyPilot Generated Plan")
