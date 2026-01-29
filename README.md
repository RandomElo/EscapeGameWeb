# Création du fichier de démarrage

```sh
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
)
```

```bash
touch demarrer.sh
chmod +x demarrer.sh
./demarrer.sh
```

# .env

## Backend

Port `8100`

```
PORT_EXPRESS=100
NODE_ENV=development ou production
DOTENV_CONFIG_QUIET=true
IP_FRONTEND=http://ipFrontend:5252
CONTROLEUR_DEFAUT`= node -e "import('bcrypt').then(b=>b.hash(process.argv[1],12).then(console.log))"
CHAINE_JWT_COOKIE=
MAIL_UTILISATEUR=
MAIL_MDP=

```

## Frontend

Port `5252`

```
DOTENV_CONFIG_QUIET=true
VITE_API_URL_BACKEND=http://ipBackend:8100
VITE_PORT_APPLICATION=5252
```

frontend$ npm install --save-dev @types/react @types/react-dom

### MQTT

Port 1883
