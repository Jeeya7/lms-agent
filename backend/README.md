# Backend

This folder contains the local Azure Functions backend for the LMS study planner.

## Route Layout

- function_app.py creates the FunctionApp and registers domain route modules.
- routes/health_routes.py contains health endpoints.
- routes/calendar_routes.py contains calendar parsing endpoints.
- routes/study_plan_routes.py contains study-plan preview and export endpoints.
- shared/http_helpers.py contains JSON read/response/error helpers.
- shared/validators.py contains reusable request validators.

## Endpoints

- GET /api/health
- POST /api/calendar/canvas/parse
- POST /api/calendar/outlook/parse
- POST /api/calendar/parse-all
- POST /api/study-plan/preview
- POST /api/study-plan/export

## How To Access Routes

When running locally with func start, all routes are automatically prefixed by /api.

Local base URL:
- http://localhost:7071

Local route examples:
- http://localhost:7071/api/health
- http://localhost:7071/api/calendar/canvas/parse
- http://localhost:7071/api/calendar/outlook/parse
- http://localhost:7071/api/calendar/parse-all
- http://localhost:7071/api/study-plan/preview
- http://localhost:7071/api/study-plan/export

When deployed to Azure Functions, use your function app host as the base URL.

Deployed base URL example:
- https://YOUR_FUNCTION_APP.azurewebsites.net

Deployed route example:
- https://YOUR_FUNCTION_APP.azurewebsites.net/api/health

## Example Requests (PowerShell)

Health check:
- Invoke-RestMethod -Method GET -Uri "http://localhost:7071/api/health"

Canvas parse:
- Invoke-RestMethod -Method POST -Uri "http://localhost:7071/api/calendar/canvas/parse" -ContentType "application/json" -Body '{"canvas_ics_url":"https://canvas.example.com/calendar.ics"}'

Outlook parse:
- Invoke-RestMethod -Method POST -Uri "http://localhost:7071/api/calendar/outlook/parse" -ContentType "application/json" -Body '{"outlook_ics_urls":["https://outlook.office365.com/a.ics","https://outlook.office365.com/b.ics"]}'

Parse all:
- Invoke-RestMethod -Method POST -Uri "http://localhost:7071/api/calendar/parse-all" -ContentType "application/json" -Body '{"canvas_ics_url":"https://canvas.example.com/calendar.ics","outlook_ics_urls":["https://outlook.office365.com/a.ics"]}'

Study plan preview:
- Invoke-RestMethod -Method POST -Uri "http://localhost:7071/api/study-plan/preview" -ContentType "application/json" -Body '{"canvas_ics_url":"https://canvas.example.com/calendar.ics","outlook_ics_urls":["https://outlook.office365.com/a.ics"],"selected_course":"INTRO TO COMPUTER NETWORKS","confidence_level":"confused"}'

Export ICS (write to file):
- Invoke-WebRequest -Method POST -Uri "http://localhost:7071/api/study-plan/export" -ContentType "application/json" -Body '{"study_blocks":[{"title":"Study for Homework 3","start":"2026-05-01T16:00:00","end":"2026-05-01T17:00:00","description":"Work on Homework 3"}]}' -OutFile "studypilot-plan.ics"

## Adding A New Route Module

1. Create a new file in routes/ with a register function:
	def register_x_routes(app: func.FunctionApp) -> None
2. Add decorated handlers inside that register function.
3. Export it from routes/__init__.py.
4. Register it in function_app.py.

## Local setup

1. Copy `local.settings.example.json` to `local.settings.json`.
2. Keep using your shared Azure AI Foundry project endpoint and model deployment.
3. Sign in locally with `az login`.
4. Start the Function App with `func start` from this folder.

## Notes

- The scaffold keeps agents as reasoning modules and Azure Functions as the tool/API layer.
- The current implementation includes a demo response contract so the frontend can integrate before the Foundry calls are fully wired.
