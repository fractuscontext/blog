#!/usr/bin/env bash
# Serve this folder on http://localhost so the service worker can register
# (service workers only run on HTTPS or localhost, not from file://).
set -euo pipefail
cd "$(dirname "$0")"

PORT="${1:-8000}"
echo "Open http://localhost:$PORT/"

if command -v uv >/dev/null 2>&1; then
  exec uv run --no-project python -m http.server "$PORT" --bind 127.0.0.1
else
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi
