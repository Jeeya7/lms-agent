from __future__ import annotations

from datetime import UTC, datetime, time, timedelta

from agents.foundry_agent_client import FoundryAgentClient
from agents.prompts import build_calendar_prompt


def _parse_iso(value: str) -> datetime:
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def _parse_latest_time(raw_value: str) -> time:
    hour, minute = [int(part) for part in str(raw_value or "22:00").split(":", 1)]
    return time(hour=hour, minute=minute)


def _split_free_interval(
    day_label: str,
    day_date: str,
    interval_start: datetime,
    interval_end: datetime,
    remaining_day_hours: float,
) -> tuple[list[dict], float]:
    chunks: list[dict] = []
    cursor = interval_start
    hours_left = remaining_day_hours

    while cursor < interval_end and hours_left > 0:
        available_minutes = int((interval_end - cursor).total_seconds() // 60)
        if available_minutes < 30:
            break

        chunk_minutes = min(90, available_minutes, int(hours_left * 60))
        if chunk_minutes < 30:
            break

        chunk_end = cursor + timedelta(minutes=chunk_minutes)
        duration_hours = round(chunk_minutes / 60, 2)
        chunks.append(
            {
                "dayLabel": day_label,
                "date": day_date,
                "start": cursor.isoformat(),
                "end": chunk_end.isoformat(),
                "durationHours": duration_hours,
            }
        )
        cursor = chunk_end + timedelta(minutes=15)
        hours_left = round(max(hours_left - duration_hours, 0.0), 2)

    return chunks, hours_left


class CalendarAgent:
    def __init__(self, client: FoundryAgentClient) -> None:
        self.client = client

    def analyze(self, busy_blocks: list[dict], preferences: dict, planning_start_date: str | None = None) -> dict:
        planning_start = (
            datetime.fromisoformat(planning_start_date).date()
            if planning_start_date
            else datetime.now(UTC).date()
        )
        latest_time = _parse_latest_time(str(preferences.get("latestTime", "22:00")))
        daily_limit = float(preferences.get("maxHours") or 6.0)

        normalized_busy = []
        for block in busy_blocks:
            if not block.get("start") or not block.get("end"):
                continue
            normalized_busy.append(
                {
                    "title": block.get("title", "Busy"),
                    "start": _parse_iso(block["start"]),
                    "end": _parse_iso(block["end"]),
                }
            )

        normalized_busy.sort(key=lambda item: item["start"])

        free_slots: list[dict] = []
        for offset in range(7):
            current_day = planning_start + timedelta(days=offset)
            day_start = datetime.combine(current_day, time(hour=9, minute=0), tzinfo=UTC)
            day_end = datetime.combine(current_day, latest_time, tzinfo=UTC)
            day_label = current_day.strftime("%a %b %d")
            day_busy = [
                item for item in normalized_busy
                if item["start"] < day_end and item["end"] > day_start
            ]

            remaining_day_hours = daily_limit
            cursor = day_start
            for item in day_busy:
                busy_start = max(item["start"], day_start)
                busy_end = min(item["end"], day_end)
                if busy_start > cursor:
                    chunks, remaining_day_hours = _split_free_interval(
                        day_label,
                        current_day.isoformat(),
                        cursor,
                        busy_start,
                        remaining_day_hours,
                    )
                    free_slots.extend(chunks)
                cursor = max(cursor, busy_end)

            if cursor < day_end and remaining_day_hours > 0:
                chunks, remaining_day_hours = _split_free_interval(
                    day_label,
                    current_day.isoformat(),
                    cursor,
                    day_end,
                    remaining_day_hours,
                )
                free_slots.extend(chunks)

        prompt_payload = {
            "preferences": preferences,
            "planning_start_date": planning_start.isoformat(),
            "busy_blocks": busy_blocks,
            "free_slots_preview": free_slots,
        }
        return {
            "agent": "calendar",
            "ready": self.client.is_configured(),
            "prompt": build_calendar_prompt(prompt_payload),
            "busyBlocks": busy_blocks,
            "freeSlots": free_slots,
            "planningWindow": {
                "startDate": planning_start.isoformat(),
                "endDate": (planning_start + timedelta(days=6)).isoformat(),
            },
            "preferences": preferences,
        }
