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

echo "Démarrage serveur caméra..."
(
  cd streamCamera || exit 1
  source venv/bin/activate
  python3 serveur.py 2>&1 | log CAMERA
) &

# Attend que tous les processus en arrière-plan se terminent
wait