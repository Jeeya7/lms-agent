from __future__ import annotations

import azure.functions as func

from shared.http_helpers import json_response


def register_health_routes(app: func.FunctionApp) -> None:
    @app.route(route="health", methods=["GET"])
    def health(req: func.HttpRequest) -> func.HttpResponse:
        return json_response({"status": "ok"})
