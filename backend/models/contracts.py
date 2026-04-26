from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any


@dataclass
class AssignmentInput:
    title: str
    course: str
    due_date: str
    description: str = ""
    points_possible: float | None = None


@dataclass
class BusyBlock:
    title: str
    start: str
    end: str


@dataclass
class Preferences:
    confidence: str = "medium"
    latest_time: str = "22:00"
    days_early: int = 2
    max_hours: float | None = None

    @classmethod
    def from_dict(cls, payload: dict[str, Any] | None) -> "Preferences":
        payload = payload or {}
        max_hours = payload.get("maxHours")
        return cls(
            confidence=str(payload.get("confidence", "medium")),
            latest_time=str(payload.get("latestTime", "22:00")),
            days_early=int(payload.get("daysEarly", 2)),
            max_hours=float(max_hours) if max_hours not in ("", None) else None,
        )


@dataclass
class AssignmentPlan:
    id: int
    course: str
    title: str
    dueDate: str
    estimatedHours: float
    difficulty: str
    priorityScore: int
    reasoning: str


@dataclass
class StudyBlock:
    time: str
    course: str
    assignment: str
    hours: float
    reason: str


@dataclass
class ScheduleDay:
    day: str
    blocks: list[StudyBlock]


@dataclass
class PlanSummary:
    totalAssignments: int
    totalHours: float
    hardestCourse: str
    studyBlocks: int


@dataclass
class PlannerResponse:
    summary: PlanSummary
    assignments: list[AssignmentPlan]
    schedule: list[ScheduleDay]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def serialize_assignments(assignments: list[AssignmentInput]) -> list[dict[str, Any]]:
    return [asdict(assignment) for assignment in assignments]


def serialize_busy_blocks(blocks: list[BusyBlock]) -> list[dict[str, Any]]:
    return [asdict(block) for block in blocks]


def iso_to_date(value: str) -> str:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).date().isoformat()
