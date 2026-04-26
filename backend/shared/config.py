from __future__ import annotations

import os
from dataclasses import dataclass


def _first_env(*names: str, default: str = "") -> str:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return default


@dataclass(frozen=True)
class Settings:
    project_endpoint: str
    model_deployment: str
    assignment_agent_id: str
    calendar_agent_id: str
    planner_agent_id: str
    allowed_origin: str

    @property
    def foundry_ready(self) -> bool:
        return bool(self.project_endpoint and self.model_deployment)


def load_settings() -> Settings:
    return Settings(
        project_endpoint=_first_env("AZURE_AI_PROJECT_ENDPOINT", "PROJECT_ENDPOINT"),
        model_deployment=_first_env(
            "AZURE_OPENAI_CHAT_DEPLOYMENT",
            "PROJECT_MODEL_DEPLOYMENT",
        ),
        assignment_agent_id=_first_env("ASSIGNMENT_AGENT_ID", "ASSIGNMENT_AGENT"),
        calendar_agent_id=_first_env("CALENDAR_AGENT_ID", "CALENDAR_AGENT"),
        planner_agent_id=_first_env("PLANNER_AGENT_ID", "PLANNER_AGENT"),
        allowed_origin=os.getenv("ALLOWED_ORIGIN", "http://localhost:5173"),
    )
