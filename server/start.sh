#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
    echo "Missing .env file."
    echo "Copy .env.example to .env and fill in your values:"
    echo "  cp .env.example .env"
    exit 1
fi

if [[ ! -d node_modules ]]; then
    echo "Installing dependencies..."
    npm ci --omit=dev
fi

export NODE_ENV=production
node server.js
