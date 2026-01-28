#!/bin/bash

trap "kill 0" EXIT

log() {
  while IFS= read -r line; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$1] $line"
  done
}

echo "Démarrage frontend..."
(
  cd frontend || exit 1
  npm run dev -- --host 2>&1 | log FRONT
) &

echo "Démarrage backend..."
(
  cd backend || exit 1
  nodemon 2>&1 | log BACK
) &

echo "Démarrage MQTT ENGINE..."
(
  cd mqtt || exit 1
  node serveur.js 2>&1 | log MQTT
)
