import os
import cv2
import base64
import asyncio
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import sqlite3
import uvicorn
import json
import threading

# ============================
# CONFIGURATION
# ============================
load_dotenv()

CAMERA_IP = os.getenv("CAMERA_IP")
CAMERA_USER = os.getenv("CAMERA_USER")
CAMERA_PASS = os.getenv("CAMERA_PASS")
PORT_UVICORN = int(os.getenv("PORT_UVICORN", 8080))

# URL RTSP pour la caméra
RTSP_URL = f"rtsp://{CAMERA_USER}:{CAMERA_PASS}@{CAMERA_IP}:554/live/ch0"

# Chemin vers la base SQLite
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.normpath(os.path.join(BASE_DIR, "../backend/bdd/bdd.sqlite"))

# ============================
# APPLICATION FASTAPI
# ============================
app = FastAPI()

# Autoriser le frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5252", "http://172.18.201.101:5252"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# VARIABLE GLOBALE POUR LA DERNIERE IMAGE
# ============================
latest_frame = None  # stocke la dernière frame capturée

# ============================
# CAPTURE CAMERA EN THREAD
# ============================
def start_camera():
    """Capture la caméra en continu dans un thread séparé"""
    global latest_frame

    cap = cv2.VideoCapture(RTSP_URL)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # réduire le buffer pour diminuer le lag

    if not cap.isOpened():
        print("[ERREUR] Connexion RTSP échouée")
        return

    print(f"[OK] Camera connectée : {CAMERA_IP}")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[WARN] Perte du flux, tentative de reconnexion...")
            import time
            time.sleep(2)
            continue

        # Redimensionner pour réduire le poids du flux
        latest_frame = cv2.resize(frame, (640, 360))


# ============================
# FONCTION DE VALIDATION DU TOKEN
# ============================
def tokenBDD(token):
    """
    Vérifie que le token existe dans la BDD.
    Lève une HTTPException 401 si le token est invalide.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Token manquant")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT token FROM Tokens WHERE token = ?", (token,))
    element = cursor.fetchone()
    conn.close()

    if not element:
        print(f"[ALERT] Token invalide : {token}")
        raise HTTPException(status_code=401, detail="Token invalide")


# ============================
# LANCEMENT DE LA CAMERA AU DEMARRAGE
# ============================
@app.on_event("startup")
def startup_event():
    threading.Thread(target=start_camera, daemon=True).start()


# ============================
# WEBSOCKET POUR LE STREAM VIDEO
# ============================
@app.websocket("/ws/stream")
async def stream(ws: WebSocket):
    token = ws.query_params.get("token")
    print("[INFO] Token reçu :", token)

    # Vérifier que le token est valide
    tokenBDD(token)

    await ws.accept()
    print("[INFO] WebSocket accepté pour le token", token)

    try:
        while True:
            if latest_frame is None:
                # Pas de frame disponible, attendre 10ms
                await asyncio.sleep(0.01)
                continue

            # Encoder la frame en JPEG avec qualité 30
            _, buffer = cv2.imencode(".jpg", latest_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 30])
            jpg_b64 = base64.b64encode(buffer).decode("utf-8")

            # Envoyer directement la frame encodée
            await ws.send_text(json.dumps({"image": jpg_b64}))

            # Limiter la fréquence d'envoi pour réduire le lag et CPU (~25 FPS)
            await asyncio.sleep(0.04)

    except Exception as e:
        print("[INFO] Client déconnecté :", e)


# ============================
# LANCEMENT DU SERVEUR
# ============================
if __name__ == "__main__":
    uvicorn.run("serveur:app", host="0.0.0.0", port=PORT_UVICORN, reload=True)