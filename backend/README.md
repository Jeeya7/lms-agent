# Backend

This folder contains the local Azure Functions backend for the LMS study planner.

## Planned request flow

1. `POST /api/canvas/parse-ics`
2. `POST /api/calendar/parse-ics`
3. `POST /api/planner/generate`
4. `POST /api/planner/export-ics`

## Local setup

1. Copy `local.settings.example.json` to `local.settings.json`.
2. Keep using your shared Azure AI Foundry project endpoint and model deployment.
3. Sign in locally with `az login`.
4. Start the Function App with `func start` from this folder.

## Notes

- The scaffold keeps agents as reasoning modules and Azure Functions as the tool/API layer.
- The current implementation includes a demo response contract so the frontend can integrate before the Foundry calls are fully wired.
