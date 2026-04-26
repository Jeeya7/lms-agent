from __future__ import annotations

from agents.foundry_agent_client import FoundryAgentClient


class CalendarAgent:
    def __init__(self, client: FoundryAgentClient) -> None:
        self.client = client

    def analyze(self, busy_blocks: list[dict], preferences: dict) -> dict:
        return {
            "agent": "calendar",
            "ready": self.client.is_configured(),
            "busyBlocks": busy_blocks,
            "preferences": preferences,
        }
