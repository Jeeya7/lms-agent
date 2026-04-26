from __future__ import annotations

from agents.assignment_agent import AssignmentAgent
from agents.calendar_agent import CalendarAgent
from agents.foundry_agent_client import FoundryAgentClient
from agents.planner_agent import PlannerAgent
from models.contracts import (
    AssignmentPlan,
    PlanSummary,
    PlannerResponse,
    Preferences,
    ScheduleDay,
    StudyBlock,
)
from shared.config import Settings
from tools.scheduling import build_planning_constraints


class PlannerService:
    def __init__(self, settings: Settings) -> None:
        client = FoundryAgentClient(settings)
        self.assignment_agent = AssignmentAgent(client)
        self.calendar_agent = CalendarAgent(client)
        self.planner_agent = PlannerAgent(client)

    def generate_demo_plan(self, preferences: Preferences) -> PlannerResponse:
        assignments = [
            AssignmentPlan(
                id=1,
                course="CS 4780: Machine Learning",
                title="Problem Set 4 - Backprop",
                dueDate="2026-04-29",
                estimatedHours=4.5,
                difficulty="hard",
                priorityScore=94,
                reasoning="Due soon and coding-heavy. Start early to leave debugging time.",
            ),
            AssignmentPlan(
                id=2,
                course="ECON 3210: Econometrics",
                title="Regression Lab Report",
                dueDate="2026-05-01",
                estimatedHours=3.5,
                difficulty="medium",
                priorityScore=78,
                reasoning="Writing plus analysis work. Split across two sessions.",
            ),
            AssignmentPlan(
                id=3,
                course="WRIT 2850: Technical Writing",
                title="Draft: API Documentation",
                dueDate="2026-05-02",
                estimatedHours=2.5,
                difficulty="easy",
                priorityScore=59,
                reasoning="Lower urgency, but worth placing before the weekend rush.",
            ),
        ]

        constraints = build_planning_constraints(preferences)
        self.assignment_agent.analyze([assignment.__dict__ for assignment in assignments], constraints)
        self.calendar_agent.analyze([], constraints)
        self.planner_agent.plan({}, {})

        schedule = [
            ScheduleDay(
                day="Mon Apr 27",
                blocks=[
                    StudyBlock(
                        time="3:00-5:00 PM",
                        course="CS 4780",
                        assignment="Problem Set 4 - Backprop",
                        hours=2.0,
                        reason="Highest-priority work goes into the first deep-focus block.",
                    )
                ],
            ),
            ScheduleDay(
                day="Tue Apr 28",
                blocks=[
                    StudyBlock(
                        time="2:00-3:30 PM",
                        course="ECON 3210",
                        assignment="Regression Lab Report",
                        hours=1.5,
                        reason="Afternoon window with lower conflict risk for writing and analysis.",
                    )
                ],
            ),
            ScheduleDay(
                day="Wed Apr 29",
                blocks=[
                    StudyBlock(
                        time="4:00-5:30 PM",
                        course="WRIT 2850",
                        assignment="Draft: API Documentation",
                        hours=1.5,
                        reason="Scheduled before the weekend to preserve buffer for revisions.",
                    )
                ],
            ),
        ]

        summary = PlanSummary(
            totalAssignments=len(assignments),
            totalHours=round(sum(item.estimatedHours for item in assignments), 1),
            hardestCourse="CS 4780: Machine Learning",
            studyBlocks=sum(len(day.blocks) for day in schedule),
        )

        return PlannerResponse(summary=summary, assignments=assignments, schedule=schedule)
