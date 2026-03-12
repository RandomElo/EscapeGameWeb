import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bdd from "../bdd/bdd.js";
import generateMorseAudio from "./genererMorse.js";
import logger from "../mqtt/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIR = path.join(__dirname, "..", "morseAudios");

export default async function verifierMorseConfig(configuration) {

    if (!configuration?.morse) {
        return null;
    }

    const morseArray = configuration.morse;

    if (!Array.isArray(morseArray)) {
        throw new Error("configuration.morse doit être un tableau");
    }

    const regex = /^[A-Z][0-9]$/;

    const result = [];

    for (const value of morseArray) {

        if (!regex.test(value)) {
            throw new Error(`Format morse invalide : ${value}`);
        }

        let morseAudio = await bdd.MorseAudios.findOne({
            where: { reponse: value }
        });

        let fichierExiste = false;

        if (morseAudio) {

            const filePath = path.join(AUDIO_DIR, morseAudio.nomFichier);

            if (fs.existsSync(filePath)) {
                fichierExiste = true;
                logger.info(`${value} audio déjà présent`);
            }
        }

        // génération si nécessaire
        if (!morseAudio || !fichierExiste) {

            logger.info(`Génération audio pour ${value}`);

            const generated = await generateMorseAudio(value);

            result.push({
                reponse: value,
                nomFichier: generated.fileName
            });

        } else {

            result.push({
                reponse: value,
                nomFichier: morseAudio.nomFichier
            });

        }

    }

    return result;
}