from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime, timedelta

from agents.foundry_agent_client import FoundryAgentClient
from agents.prompts import build_planner_prompt


def _parse_iso(value: str) -> datetime:
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def _format_display_time(start: datetime, end: datetime) -> str:
    start_text = start.strftime("%I:%M %p").lstrip("0")
    end_text = end.strftime("%I:%M %p").lstrip("0")
    if start.strftime("%p") == end.strftime("%p"):
        start_text = start.strftime("%I:%M").lstrip("0")
    return f"{start_text}-{end_text}"


def _short_course_name(course: str) -> str:
    if ":" in course:
        return course.split(":", 1)[0].strip()
    return course


def _copy_slots(calendar_context: dict) -> list[dict]:
    copied = []
    for slot in calendar_context.get("freeSlots", []):
        copied.append(
            {
                **slot,
                "start": _parse_iso(slot["start"]),
                "end": _parse_iso(slot["end"]),
                "durationHours": float(slot["durationHours"]),
            }
        )
    return copied


def _allocate_block(slot: dict, duration_hours: float) -> tuple[datetime, datetime]:
    start = slot["start"]
    end = start + timedelta(hours=duration_hours)
    slot["start"] = end + timedelta(minutes=15)
    slot["durationHours"] = round(max((slot["end"] - slot["start"]).total_seconds() / 3600, 0.0), 2)
    return start, end


class PlannerAgent:
    def __init__(self, client: FoundryAgentClient) -> None:
        self.client = client

    def plan(self, assignment_context: dict, calendar_context: dict, preferences: dict) -> dict:
        prompt_payload = {
            "preferences": preferences,
            "assignment_context": assignment_context,
            "calendar_context": {
                "planningWindow": calendar_context.get("planningWindow", {}),
                "freeSlots": calendar_context.get("freeSlots", []),
            },
        }
        prompt = build_planner_prompt(prompt_payload)

        assignments = [dict(item) for item in assignment_context.get("assignments", [])]
        slots = _copy_slots(calendar_context)
        schedule_map: dict[str, list[dict]] = defaultdict(list)

        assignments.sort(key=lambda item: (-item["priorityScore"], item["dueDate"], item["course"], item["title"]))

        for assignment in assignments:
            remaining = float(assignment["estimatedHours"])
            start_date = assignment.get("startDate", calendar_context.get("planningWindow", {}).get("startDate"))
            due_date = assignment["dueDate"]

            eligible_slots = [
                slot for slot in slots
                if slot["durationHours"] > 0
                and slot["date"] >= start_date
                and slot["date"] <= due_date
            ]

            for slot in eligible_slots:
                if remaining <= 0:
                    break

                allocation = min(slot["durationHours"], remaining, 1.5)
                if allocation < 0.5:
                    continue

                start_dt, end_dt = _allocate_block(slot, allocation)
                schedule_map[slot["dayLabel"]].append(
                    {
                        "_sortStart": start_dt.isoformat(),
                        "time": _format_display_time(start_dt, end_dt),
                        "course": _short_course_name(assignment["course"]),
                        "assignment": assignment["title"],
                        "hours": round(allocation, 1),
                        "reason": assignment["reasoning"],
                    }
                )
                remaining = round(max(remaining - allocation, 0.0), 2)

            assignment["scheduledHours"] = round(float(assignment["estimatedHours"]) - remaining, 1)
            assignment["unscheduledHours"] = round(remaining, 1)

        planning_window = calendar_context.get("planningWindow", {})
        schedule = []
        if planning_window.get("startDate"):
            start_date = datetime.fromisoformat(planning_window["startDate"]).date()
            for offset in range(7):
                current_day = start_date + timedelta(days=offset)
                label = current_day.strftime("%a %b %d")
                sorted_blocks = sorted(
                    schedule_map.get(label, []),
                    key=lambda item: item.get("_sortStart", ""),
                )
                blocks = [
                    {key: value for key, value in block.items() if key != "_sortStart"}
                    for block in sorted_blocks
                ]
                schedule.append({"day": label, "blocks": blocks})

        hardest_course = ""
        if assignments:
            totals: dict[str, float] = defaultdict(float)
            for assignment in assignments:
                totals[assignment["course"]] += float(assignment["estimatedHours"])
            hardest_course = max(totals, key=totals.get)

        summary = {
            "totalAssignments": len(assignments),
            "totalHours": round(sum(float(item["estimatedHours"]) for item in assignments), 1),
            "hardestCourse": hardest_course,
            "studyBlocks": sum(len(day["blocks"]) for day in schedule),
        }

        return {
            "agent": "planner",
            "ready": self.client.is_configured(),
            "prompt": prompt,
            "summary": summary,
            "assignments": assignments,
            "schedule": schedule,
        }
