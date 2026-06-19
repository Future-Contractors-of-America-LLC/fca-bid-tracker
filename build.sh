#!/bin/bash
set -euo pipefail

echo "Building FCA React SPA for Azure Static Web Apps..."

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run the Vite build."
  exit 1
fi

npx vite build
node scripts/post-spa-build.mjs

echo "FCA React SPA build completed."
