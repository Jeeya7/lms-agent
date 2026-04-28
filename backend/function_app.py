from __future__ import annotations

import azure.functions as func

from routes import (
    register_calendar_routes,
    register_health_routes,
    register_study_plan_routes,
)

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

register_health_routes(app)
register_calendar_routes(app)
register_study_plan_routes(app)
