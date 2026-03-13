import gestionErreur from "../../middlewares/gestionErreur.js";

import { spawn } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";

import path from "path";
import { fileURLToPath } from "url";
import { ConfigurationInterfaceAdmin } from "./scenarios.js";
import jwt from "jsonwebtoken";
import generateMorseAudio from "../../fonctions/genererMorse.js";
import logger from "../../mqtt/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cheminTTS = path.resolve(__dirname, "../../tts");

export const generation = gestionErreur(
    (req, res) => {
        const { texte, missionId, scenarioId } = req.body;

        if (!texte || !missionId || !scenarioId) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const cheminPiper = path.join(cheminTTS, "piper", "piper");
        const cheminModeleVoix = path.join(cheminTTS, "voices", "fr_FR-tom-medium", "fr_FR-tom-medium.onnx");
        const cheminDossierAudio = path.join(cheminTTS, "audios");

        if (!fs.existsSync(cheminDossierAudio)) {
            fs.mkdirSync(cheminDossierAudio, { recursive: true });
        }
        const nomFichier = `${Date.now()}.wav`;
        const cheminFichier = path.join(cheminDossierAudio, nomFichier);

        const piper = spawn(cheminPiper, ["--model", cheminModeleVoix, "--output_file", cheminFichier]);

        piper.stdin.write(texte);
        piper.stdin.end();

        piper.on("close", async (code) => {
            if (code !== 0) {
                return res.status(500).json({
                    etat: false,
                    detail: "Erreur lors de la génération audio",
                });
            }

            await req.MessagesAudio.create({
                detail: texte,
                scenarioId,
                missionId,
                nomFichier,
            });

            return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
        });
    },
    "controleurGenerationAudio",
    "Erreur lors de la génération de l'audio",
);

export const suppression = gestionErreur(
    async (req, res) => {
        const { nomFichier } = req.body;

        if (!nomFichier) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const fichier = await req.MessagesAudio.findOne({ where: { nomFichier } });
        if (!fichier) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        const cheminDossierAudio = path.join(cheminTTS, "audios");
        const cheminFichier = path.join(cheminDossierAudio, nomFichier);

        fs.unlink(cheminFichier, async (err) => {
            if (err) {
                if (err.code === "ENOENT") {
                    return res.status(404).json({ etat: false, detail: "Fichier introuvable" });
                }
                return next(err);
            }
            await req.MessagesAudio.destroy({ where: { id: fichier.id } });
            return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
        });
    },
    "controleurSuppressionAudio",
    "Erreur lors de la suppression de l'audio",
);

export const recuperationLien = gestionErreur(
    async (req, res) => {
        const { nomFichier } = req.body;

        if (!nomFichier) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const fichier = await req.MessagesAudio.findOne({ where: { nomFichier }, raw: true });
        if (!fichier) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource introuvable",
            });
        }

        const cheminFichier = path.join(cheminTTS, "audios", nomFichier);
        if (!fs.existsSync(cheminFichier)) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource introuvable",
            });
        }
        const token = jwt.sign({ file: nomFichier }, process.env.SECRET_AUDIO, { expiresIn: "15s" });

        res.json({
            etat: true,
            detail: `/admins/audios/lecture/${nomFichier}?token=${token}`,
        });
    },
    "controleurRecuperationLienAudio",
    "Erreur lors de la récupération du lien pour l'audio",
);

export const lecture = gestionErreur(
    async (req, res) => {
        const nomFichier = req.params.nomFichier;
        const token = req.query.token;

        const verification = jwt.verify(token, process.env.SECRET_AUDIO);
        if (verification.file !== nomFichier) {
            return res.status(403).json({
                etat: false,
                detail: "Accès interdit",
            });
        }
        const cheminFichier = path.join(cheminTTS, "audios", nomFichier);
        if (!fs.existsSync(cheminFichier)) {
            return res.status(404).json({ error: "Fichier audio introuvable" });
        }

        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Access-Control-Allow-Origin", process.env.IP_FRONTEND);
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

        fs.createReadStream(cheminFichier).pipe(res);
    },
    "controleurLectureAudio",
    "Erreur lors de la lecture de l'audio",
);

export const recuperationMorse = gestionErreur(
    async (req, res) => {
        const { nomFichier } = req.query;

        if (!nomFichier) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const filePath = path.join(process.cwd(), "morseAudios", nomFichier);

        try {
            await fs.access(filePath, fsSync.constants.R_OK);
        } catch {
            return res.status(404).json({
                etat: false,
                detail: "Fichier introuvable",
            });
        }


        res.sendFile(filePath, {
            headers: {
                "Content-Type": "audio/wav",
            },
        });
    },
    "controleurRecuperationMorse",
    "Erreur lors de la récupération du fichier morse",
);
