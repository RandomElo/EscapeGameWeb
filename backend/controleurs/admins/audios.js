import gestionErreur from "../../middlewares/gestionErreur.js";
import { randomUUID } from "crypto";

import { spawn } from "child_process";
import fs from "fs/promises";
import fsSync, { cp } from "fs";
import { stat } from "fs/promises"; // pour async
import path from "path";
import { fileURLToPath } from "url";
import { ConfigurationInterfaceAdmin } from "./scenarios.js";
import jwt from "jsonwebtoken";
import pLimit from "p-limit";
import { lancerAudioVolee } from "../../mqtt/gameManager.js";
import logger from "../../mqtt/logger.js";

const limit = pLimit(2); // max 3 TTS en parallèle

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cheminDossierAudios = path.resolve(__dirname, "../../audios");
logger.info(cheminDossierAudios);
// Chemin modele TTS
const cheminTTS = path.resolve(__dirname, "../../tts");
const cheminPiper = path.join(cheminTTS, "piper", "piper");
// const cheminModeleVoix = path.join(cheminTTS, "voices", "fr_FR-tom-medium", "fr_FR-tom-medium.onnx");
const cheminModeleVoix = path.join(cheminTTS, "voices", "fr_FR-siwis-medium", "fr_FR-siwis-medium.onnx");

// GESTION DU SSE
const jobs = new Map();
const clients = new Map();

export function creationJob(total) {
    const id = randomUUID();

    jobs.set(id, {
        total,
        done: 0,
        status: "running",
        createdAt: Date.now(),
    });

    return id;
}

export function registerClient(jobId, res) {
    clients.set(jobId, {
        res,
        createdAt: Date.now(),
    });
}

export function envoiProgresSSE(jobId, donnees) {
    const client = clients.get(jobId);
    if (!client) return;

    client.res.write(`data: ${JSON.stringify(donnees)}\n\n`);
}

export function getJob(jobId) {
    return jobs.get(jobId);
}

export function generationTTS(cheminDossier, nomFichier, texte) {
    return new Promise((resolve, reject) => {
        fsSync.mkdirSync(cheminDossier, { recursive: true });

        const cheminFichier = path.join(cheminDossier, nomFichier);

        const piper = spawn(cheminPiper, ["--model", cheminModeleVoix, "--output_file", cheminFichier]);

        piper.stdin.write(texte);
        piper.stdin.end();

        piper.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error("Erreur génération audio"));
            }

            resolve({
                cheminFichier,
                nomFichier,
            });
        });

        piper.on("error", reject);
    });
}

export async function generationAudiosMission(donnees) {
    cheminDossier = path.join(cheminDossierAudios, "mission");
    await Promise.allSettled(
        donnees.map((element) =>
            limit(async () => {
                const nomFichier = `${randomUUID()}.wav`;

                if (process.env.TYPE_ENV == "reel") {
                    await generationTTS(cheminDossier, nomFichier, element);
                }

                return await req.MissionAudios.create({
                    texte: element,
                    nomFichier: nomFichier,
                });
            }),
        ),
    );
}

export const generation = gestionErreur(
    async (req, res) => {
        const { texte } = req.body;

        if (!texte) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const cheminDossierAudio = path.join(process.cwd(), "audios", "messages");
        const nomFichier = `${Date.now()}.wav`;
        if (process.env.TYPE_ENV == "reel") {
            await generationTTS(cheminDossierAudio, nomFichier, texte);
        }

        await req.MessagesAudio.create({
            detail: texte,
            nomFichier,
        });

        return res.json({
            etat: true,
            detail: await ConfigurationInterfaceAdmin(req),
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
        const modeles = [
            { modele: req.MessagesAudio, dossier: "messages" },
            { modele: req.QuizAudios, dossier: "quiz" },
            { modele: req.QuizQuestions, dossier: "question" },
            { modele: req.Devinettes, dossier: "devinette" },
        ];

        let fichier = null;
        let modeleTrouve = null;
        let dossierTrouve = null;

        for (const { modele, dossier } of modeles) {
            fichier = await modele.findOne({ where: { nomFichier }, raw: true });

            if (fichier) {
                logger.info(" c bon ");
                modeleTrouve = modele;
                if (dossier == "quiz") {
                    console.log(fichier.type);
                    dossierTrouve = path.join("quiz", fichier.type);
                } else if (dossier == "question") {
                    dossierTrouve = path.join("quiz", "questions");
                } else {
                    dossierTrouve = dossier;
                }
                break;
            }
        }

        if (!fichier) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        const cheminDossierAudio = path.join(process.cwd(), "audios", dossierTrouve);

        const cheminFichier = path.join(cheminDossierAudio, nomFichier);

        try {
            logger.info(`Suppression : ${cheminFichier}`);
            await fs.unlink(cheminFichier);
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.error("Erreur suppression fichier :", err);
                return res.status(500).json({
                    etat: false,
                    erreur: "Erreur suppression fichier",
                });
            }
        }

        await modeleTrouve.destroy({
            where: { id: fichier.id },
        });

        return res.json({
            etat: true,
            detail: await ConfigurationInterfaceAdmin(req),
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

        const modeles = [
            { modele: req.MessagesAudio, dossier: "messages" },
            { modele: req.QuizAudios, dossier: "quiz" },
            { modele: req.QuizQuestions, dossier: "question" },
            { modele: req.Devinettes, dossier: "devinette" },
        ];

        let fichier = null;
        let modeleTrouve = null;
        let dossierTrouve = null;

        for (const { modele, dossier } of modeles) {
            fichier = await modele.findOne({ where: { nomFichier }, raw: true });

            if (fichier) {
                logger.info(" c bon ");
                modeleTrouve = modele;
                if (dossier == "quiz") {
                    console.log(fichier.type);
                    dossierTrouve = path.join("quiz", fichier.type);
                } else if (dossier == "question") {
                    dossierTrouve = path.join("quiz", "questions");
                } else {
                    dossierTrouve = dossier;
                }
                break;
            }
        }

        if (!fichier) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        // avant

        const cheminFichier = path.join(process.cwd(), "audios", dossierTrouve, nomFichier);

        if (!fsSync.existsSync(cheminFichier)) {
            return res.status(404).json({
                etat: false,
                detail: `Ressource introuvable ${cheminFichier}`,
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

        const modeles = [
            { modele: req.MessagesAudio, dossier: "messages" },
            { modele: req.QuizAudios, dossier: "quiz" },
            { modele: req.QuizQuestions, dossier: "question" },
            { modele: req.Devinettes, dossier: "devinette" },
        ];

        let fichier = null;
        let modeleTrouve = null;
        let dossierTrouve = null;

        for (const { modele, dossier } of modeles) {
            fichier = await modele.findOne({ where: { nomFichier }, raw: true });

            if (fichier) {
                logger.info(" c bon ");
                modeleTrouve = modele;
                if (dossier == "quiz") {
                    console.log(fichier.type);
                    dossierTrouve = path.join("quiz", fichier.type);
                } else if (dossier == "question") {
                    dossierTrouve = path.join("quiz", "questions");
                } else {
                    dossierTrouve = dossier;
                }
                break;
            }
        }
        const cheminFichier = path.join(process.cwd(), "audios", dossierTrouve, nomFichier);

        if (!fsSync.existsSync(cheminFichier)) {
            return res.status(404).json({ error: "Fichier audio introuvable" });
        }

        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Access-Control-Allow-Origin", process.env.IP_FRONTEND);
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

        fsSync.createReadStream(cheminFichier).pipe(res);
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

        const filePath = path.join(process.cwd(), "audios", "morse", nomFichier);
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

// Permet la génération a partri d'un texte
async function generationAudiosSimple(typeGeneration, entree, req, res, type) {
    let cheminDossier;
    let valeurs = [];
    if (typeGeneration == "quiz") {
        cheminDossier = path.join(cheminDossierAudios, "quiz", type);
        valeurs = entree
            .split("\n")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
    } else if (typeGeneration == "devinette") {
        cheminDossier = path.join(cheminDossierAudios, "devinette");
        valeurs = entree
            .split("\n")
            .map((ligne) => ligne.trim())
            .filter((ligne) => ligne.length > 0)
            .map((ligne) => {
                const [devinette, reponse] = ligne.split(";");

                return {
                    devinette: devinette?.trim(),
                    reponse: reponse?.trim(),
                };
            });
    }
    const jobId = creationJob(valeurs.length);
    res.json({ etat: true, detail: jobId });

    const resultats = await Promise.allSettled(
        valeurs.map((element) =>
            limit(async () => {
                const nomFichier = `${randomUUID()}.wav`;

                if (process.env.TYPE_ENV == "reel") {
                    await generationTTS(cheminDossier, nomFichier, typeGeneration == "quiz" ? element : element.devinette);
                }

                const job = getJob(jobId);
                job.done++;
                envoiProgresSSE(jobId, {
                    type: "progress",
                    done: job.done,
                    total: job.total,
                });

                if (typeGeneration == "quiz") {
                    return await req.QuizAudios.create({
                        type,
                        texte: element,
                        nomFichier: nomFichier,
                    });
                } else if (typeGeneration == "devinette") {
                    return await req.Devinettes.create({
                        reponse: element.reponse,
                        devinette: element.devinette,
                        nomFichier,
                    });
                }
            }),
        ),
    );
    envoiProgresSSE(jobId, { type: "finished" });
    const client = clients.get(jobId);
    if (client) {
        client.res.end();
    }
    return resultats;
}

// Pemret la génération à partir d'un fichier JSON
async function generationQuestion(entree, req, res) {
    let entreeMiseEnForme;

    try {
        entreeMiseEnForme = JSON.parse(entree);
    } catch {
        throw new Error("JSON invalide");
    }
    const jobId = creationJob(entreeMiseEnForme.length);
    res.json({ etat: true, detail: jobId });

    const cheminDossier = path.join(cheminDossierAudios, "quiz", "questions");

    const resultats = await Promise.allSettled(
        entreeMiseEnForme.map((element) =>
            limit(async () => {
                if (!element.question || !element.type || !element.reponse || !element.difficulte) {
                    throw new Error("Format question invalide");
                }
                const nomFichier = `${randomUUID()}.wav`;

                if (process.env.TYPE_ENV == "reel") {
                    await generationTTS(cheminDossier, nomFichier, element.question);
                }

                await req.QuizQuestions.create({
                    question: element.question,
                    type: element.type,
                    reponse: element.reponse,
                    difficulte: element.difficulte,
                    nomFichier,
                });
                const job = getJob(jobId);
                job.done++;
                envoiProgresSSE(jobId, {
                    type: "progress",
                    done: job.done,
                    total: job.total,
                });
            }),
        ),
    );

    envoiProgresSSE(jobId, { type: "finished" });
    const client = clients.get(jobId);
    if (client) {
        client.res.end();
    }
    return resultats;
}

export const generationQuiz = gestionErreur(
    async (req, res) => {
        const { type, valeur } = req.body;
        if (!type || !valeur) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        const typesValides = ["bonneReponse", "mauvaiseReponse", "serieErreurs", "finQuiz", "questionsJSON"];
        if (!typesValides.includes(type)) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        let resultats;
        logger.info(type);
        if (type == "questionsJSON") {
            try {
                resultats = await generationQuestion(valeur, req, res);
            } catch (err) {
                logger.info(err);
                logger.info("Erreur lors de la généartion des audios");
            }
        } else {
            resultats = await generationAudiosSimple("quiz", valeur, req, res, type);
        }
        const succes = resultats.filter((r) => r.status === "fulfilled").map((r) => r.value);
        const erreurs = resultats.filter((r) => r.status === "rejected").map((r) => r.reason?.message);

        console.log(erreurs);
    },
    "controleurGenerationQuiz",
    "Erreur lors de la génération de l'audio pour le quiz",
);

export const generationDevinette = gestionErreur(
    async (req, res) => {
        const { devinettes } = req.body;
        if (!devinettes) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        const resultats = await generationAudiosSimple("devinette", devinettes, req, res);
        const succes = resultats.filter((r) => r.status === "fulfilled").map((r) => r.value);
        const erreurs = resultats.filter((r) => r.status === "rejected").map((r) => r.reason?.message);
    },
    "controleurGenerationDevinette",
    "Erreur lors de la génération des devinettes",
);
export const genererEtLancer = gestionErreur(
    async (req, res) => {
        const { texte } = req.body;
        if (!texte) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const cheminDossierAudio = path.join(process.cwd(), "audios", "messages");
        const nomFichier = `${Date.now()}.wav`;
        if (process.env.TYPE_ENV == "reel") {
            await generationTTS(cheminDossierAudio, nomFichier, texte);
        }

        await req.MessagesAudio.create({
            detail: texte,
            nomFichier,
        });

        await lancerAudioVolee(nomFichier, "message");

        return res.json({ etat: true, detail: "ok" });
    },
    "controleurGenererEtLancer",
    "Erreur lors de la génération de l'audio",
);
export const supprimerTousQuiz = gestionErreur(
    async (req, res) => {
        const chemin = path.resolve(__dirname, "../../audios/quiz");
        const [questions, autres] = await Promise.all([
            req.QuizQuestions.findAll({
                raw: true,
                attributes: ["id", "nomFichier"],
            }),
            req.QuizAudios.findAll({
                raw: true,
                attributes: ["id", "nomFichier", "type"],
            }),
        ]);
        await Promise.allSettled(
            questions.map(async (question) => {
                const cheminFichier = path.join(chemin, "questions", question.nomFichier);

                await fs.unlink(cheminFichier);
            }),
        );

        // AUTRES AUDIOS
        await Promise.allSettled(
            autres.map(async (audio) => {
                const cheminFichier = path.join(chemin, audio.type, audio.nomFichier);

                await fs.unlink(cheminFichier);
            }),
        );
        await req.QuizQuestions.destroy({ where: {} });
        await req.QuizAudios.destroy({ where: {} });
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSupprimerTousQuiz",
    "Erreur lors de la suppression des audios du quiz",
);
export const sseConnexion = (req, res) => {
    const { jobId } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders?.();

    registerClient(jobId, res);

    res.write(
        `data: ${JSON.stringify({
            type: "connected",
            jobId,
        })}\n\n`,
    );

    req.on("close", () => {
        res.end();
    });
};
