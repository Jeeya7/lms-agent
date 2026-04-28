from __future__ import annotations

import json
import traceback

import azure.functions as func


def json_response(payload: dict, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload),
        status_code=status_code,
        mimetype="application/json",
    )


def read_json(req: func.HttpRequest) -> dict:
    try:
        return req.get_json()
    except ValueError:
        return {}


def error_response(exc: Exception) -> func.HttpResponse:
    print("[backend error]", repr(exc))
    print(traceback.format_exc())
    if isinstance(exc, ValueError):
        return json_response({"error": str(exc)}, 400)
    return json_response({"error": f"Unexpected parser failure: {exc}"}, 502)
