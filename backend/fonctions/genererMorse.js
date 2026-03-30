import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import bdd from "../bdd/bdd.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIR = path.join(__dirname, "..", "morseAudios");

if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// ================= TABLE MORSE =================

const MORSE = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
    0: "-----",
};

// ================= PARAMÈTRES AUDIO =================

const sampleRate = 44100;
const freq = 750;
const dot = 0.18;
const dash = dot * 3;

// ================= GÉNÉRATION AUDIO =================

function generateTone(duration) {
    const samples = Math.floor(sampleRate * duration);
    const buffer = Buffer.alloc(samples * 2);

    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const sample = Math.sin(2 * Math.PI * freq * t);
        const intSample = Math.floor(sample * 32767);
        buffer.writeInt16LE(intSample, i * 2);
    }

    return buffer;
}

function generateSilence(duration) {
    const samples = Math.floor(sampleRate * duration);
    return Buffer.alloc(samples * 2);
}

function createWavFile(filePath, audioBuffer) {
    console.log("je génére")
    const header = Buffer.alloc(44);

    header.write("RIFF", 0);
    header.writeInt32LE(36 + audioBuffer.length, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeInt32LE(16, 16);
    header.writeInt16LE(1, 20);
    header.writeInt16LE(1, 22);
    header.writeInt32LE(sampleRate, 24);
    header.writeInt32LE(sampleRate * 2, 28);
    header.writeInt16LE(2, 32);
    header.writeInt16LE(16, 34);
    header.write("data", 36);
    header.writeInt32LE(audioBuffer.length, 40);

    const finalBuffer = Buffer.concat([header, audioBuffer]);
    fs.writeFileSync(filePath, finalBuffer);
}

// ================= EXPORT PRINCIPAL =================

const generationLocks = new Map();

export default async function generateMorseAudio(text) {

    const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // 🔥 LOCK MÉMOIRE (clé du fix)
    if (generationLocks.has(cleanText)) {
        return generationLocks.get(cleanText);
    }

    const promise = (async () => {

        // 🔎 check DB
        const existing = await bdd.MorseAudios.findOne({
            where: { reponse: cleanText }
        });

        if (existing) {
            return {
                fileName: existing.nomFichier,
                texte: cleanText,
            };
        }

        // ================= GÉNÉRATION =================

        let buffers = [];

        for (let char of cleanText) {
            const morse = MORSE[char];
            if (!morse) continue;

            for (let symbol of morse) {
                buffers.push(symbol === "." ? generateTone(dot) : generateTone(dash));
                buffers.push(generateSilence(dot));
            }

            buffers.push(generateSilence(dot * 3));
        }

        const audioBuffer = Buffer.concat(buffers);

        const nomFichier = `morse_${Date.now()}.wav`;
        const wavPath = path.join(AUDIO_DIR, nomFichier);

        createWavFile(wavPath, audioBuffer);

        try {

            await bdd.MorseAudios.create({
                reponse: cleanText,
                nomFichier
            });

            return {
                fileName: nomFichier,
                texte: cleanText,
            };

        } catch (err) {

            // 🔁 si doublon DB → récupérer l’existant
            const existing = await bdd.MorseAudios.findOne({
                where: { reponse: cleanText }
            });

            return {
                fileName: existing.nomFichier,
                texte: cleanText,
            };
        }

    })();

    generationLocks.set(cleanText, promise);

    try {
        return await promise;
    } finally {
        generationLocks.delete(cleanText);
    }
}