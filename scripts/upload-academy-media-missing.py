#!/usr/bin/env python3
"""Upload missing academy media HTML (and optional patterns) to Azure Blob with concurrency.

Skips blobs that already exist. Designed for the ~44k HTML tree that breaks SWA.
"""
from __future__ import annotations

import argparse
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from azure.core.exceptions import ResourceExistsError
from azure.storage.blob import BlobServiceClient, ContentSettings

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".json": "application/json",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--patterns", default="html", help="Comma-separated extensions")
    parser.add_argument("--workers", type=int, default=32)
    parser.add_argument("--source", default="public/academy/media")
    parser.add_argument("--container", default=os.environ.get("FCA_ACADEMY_MEDIA_CONTAINER", "fca-academy-media"))
    args = parser.parse_args()

    conn = os.environ.get("FCA_BLOB_STORAGE_CONNECTION") or ""
    if not conn:
        print("FAIL: FCA_BLOB_STORAGE_CONNECTION required", file=sys.stderr)
        return 1

    source = Path(args.source).resolve()
    if not source.is_dir():
        print(f"FAIL: source missing: {source}", file=sys.stderr)
        return 1

    patterns = {f".{p.strip().lower().lstrip('.')}" for p in args.patterns.split(",") if p.strip()}
    svc = BlobServiceClient.from_connection_string(conn)
    container = svc.get_container_client(args.container)
    try:
        container.create_container(public_access="blob")
    except Exception:
        pass

    print("Listing existing blobs...")
    existing = set()
    for blob in container.list_blobs(name_starts_with="academy/media/"):
        existing.add(blob.name)
    print(f"Existing blobs under academy/media/: {len(existing)}")

    locals_ = []
    for path in source.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in patterns:
            continue
        rel = path.relative_to(source).as_posix()
        blob_name = f"academy/media/{rel}"
        if blob_name in existing:
            continue
        locals_.append((path, blob_name, path.suffix.lower()))

    print(f"Missing files to upload: {len(locals_)} ({', '.join(sorted(patterns))})")
    if not locals_:
        print("Nothing to upload.")
        return 0

    uploaded = 0
    failed = 0

    def upload_one(item):
        path, blob_name, suffix = item
        client = container.get_blob_client(blob_name)
        ctype = CONTENT_TYPES.get(suffix, "application/octet-stream")
        with path.open("rb") as fh:
            client.upload_blob(
                fh,
                overwrite=True,
                content_settings=ContentSettings(content_type=ctype),
                max_concurrency=2,
            )
        return blob_name

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(upload_one, item): item for item in locals_}
        for i, fut in enumerate(as_completed(futures), 1):
            try:
                fut.result()
                uploaded += 1
            except Exception as exc:  # noqa: BLE001
                failed += 1
                print(f"FAIL {futures[fut][1]}: {exc}", file=sys.stderr)
            if i % 500 == 0 or i == len(futures):
                print(f"Progress {i}/{len(futures)} (ok={uploaded} fail={failed})")

    print(f"Done. uploaded={uploaded} failed={failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
