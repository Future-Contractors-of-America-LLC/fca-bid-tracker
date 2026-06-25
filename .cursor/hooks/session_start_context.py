#!/usr/bin/env python3
"""Inject Auricrux frontend and Academy LMS loop context at Cursor session start."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def _read_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def main() -> int:
    try:
        raw = sys.stdin.read()
        _ = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        pass

    root = Path.cwd()
    parts: list[str] = ["FCA Contractor Command automation context:"]

    frontend_state = _read_json(root / "auricrux" / "system" / "frontend_loop_state.json")
    if frontend_state:
        parts.append(
            f"Frontend loop runs: {frontend_state.get('runCount', 0)}, last ok: {frontend_state.get('lastOk')}"
        )

    frontend_receipt = _read_json(root / "auricrux" / "system" / "last_frontend_loop_receipt.json")
    if frontend_receipt:
        parts.append(f"Frontend receipt: {str(frontend_receipt.get('summary', ''))[:160]}")

    lms_state = _read_json(root / "auricrux" / "system" / "lms_repair_state.json")
    if lms_state:
        parts.append(
            f"LMS repair loop runs: {lms_state.get('runCount', 0)}, "
            f"last complete: {lms_state.get('lastComplete')}, "
            f"consecutive failures: {lms_state.get('consecutiveFailures', 0)}"
        )

    lms_repair_md = root / "docs" / "qc" / "lms-repair-latest.md"
    if lms_repair_md.exists():
        text = lms_repair_md.read_text(encoding="utf-8")
        if "OPEN" in text:
            parts.append(f"LMS repair loop RED — see docs/qc/lms-repair-latest.md")

    next_action = _read_json(root / "auricrux" / "system" / "next_action.json")
    if next_action and next_action.get("status") == "ready" and next_action.get("action_id"):
        parts.append(
            f"Next action [{next_action.get('action_id')}]: "
            f"{str(next_action.get('action_summary', ''))[:200]}"
        )

    loop_contract = _read_json(root / "auricrux" / "system" / "loops" / "lms-repair-loop.json")
    if loop_contract:
        parts.append(f"LMS loop schedule: {loop_contract.get('schedule', 'unknown')}")

    parts.append("Spine: design -> takeoff -> estimate -> invoice -> SOV -> pay app -> GL")
    parts.append("Academy: catalog -> enroll -> progress -> credentials -> commerce")

    context = "\n".join(parts)
    print(json.dumps({"additional_context": context}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
