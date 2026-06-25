#!/usr/bin/env python3
"""Inject FCA frontend, LMS repair, and lease context at Cursor session start."""

from __future__ import annotations

import json
import sys
import uuid
from pathlib import Path

from coordination import acquire_or_renew_lease, connectivity_summary, coordination_root, read_json


def main() -> int:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        payload = {}

    root = Path.cwd()
    session_id = str(payload.get("session_id") or uuid.uuid4())
    lease = acquire_or_renew_lease(root, session_id=session_id)

    parts: list[str] = ["FCA Contractor Command automation context:"]
    parts.extend(connectivity_summary())
    parts.append(
        f"Execution lease: holder={lease.get('holderMachineId')} expires={lease.get('expiresAt')}"
    )

    frontend_state = read_json(root / "auricrux" / "system" / "frontend_loop_state.json")
    if frontend_state:
        parts.append(
            f"Frontend loop runs: {frontend_state.get('runCount', 0)}, last ok: {frontend_state.get('lastOk')}"
        )

    frontend_receipt = read_json(root / "auricrux" / "system" / "last_frontend_loop_receipt.json")
    if frontend_receipt:
        parts.append(f"Frontend receipt: {str(frontend_receipt.get('summary', ''))[:160]}")

    lms_state = read_json(root / "auricrux" / "system" / "lms_repair_state.json")
    if lms_state:
        parts.append(
            f"LMS repair loop runs: {lms_state.get('runCount', 0)}, "
            f"last complete: {lms_state.get('lastComplete')}, "
            f"consecutive failures: {lms_state.get('consecutiveFailures', 0)}"
        )

    lms_repair_md = root / "docs" / "qc" / "lms-repair-latest.md"
    if lms_repair_md.exists() and "OPEN" in lms_repair_md.read_text(encoding="utf-8"):
        parts.append("LMS repair loop RED — see docs/qc/lms-repair-latest.md")

    workflow_repair_md = root / "docs" / "qc" / "workflow-repair-latest.md"
    if workflow_repair_md.exists() and "OPEN" in workflow_repair_md.read_text(encoding="utf-8"):
        parts.append("Workflow repair loop RED — see docs/qc/workflow-repair-latest.md")

    next_action = read_json(root / "auricrux" / "system" / "next_action.json")
    if not next_action:
        coord = coordination_root(root)
        next_action = read_json(coord / "auricrux" / "system" / "next_action.json")
    if next_action and next_action.get("status") == "ready" and next_action.get("action_id"):
        parts.append(
            f"Next action [{next_action.get('action_id')}]: "
            f"{str(next_action.get('action_summary', ''))[:200]}"
        )

    failure_log = read_json(coordination_root(root) / "auricrux" / "system" / "failure_log.json")
    if failure_log and failure_log.get("entries"):
        parts.append(f"Central failure log entries: {len(failure_log.get('entries', []))}")

    parts.append("Spine: design -> takeoff -> estimate -> invoice -> SOV -> pay app -> GL")
    parts.append("Academy: catalog -> enroll -> progress -> credentials -> commerce")

    print(json.dumps({"additional_context": "\n".join(parts)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
