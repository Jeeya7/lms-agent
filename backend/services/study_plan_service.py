from __future__ import annotations

from collections import defaultdict
from datetime import datetime

from agents.assignment_agent import AssignmentAgent
from agents.calendar_agent import CalendarAgent
from agents.foundry_agent_client import FoundryAgentClient
from agents.planner_agent import PlannerAgent
from services.calendar_ingestion_service import parse_all_calendars
from shared.config import load_settings
from tools.ics_exporter import export_schedule_to_ics


def _normalized_preferences(preferences: dict | None, confidence_level: str | None = None) -> dict:
    return {
        "confidence": confidence_level or (preferences or {}).get("confidence") or "medium",
        "latestTime": (preferences or {}).get("latestTime") or "22:00",
        "daysEarly": int((preferences or {}).get("daysEarly", 2)),
        "maxHours": (preferences or {}).get("maxHours"),
    }


def build_study_plan_preview(
    canvas_ics_url: str,
    outlook_ics_urls: list[str],
    selected_course: str | None = None,
    confidence_level: str | None = None,
    preferences: dict | None = None,
) -> dict:
    parsed = parse_all_calendars(canvas_ics_url, outlook_ics_urls)

    return build_study_plan_from_inputs(
        canvas_assignments=parsed["canvas"]["assignments"],
        outlook_busy_blocks=parsed["outlook"]["busy_blocks"],
        selected_course=selected_course,
        preferences=_normalized_preferences(preferences, confidence_level),
    )


def build_study_plan_from_inputs(
    canvas_assignments: list[dict],
    outlook_busy_blocks: list[dict],
    selected_course: str | None = None,
    preferences: dict | None = None,
) -> dict:
    settings = load_settings()
    client = FoundryAgentClient(settings)
    assignment_agent = AssignmentAgent(client)
    calendar_agent = CalendarAgent(client)
    planner_agent = PlannerAgent(client)

    normalized_preferences = _normalized_preferences(preferences)

    assignment_result = assignment_agent.analyze(
        canvas_assignments,
        normalized_preferences,
        selected_course=selected_course,
    )

    planning_start_date = None
    if assignment_result["assignments"]:
        planning_start_date = min(item["startDate"] for item in assignment_result["assignments"])

    calendar_result = calendar_agent.analyze(
        outlook_busy_blocks,
        normalized_preferences,
        planning_start_date=planning_start_date,
    )

    planner_result = planner_agent.plan(
        assignment_result,
        calendar_result,
        normalized_preferences,
    )

    return {
        "summary": planner_result["summary"],
        "assignments": [
            {
                "id": index + 1,
                "course": item["course"],
                "title": item["title"],
                "dueDate": item["dueDate"],
                "estimatedHours": item["estimatedHours"],
                "difficulty": item["difficulty"],
                "priorityScore": item["priorityScore"],
                "reasoning": item["reasoning"],
            }
            for index, item in enumerate(planner_result["assignments"])
        ],
        "schedule": planner_result["schedule"],
        "selected_course": selected_course,
        "preferences": normalized_preferences,
        "agents": {
            "assignment": {
                "prompt": assignment_result["prompt"],
                "ignoredItems": assignment_result["ignoredItems"],
            },
            "calendar": {
                "prompt": calendar_result["prompt"],
                "planningWindow": calendar_result["planningWindow"],
            },
            "planner": {
                "prompt": planner_result["prompt"],
            },
        },
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
