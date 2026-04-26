from __future__ import annotations

from shared.config import Settings


class FoundryAgentClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def is_configured(self) -> bool:
        return bool(
            self.settings.project_endpoint
            and self.settings.model_deployment
            and self.settings.assignment_agent_id
            and self.settings.calendar_agent_id
            and self.settings.planner_agent_id
        )

    def get_project_client(self):
        from azure.ai.projects import AIProjectClient
        from azure.identity import DefaultAzureCredential

        return AIProjectClient(
            endpoint=self.settings.project_endpoint,
            credential=DefaultAzureCredential(),
        )

    def invoke_agent(self, agent_id: str, payload: dict) -> dict:
        raise NotImplementedError(
            "Foundry agent invocation will be wired once the agent execution flow is finalized."
        )
