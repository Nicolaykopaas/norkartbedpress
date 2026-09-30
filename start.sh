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

# Hent ekte priser hvis appen fortsatt bruker eksempeldata
if grep -q '"eksempel-' src/sample_data/olpriser.json; then
  npm run scrape || echo "Skraping feilet – appen bruker eksempeldata. Se scripts/debug/."
fi
npm run dev -- --open
