from __future__ import annotations

from agents.foundry_agent_client import FoundryAgentClient


class PlannerAgent:
    def __init__(self, client: FoundryAgentClient) -> None:
        self.client = client

    def plan(self, assignment_context: dict, calendar_context: dict) -> dict:
        return {
            "agent": "planner",
            "ready": self.client.is_configured(),
            "assignmentContext": assignment_context,
            "calendarContext": calendar_context,
        }
