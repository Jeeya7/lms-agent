"""HTTP route registration modules for Azure Functions."""

from routes.calendar_routes import register_calendar_routes
from routes.health_routes import register_health_routes
from routes.study_plan_routes import register_study_plan_routes

__all__ = [
	"register_health_routes",
	"register_calendar_routes",
	"register_study_plan_routes",
]
