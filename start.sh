#!/usr/bin/env bash
# Kjør lokalt: ./start.sh  — installerer, lager .env (spør om nøkkel) og starter appen.
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  read -rp "Lim inn Norkart API-nøkkel: " KEY
  printf 'VITE_API_KEY=%s\n' "$KEY" > .env
  echo ".env laget (committes aldri)."
fi

npm install
npm run dev -- --open
