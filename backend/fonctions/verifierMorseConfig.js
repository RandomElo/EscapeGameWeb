import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bdd from "../bdd/bdd.js";
import generateMorseAudio from "./genererMorse.js";
import logger from "../mqtt/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        // 🔥 IMPORTANT : RECHECK DB JUSTE AVANT
        let morseAudio = await bdd.MorseAudios.findOne({
            where: { reponse: value }
        });

        if (!morseAudio) {

            logger.info(`Génération audio pour ${value}`);

            const generated = await generateMorseAudio(value);

            // 🔁 REFETCH après génération (ultra important)
            morseAudio = await bdd.MorseAudios.findOne({
                where: { reponse: value }
            });
        }

        result.push({
            reponse: value,
            nomFichier: morseAudio.nomFichier
        });
    }

    return result;
}