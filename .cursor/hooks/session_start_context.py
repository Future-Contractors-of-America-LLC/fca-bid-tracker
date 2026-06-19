#!/usr/bin/env python3
"""Inject Auricrux frontend loop context at Cursor session start."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
    try:
        raw = sys.stdin.read()
        _ = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        pass

    root = Path.cwd()
    state_path = root / "auricrux" / "system" / "frontend_loop_state.json"
    receipt_path = root / "auricrux" / "system" / "last_frontend_loop_receipt.json"

    parts: list[str] = ["FCA Contractor Command frontend automation context:"]

    if state_path.exists():
        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
            parts.append(f"Frontend loop runs: {state.get('runCount', 0)}, last ok: {state.get('lastOk')}")
        except json.JSONDecodeError:
            pass

    if receipt_path.exists():
        try:
            receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
            parts.append(f"Last receipt: {receipt.get('summary', '')[:200]}")
        except json.JSONDecodeError:
            pass

    parts.append("Spine: design → takeoff → estimate → invoice → SOV → pay app → GL")

    context = "\n".join(parts)
    print(json.dumps({"additional_context": context}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
