from __future__ import annotations

import azure.functions as func

from services.calendar_ingestion_service import parse_all_calendars
from services.canvas_calendar_service import parse_canvas_calendar
from services.outlook_calendar_service import parse_outlook_calendars
from shared.http_helpers import error_response, json_response, read_json
from shared.validators import require_string, require_string_list


def register_calendar_routes(app: func.FunctionApp) -> None:
    @app.route(route="calendar/canvas/parse", methods=["POST"])
    def parse_canvas_endpoint(req: func.HttpRequest) -> func.HttpResponse:
        body = read_json(req)
        canvas_ics_url = require_string(body, "canvas_ics_url")

        try:
            response = parse_canvas_calendar(canvas_ics_url)
        except Exception as exc:  # noqa: BLE001
            return error_response(exc)

        return json_response(response)

    @app.route(route="calendar/outlook/parse", methods=["POST"])
    def parse_outlook_endpoint(req: func.HttpRequest) -> func.HttpResponse:
        body = read_json(req)

        try:
            outlook_ics_urls = require_string_list(body, "outlook_ics_urls")
            response = parse_outlook_calendars(outlook_ics_urls)
        except Exception as exc:  # noqa: BLE001
            return error_response(exc)

        return json_response(response)

    @app.route(route="calendar/parse-all", methods=["POST"])
    def parse_all_endpoint(req: func.HttpRequest) -> func.HttpResponse:
        body = read_json(req)
        canvas_ics_url = require_string(body, "canvas_ics_url")

        try:
            outlook_ics_urls = require_string_list(body, "outlook_ics_urls")
            response = parse_all_calendars(canvas_ics_url, outlook_ics_urls)
        except Exception as exc:  # noqa: BLE001
            return error_response(exc)

        return json_response(response)
