from __future__ import annotations

import azure.functions as func

from services.study_plan_service import build_study_plan_preview, export_preview_blocks_to_ics
from shared.http_helpers import error_response, json_response, read_json
from shared.validators import require_list, require_string, require_string_list


def register_study_plan_routes(app: func.FunctionApp) -> None:
    @app.route(route="study-plan/preview", methods=["POST"])
    def study_plan_preview_endpoint(req: func.HttpRequest) -> func.HttpResponse:
        body = read_json(req)
        canvas_ics_url = require_string(body, "canvas_ics_url")
        selected_course = body.get("selected_course")
        confidence_level = body.get("confidence_level")
        preferences = body.get("preferences")

        try:
            outlook_ics_urls = require_string_list(body, "outlook_ics_urls")
            response = build_study_plan_preview(
                canvas_ics_url=canvas_ics_url,
                outlook_ics_urls=outlook_ics_urls,
                selected_course=str(selected_course) if selected_course else None,
                confidence_level=str(confidence_level) if confidence_level else None,
                preferences=preferences if isinstance(preferences, dict) else None,
            )
        except Exception as exc:  # noqa: BLE001
            return error_response(exc)

        return json_response(response)

    @app.route(route="study-plan/export", methods=["POST"])
    def study_plan_export_endpoint(req: func.HttpRequest) -> func.HttpResponse:
        body = read_json(req)

        try:
            study_blocks = require_list(body, "study_blocks")
            if not study_blocks:
                raise ValueError("'study_blocks' must include at least one block.")
            if any(not isinstance(block, dict) for block in study_blocks):
                raise ValueError("'study_blocks' must be an array of objects.")

            ics_text = export_preview_blocks_to_ics(study_blocks)
        except Exception as exc:  # noqa: BLE001
            return error_response(exc)

        return func.HttpResponse(
            ics_text,
            status_code=200,
            mimetype="text/calendar",
            headers={"Content-Disposition": "attachment; filename=studypilot-plan.ics"},
        )
