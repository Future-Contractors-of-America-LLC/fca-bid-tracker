#!/usr/bin/env python3
"""Block conflicting git operations when another machine holds the execution lease."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from coordination import shell_blocked_by_lease


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        payload = {}

    command = str(payload.get("command") or "")
    reason = shell_blocked_by_lease(command, Path.cwd())
    if reason:
        print(json.dumps({"permission": "deny", "user_message": reason}))
        return 0

    print(json.dumps({"permission": "allow"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
