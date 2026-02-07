#!/bin/bash
set -euo pipefail

echo "Initialisation Text To Speech"

echo "Création de l'architecture"
mkdir -p tts
cd tts
mkdir -p audios voices/fr_FR-tom-medium

echo "Téléchargement et décompression de Piper"
wget -q https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz
tar -xzf piper_linux_x86_64.tar.gz
rm piper_linux_x86_64.tar.gz

echo "Téléchargement de la voix"
cd voices/fr_FR-tom-medium
wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx
wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx.json