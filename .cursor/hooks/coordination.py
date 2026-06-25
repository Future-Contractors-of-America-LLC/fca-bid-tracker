#!/usr/bin/env python3
"""Shared lease helpers — resolves coordination root across sibling repos."""

from __future__ import annotations

import json
import os
import socket
import subprocess
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

LEASE_TTL_MINUTES = 30


def coordination_root(start: Path | None = None) -> Path:
    cwd = start or Path.cwd()
    sibling = cwd.parent / "auricrux-central"
    if (sibling / "auricrux" / "system" / "machine_registry.json").exists():
        return sibling
    return cwd


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_ts(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def system_dir(root: Path) -> Path:
    return root / "auricrux" / "system"


def machine_id() -> str:
    return os.environ.get("AURICRUX_TRAINING_MACHINE") or os.environ.get("COMPUTERNAME") or socket.gethostname()


def read_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def lease_path(root: Path) -> Path:
    return system_dir(coordination_root(root)) / "execution_lease.json"


def lease_is_valid(lease: dict | None, *, now: datetime | None = None) -> bool:
    if not lease or not lease.get("holderMachineId"):
        return False
    expires = _parse_ts(lease.get("expiresAt"))
    if not expires:
        return False
    return expires > (now or _utc_now())


def acquire_or_renew_lease(root: Path, session_id: str | None = None) -> dict:
    coord = coordination_root(root)
    path = lease_path(root)
    lease = read_json(path) or {}
    now = _utc_now()
    mid = machine_id()
    sid = session_id or str(uuid.uuid4())
    holder = lease.get("holderMachineId")
    expires = _parse_ts(lease.get("expiresAt"))

    if holder and holder != mid and expires and expires > now:
        return lease

    next_action = read_json(system_dir(root) / "next_action.json") or read_json(
        system_dir(coord) / "next_action.json"
    ) or {}
    renewed = {
        "contract_version": "1.0.0",
        "holderMachineId": mid,
        "holderSessionId": sid,
        "acquiredAt": now.isoformat().replace("+00:00", "Z"),
        "expiresAt": (now + timedelta(minutes=LEASE_TTL_MINUTES)).isoformat().replace("+00:00", "Z"),
        "scope": "interactive-cursor",
        "nextActionId": next_action.get("action_id"),
        "notes": "Renewed by Cursor sessionStart hook.",
    }
    write_json(path, renewed)
    return renewed


def shell_blocked_by_lease(command: str, root: Path) -> str | None:
    cmd = command.strip()
    lower = cmd.lower()
    if "auricrux/system" not in lower and "git push" not in lower:
        return None
    if "git push" not in lower and "git commit" not in lower:
        return None

    lease = read_json(lease_path(root))
    if not lease_is_valid(lease):
        return None
    if lease.get("holderMachineId") == machine_id():
        return None
    return (
        f"Blocked: machine {lease.get('holderMachineId')} holds execution lease "
        f"until {lease.get('expiresAt')}."
    )


def connectivity_summary() -> list[str]:
    lines: list[str] = []
    lines.append(f"Machine: {machine_id()}")
    for name, check in (
        ("gh", ["gh", "auth", "status"]),
        ("az", ["az", "account", "show", "--query", "name", "-o", "tsv"]),
        ("copilot", ["copilot", "version"]),
    ):
        try:
            result = subprocess.run(check, capture_output=True, text=True, timeout=8)
            lines.append(f"{name}: {'ok' if result.returncode == 0 else 'fail'}")
        except (OSError, subprocess.TimeoutExpired):
            lines.append(f"{name}: fail")
    return lines
