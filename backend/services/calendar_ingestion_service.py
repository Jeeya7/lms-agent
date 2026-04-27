from __future__ import annotations

from services.canvas_calendar_service import parse_canvas_calendar
from services.outlook_calendar_service import parse_outlook_calendars


def parse_all_calendars(canvas_ics_url: str, outlook_ics_urls: list[str]) -> dict:
    canvas = parse_canvas_calendar(canvas_ics_url)
    outlook = parse_outlook_calendars(outlook_ics_urls)

    return {
        "canvas": {
            "event_count": canvas["event_count"],
            "courses": canvas["courses"],
            "assignments": canvas["assignments"],
        },
        "outlook": {
            "event_count": outlook["event_count"],
            "busy_blocks": outlook["busy_blocks"],
        },
    }
