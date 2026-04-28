from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.study_plan_service import build_study_plan_from_inputs  # noqa: E402


def load_payload(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the local study-planner agent pipeline against a JSON payload.")
    parser.add_argument(
        "--input",
        default=str(ROOT / "scripts" / "sample_study_plan_payload.json"),
        help="Path to the input JSON payload.",
    )
    parser.add_argument(
        "--output",
        default="",
        help="Optional path for writing the JSON result.",
    )
    args = parser.parse_args()

    payload_path = Path(args.input).resolve()
    payload = load_payload(payload_path)

    result = build_study_plan_from_inputs(
        canvas_assignments=payload.get("canvas_assignments", []),
        outlook_busy_blocks=payload.get("outlook_busy_blocks", []),
        selected_course=payload.get("selected_course"),
        preferences=payload.get("preferences", {}),
    )

    rendered = json.dumps(result, indent=2)
    if args.output:
        output_path = Path(args.output).resolve()
        output_path.write_text(rendered, encoding="utf-8")
        print(f"Wrote result to {output_path}")
    else:
        print(rendered)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
