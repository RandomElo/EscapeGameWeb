import gestionErreur from "../../middlewares/gestionErreur.js";

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generation = gestionErreur(
    (req, res) => {
        const { texte } = req.body;

        if (!texte || typeof texte !== "string") {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const cheminTTS = path.resolve(__dirname, "../../tts");

        const cheminPiper = path.join(cheminTTS, "piper", "piper");
        const cheminModeleVoix = path.join(cheminTTS, "voices", "fr_FR-tom-medium", "fr_FR-tom-medium.onnx");
        const cheminDossierAudio = path.join(cheminTTS, "audios");

        if (!fs.existsSync(cheminDossierAudio)) {
            fs.mkdirSync(cheminDossierAudio, { recursive: true });
        }

        const nomFichier = path.join(cheminDossierAudio, `${Date.now()}.wav`);

        const piper = spawn(cheminPiper, ["--model", cheminModeleVoix, "--output_file", nomFichier]);

        piper.stdin.write(texte);
        piper.stdin.end();

        piper.on("close", (code) => {
            if (code !== 0) {
                return res.status(500).json({
                    etat: false,
                    detail: "Erreur lors de la génération audio",
                });
            }

            return res.status(200).json({
                etat: true,
                fichier: path.basename(nomFichier),
            });
        });
    },
    "controleurGenerationAudio",
    "Erreur lors de la génération de l'audio",
);
