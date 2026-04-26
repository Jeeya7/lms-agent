from __future__ import annotations

from models.contracts import Preferences


def build_planning_constraints(preferences: Preferences) -> dict:
    return {
        "confidence": preferences.confidence,
        "latestTime": preferences.latest_time,
        "daysEarly": preferences.days_early,
        "maxHours": preferences.max_hours,
    }
