import fs from "fs";
import path from "path";
import { stat } from "fs/promises";
import gestionErreur from "../../middlewares/gestionErreur.js";
import { fileURLToPath } from "url";
import logger from "../../mqtt/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const stream = gestionErreur(async (req, res) => {
    const { type, nomFichier } = req.params;
    let cheminFichier = "";
    
    switch (type) {
        case "morse":
            cheminFichier = path.join(__dirname, "../../audios/morse", nomFichier);
            break;
        case "message":
            cheminFichier = path.join(__dirname, "../../audios/messages", nomFichier);
            break
        case "bonneReponse":
        case "finQuiz":
        case "mauvaiseReponse":
        case "questions":
        case "serieErreurs":
        case "morse":
            cheminFichier = path.join(__dirname, "../../audios/quiz", type, nomFichier);
            break
        default:
            break;
    }

    logger.info(cheminFichier);

    if (!fs.existsSync(cheminFichier)) {
        return res.status(404).json({
            etat: false,
            detail: "Fichier audio introuvable",
        });
    }

    const { size } = await stat(cheminFichier);
    const range = req.headers.range;

    if (range) {
        // Gestion du streaming partiel
        const parts = range.replace(/bytes=/, "").split("-");
        const debut = parseInt(parts[0], 10);
        const fin = parts[1] ? parseInt(parts[1], 10) : size - 1;

        const chunkSize = fin - debut + 1;

        const stream = fs.createReadStream(cheminFichier, {
            start: debut,
            end: fin,
        });

        res.writeHead(206, {
            "Content-Range": `bytes ${debut}-${fin}/${size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "audio/wav",
        });

        stream.on("error", (err) => {
            console.error(err);
            if (!res.headersSent) res.status(500).end();
        });

        stream.pipe(res);
    } else {
        // Envoi complet
        res.writeHead(200, {
            "Content-Length": size,
            "Content-Type": "audio/wav",
            "Accept-Ranges": "bytes",
        });

        const stream = fs.createReadStream(cheminFichier);

        stream.on("error", (err) => {
            console.error(err);
            if (!res.headersSent) res.status(500).end();
        });

        stream.pipe(res);
    }
});
