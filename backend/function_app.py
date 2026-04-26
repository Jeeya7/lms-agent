from __future__ import annotations

import json

import azure.functions as func

from models.contracts import Preferences, serialize_assignments, serialize_busy_blocks
from services.planner_service import PlannerService
from shared.config import load_settings
from tools.canvas_parser import parse_canvas_assignments
from tools.ics_exporter import export_schedule_to_ics
from tools.outlook_parser import parse_outlook_busy_blocks

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


def _json_response(payload: dict, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload),
        status_code=status_code,
        mimetype="application/json",
    )


def _read_json(req: func.HttpRequest) -> dict:
    try:
        return req.get_json()
    except ValueError:
        return {}


@app.route(route="health", methods=["GET"])
def health(_: func.HttpRequest) -> func.HttpResponse:
    settings = load_settings()
    return _json_response(
        {
            "status": "ok",
            "foundryReady": settings.foundry_ready,
            "projectEndpoint": settings.project_endpoint,
            "modelDeployment": settings.model_deployment,
        }
    )


@app.route(route="canvas/parse-ics", methods=["POST"])
def parse_canvas(req: func.HttpRequest) -> func.HttpResponse:
    body = _read_json(req)
    ics_text = body.get("ics", "")
    if not ics_text:
        return _json_response({"error": "Request body must include an 'ics' string."}, 400)

    assignments = parse_canvas_assignments(ics_text)
    return _json_response({"assignments": serialize_assignments(assignments)})


@app.route(route="calendar/parse-ics", methods=["POST"])
def parse_calendar(req: func.HttpRequest) -> func.HttpResponse:
    body = _read_json(req)
    ics_text = body.get("ics", "")
    if not ics_text:
        return _json_response({"error": "Request body must include an 'ics' string."}, 400)

    busy_blocks = parse_outlook_busy_blocks(ics_text)
    return _json_response({"busyBlocks": serialize_busy_blocks(busy_blocks)})


@app.route(route="planner/generate", methods=["POST"])
def generate_plan(req: func.HttpRequest) -> func.HttpResponse:
    body = _read_json(req)
    preferences = Preferences.from_dict(body.get("preferences"))
    service = PlannerService(load_settings())
    response = service.generate_demo_plan(preferences)
    return _json_response(response.to_dict())


@app.route(route="planner/export-ics", methods=["POST"])
def export_ics(req: func.HttpRequest) -> func.HttpResponse:
    body = _read_json(req)
    schedule = body.get("schedule", [])
    if not schedule:
        return _json_response({"error": "Request body must include a 'schedule' array."}, 400)

    ics_text = export_schedule_to_ics(schedule, calendar_name="LMS Agent Study Plan")
    return func.HttpResponse(ics_text, status_code=200, mimetype="text/calendar")
