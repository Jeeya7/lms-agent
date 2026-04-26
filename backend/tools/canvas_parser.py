from __future__ import annotations

from models.contracts import AssignmentInput, iso_to_date
from tools.ics_parser import extract_events, parse_ics_datetime


def _split_course_from_summary(summary: str) -> tuple[str, str]:
    if "[" in summary and summary.endswith("]"):
        title, course = summary.rsplit("[", 1)
        return title.strip(), course[:-1].strip()
    return summary.strip(), "Unknown Course"


def parse_canvas_assignments(ics_text: str) -> list[AssignmentInput]:
    assignments: list[AssignmentInput] = []

    for event in extract_events(ics_text):
        uid = event.get("UID", "")
        summary = event.get("SUMMARY", "")
        description = event.get("DESCRIPTION", "")
        due_raw = (
            event.get("DTSTART")
            or event.get("DTSTART;VALUE=DATE")
            or event.get("DTEND")
            or event.get("DTEND;VALUE=DATE")
        )

        if "assignment" not in uid.lower() and "assignment" not in summary.lower():
            continue
        if not due_raw or not summary:
            continue

        title, course = _split_course_from_summary(summary)
        due_date = iso_to_date(parse_ics_datetime(due_raw))
        assignments.append(
            AssignmentInput(
                title=title,
                course=course,
                due_date=due_date,
                description=description,
            )
        )

    return assignments
