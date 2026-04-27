from __future__ import annotations

from models.contracts import AssignmentInput, iso_to_date
from tools.ics_fetcher import fetch_ics_from_url
from tools.ics_parser import parse_ics_events


def _infer_course_and_title(summary: str) -> tuple[str, str]:
    cleaned = summary.strip()

    if "[" in cleaned and cleaned.endswith("]"):
        title, course = cleaned.rsplit("[", 1)
        return course[:-1].strip() or "Unknown Course", title.strip()

    for delimiter in (" - ", " | ", ": "):
        if delimiter in cleaned:
            course, title = cleaned.split(delimiter, 1)
            if course.strip() and title.strip():
                return course.strip(), title.strip()

    return "Unknown Course", cleaned


def parse_canvas_assignments(ics_text: str) -> list[AssignmentInput]:
    """Backward-compatible parser for a single raw ICS payload."""
    assignments: list[AssignmentInput] = []

    for event in parse_ics_events(ics_text, source="canvas"):
        course, title = _infer_course_and_title(event["title"])
        due_date = iso_to_date(event["start"])
        assignments.append(
            AssignmentInput(
                title=title,
                course=course,
                due_date=due_date,
                description=event["description"],
            )
        )

    assignments.sort(key=lambda item: item.due_date)
    return assignments


def parse_canvas_link(canvas_link: str) -> dict[str, list[dict[str, str]]]:
    """Fetch and parse a Canvas ICS link into normalized assignment JSON."""
    if not (canvas_link or "").strip():
        raise ValueError("'canvas_link' must be a non-empty URL.")

    ics_text = fetch_ics_from_url(canvas_link)
    events = parse_ics_events(ics_text, source="canvas")

    assignments: list[dict[str, str]] = []
    for event in events:
        course, title = _infer_course_and_title(event["title"])
        assignments.append(
            {
                "course": course,
                "title": title,
                "due_at": event["start"],
                "description": event["description"],
                "source": "canvas",
                "uid": event["uid"],
            }
        )

    assignments.sort(key=lambda item: item.get("due_at", ""))
    return {"assignments": assignments}
