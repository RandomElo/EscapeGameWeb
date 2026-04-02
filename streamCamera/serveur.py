import os
import cv2
import base64
import asyncio
from fastapi import FastAPI, WebSocket
from dotenv import load_dotenv
import uvicorn
import json
from fastapi.middleware.cors import CORSMiddleware
# ============================
# CONFIG
# ============================
load_dotenv()

CAMERA_IP = os.getenv("CAMERA_IP")
CAMERA_USER = os.getenv("CAMERA_USER")
CAMERA_PASS = os.getenv("CAMERA_PASS")
PORT_UVICORN = os.getenv("PORT_UVICORN")
print(PORT_UVICORN)
RTSP_URL = f"rtsp://{CAMERA_USER}:{CAMERA_PASS}@{CAMERA_IP}:554/live/ch0"
print(RTSP_URL)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5252","http://172.18.201.101:5252"], # Autorisation du frontend local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# CAPTURE UNIQUE
# ============================
latest_frame = None

def start_camera():
    global latest_frame

    while True:
        cap = cv2.VideoCapture(RTSP_URL)

        if not cap.isOpened():
            print("[ERREUR] Connexion RTSP échouée, retry...")
            import time
            time.sleep(2)
            continue

        print(f"[OK] Camera connectée : {CAMERA_IP}")

        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARN] Perte du flux, reconnexion...")
                break

            latest_frame = frame

        cap.release()

# Lancer capture en thread
@app.on_event("startup")
def startup_event():
    import threading
    threading.Thread(target=start_camera, daemon=True).start()

# ============================
# WEBSOCKET STREAM
# ============================
@app.websocket("/ws/stream")
async def stream(ws: WebSocket):
    await ws.accept()
    try:
        prev_frame_b64 = None

        while True:
            if latest_frame is None:
                await asyncio.sleep(0.01)
                continue

            _, buffer = cv2.imencode(".jpg", latest_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 6400])
            jpg_b64 = base64.b64encode(buffer).decode("utf-8")

            if jpg_b64 != prev_frame_b64:
                await ws.send_text(json.dumps({"image": jpg_b64}))
                prev_frame_b64 = jpg_b64

            await asyncio.sleep(0.02)

    except Exception as e:
        print("Client déconnecté", e)

if __name__ == "__main__":
    uvicorn.run("serveur:app", host="0.0.0.0", port=int(PORT_UVICORN), reload=True)