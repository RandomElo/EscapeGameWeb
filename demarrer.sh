#!/bin/bash

trap "kill 0" EXIT

BASE_DIR="$(pwd)"
LOG_FILE="$BASE_DIR/app.log"

log() {
  local service="$1"
  while IFS= read -r line; do
    printf "[%s] [%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$service" "$line"
  done
}

echo "Démarrage frontend..."
(
  cd frontend || exit 1
  npm run dev -- --host 2>&1 | log "FRONTEND" | tee -a "$LOG_FILE"
) &

echo "Démarrage backend..."
(
  cd backend || exit 1
  nodemon 2>&1 | log "BACKEND" | tee -a "$LOG_FILE"
) &

echo "Démarrage serveur caméra..."
(
  cd streamCamera || exit 1
  source venv/bin/activate
  python3 serveur.py 2>&1 | log "CAMERA" | tee -a "$LOG_FILE"
) &

wait