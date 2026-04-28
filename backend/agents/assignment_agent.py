from __future__ import annotations

from datetime import UTC, datetime, timedelta

from agents.foundry_agent_client import FoundryAgentClient
from agents.prompts import build_assignment_prompt

ASSIGNMENT_KEYWORDS = (
    "assignment",
    "homework",
    "problem set",
    "pset",
    "quiz",
    "lab",
    "essay",
    "paper",
    "project",
    "reading",
    "discussion",
    "presentation",
    "exam",
    "midterm",
    "final",
    "report",
    "draft",
    "peer review",
    "worksheet",
    "post",
)

IGNORE_HINTS = (
    "notification",
    "reminder",
    "announcement",
    "office hours",
    "registration",
    "advising",
    "meeting",
    "event",
)


def _now_utc() -> datetime:
    return datetime.now(UTC)


def _parse_due(value: str) -> datetime:
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def _contains_any(text: str, keywords: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in keywords)


def _course_is_known(course: str) -> bool:
    return bool(course and course.strip() and course.strip().lower() != "unknown course")


def _looks_like_assignment(title: str, description: str) -> bool:
    return _contains_any(f"{title} {description}", ASSIGNMENT_KEYWORDS)


def _should_ignore(item: dict) -> bool:
    course = str(item.get("course", "")).strip()
    title = str(item.get("title", "")).strip()
    description = str(item.get("description", "")).strip()
    combined = f"{title} {description}"

    if _contains_any(combined, IGNORE_HINTS) and not _looks_like_assignment(title, description):
        return True

    return not _course_is_known(course) and not _looks_like_assignment(title, description)


def _base_hours(title: str, description: str) -> float:
    combined = f"{title} {description}".lower()
    if _contains_any(combined, ("exam", "midterm", "final", "project", "presentation")):
        return 4.0
    if _contains_any(combined, ("essay", "paper", "lab", "report", "problem set", "homework")):
        return 3.0
    if _contains_any(combined, ("reading", "discussion", "peer review", "draft")):
        return 1.5
    if _contains_any(combined, ("quiz", "worksheet", "post")):
        return 1.0
    return 2.0


def _description_bonus(description: str) -> float:
    length = len(description.strip())
    if length >= 900:
        return 1.0
    if length >= 300:
        return 0.5
    return 0.0


def _confidence_multiplier(confidence: str) -> float:
    return {
        "low": 1.35,
        "medium": 1.0,
        "high": 0.85,
    }.get((confidence or "medium").lower(), 1.0)


def _difficulty_for_hours(hours: float) -> str:
    if hours >= 4.0:
        return "hard"
    if hours >= 2.0:
        return "medium"
    return "easy"


def _priority_score(due_at: datetime, estimated_hours: float) -> int:
    now = _now_utc()
    days_until_due = max((due_at - now).total_seconds() / 86400, 0.0)
    urgency = max(0.0, 1.0 - min(days_until_due, 14.0) / 14.0)
    difficulty_weight = min(estimated_hours / 5.0, 1.0)
    return max(1, min(99, round((urgency * 70) + (difficulty_weight * 30))))


def _reasoning(due_at: datetime, estimated_hours: float, difficulty: str) -> str:
    days = max((due_at.date() - _now_utc().date()).days, 0)
    if days == 0:
        due_phrase = "Due today."
    elif days == 1:
        due_phrase = "Due tomorrow."
    else:
        due_phrase = f"Due in {days} days."
    return f"{due_phrase} Estimated at about {estimated_hours:.1f} hours with {difficulty} workload."


class AssignmentAgent:
    def __init__(self, client: FoundryAgentClient) -> None:
        self.client = client

    def analyze(
        self,
        assignments: list[dict],
        preferences: dict,
        selected_course: str | None = None,
    ) -> dict:
        prompt_payload = {
            "selected_course": selected_course,
            "preferences": preferences,
            "assignments": assignments,
        }
        prompt = build_assignment_prompt(prompt_payload)

        kept_items: list[dict] = []
        ignored_items: list[dict] = []

        for raw_item in assignments:
            item = dict(raw_item)

            if selected_course and item.get("course") != selected_course:
                ignored_items.append(
                    {
                        "title": item.get("title", "Untitled"),
                        "course": item.get("course", "Unknown Course"),
                        "reason": f"Filtered out because the selected course is {selected_course}.",
                    }
                )
                continue

            if _should_ignore(item):
                ignored_items.append(
                    {
                        "title": item.get("title", "Untitled"),
                        "course": item.get("course", "Unknown Course"),
                        "reason": "Ignored because it does not appear to be a real course assignment.",
                    }
                )
                continue

            due_at = _parse_due(item["due_at"])
            estimated_hours = round(
                (
                    _base_hours(item.get("title", ""), item.get("description", ""))
                    + _description_bonus(item.get("description", ""))
                )
                * _confidence_multiplier(str(preferences.get("confidence", "medium"))),
                1,
            )
            difficulty = _difficulty_for_hours(estimated_hours)
            priority_score = _priority_score(due_at, estimated_hours)
            start_date = max(
                _now_utc().date(),
                (due_at - timedelta(days=int(preferences.get("daysEarly", 2) or 2))).date(),
            )

            kept_items.append(
                {
                    "course": item.get("course", "Unknown Course"),
                    "title": item.get("title", "Untitled"),
                    "dueDate": due_at.date().isoformat(),
                    "dueAt": due_at.isoformat(),
                    "estimatedHours": estimated_hours,
                    "difficulty": difficulty,
                    "priorityScore": priority_score,
                    "reasoning": _reasoning(due_at, estimated_hours, difficulty),
                    "description": item.get("description", ""),
                    "startDate": start_date.isoformat(),
                    "source": item.get("source", "canvas"),
                    "uid": item.get("uid", ""),
                }
            )

        kept_items.sort(key=lambda item: (-item["priorityScore"], item["dueDate"], item["course"], item["title"]))
        return {
            "agent": "assignment",
            "ready": self.client.is_configured(),
            "prompt": prompt,
            "assignments": kept_items,
            "ignoredItems": ignored_items,
            "preferences": preferences,
        }
