from __future__ import annotations

from agents.foundry_agent_client import FoundryAgentClient


class AssignmentAgent:
    def __init__(self, client: FoundryAgentClient) -> None:
        self.client = client

    def analyze(self, assignments: list[dict], preferences: dict) -> dict:
        return {
            "agent": "assignment",
            "ready": self.client.is_configured(),
            "assignments": assignments,
            "preferences": preferences,
        }
