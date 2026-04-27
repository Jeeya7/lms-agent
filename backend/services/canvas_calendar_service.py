from __future__ import annotations

from services.ics_download_service import validate_ics_url
from tools.canvas_parser import parse_canvas_link


def parse_canvas_calendar(canvas_ics_url: str) -> dict:
    validated = validate_ics_url(canvas_ics_url, "canvas_ics_url")
    print(f"[canvas_calendar_service] URL received: {validated}")
    parsed = parse_canvas_link(validated)

    assignments: list[dict[str, str]] = []
    for assignment in parsed["assignments"]:
        assignments.append(
            {
                "title": assignment["title"],
                "course": assignment["course"],
                "due_at": assignment["due_at"],
                "description": assignment.get("description") or "Not specified",
                "source": "canvas",
                "uid": assignment.get("uid", ""),
                "source_url": validated,
            }
        )

    assignments.sort(key=lambda item: item["due_at"])
    if not assignments:
        raise ValueError("Canvas calendar contains no parsable assignment events.")

    courses = sorted({a["course"] for a in assignments if a["course"]})
    print(f"[canvas_calendar_service] parsed assignments: {len(assignments)}")

    return {
        "source": "canvas",
        "event_count": len(assignments),
        "courses": courses,
        "assignments": assignments,
    }
