from __future__ import annotations


def require_string(payload: dict, field_name: str) -> str:
    value = payload.get(field_name, "")
    if value is None:
        raise ValueError(f"'{field_name}' is required.")

    cleaned = str(value).strip()
    if not cleaned:
        raise ValueError(f"'{field_name}' is required.")

    return cleaned


def require_string_list(payload: dict, field_name: str) -> list[str]:
    value = payload.get(field_name, [])
    if not isinstance(value, list):
        raise ValueError(f"'{field_name}' must be an array.")
    return [str(item) for item in value]


def require_list(payload: dict, field_name: str) -> list:
    value = payload.get(field_name, [])
    if not isinstance(value, list):
        raise ValueError(f"'{field_name}' must be an array.")
    return value
