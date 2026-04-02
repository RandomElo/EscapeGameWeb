import mqtt from "mqtt";
import config from "./config.js";
import logger from "./logger.js";
import CommunicationBDD from "./CommunicationBDD.js";
import { startGame, stopGame, NextMission } from "./gameManager.js";
import verifierMorseConfig from "../fonctions/verifierMorseConfig.js";
// Téléchargement : http://172.18.201.101:8100/admins/audios/recuperation-morse?nomFichier=morse_1773393734861.wav

const configLocks = new Set();
const client = mqtt.connect(config.mqtt.host, {
    username: config.mqtt.username,
    password: config.mqtt.password,
});

client.on("connect", () => {
    logger.info("ENGINE connecté au broker MQTT");

    // On s'abonne à tous les topics nécessaires
    client.subscribe(`${config.mqtt.baseTopic}/#`);
});

client.on("message", async (topic, messageBuffer) => {
    const msg = messageBuffer.toString();

    logger.info(`MQTT | ${topic} | ${msg}`);

    try {
        // =====================================================
        // GAME CONTROL (START / STOP / SKIP)
        // =====================================================
        if (topic === "escape/game/start") {

            const scenarioId = parseInt(msg);

            logger.info(`Start game scenario ${scenarioId}`);

            startGame(scenarioId);

            return;
        }

        if (topic === "escape/game/stop") {

            logger.warn("Stop game");

            stopGame();

            return;
        }

        if (topic === "escape/game/skip") {

            logger.warn("Skip mission");

            NextMission();

            return;
        }
        
        // ================= Web → config brute =================
        const webConfigMatch = topic.match(/^escape\/mission\/(\d+)\/config\/web$/);

        if (webConfigMatch) {

            const missionId = webConfigMatch[1];
            const missionConfig = JSON.parse(msg);

            logger.info(`Config brute reçue du WEB pour mission ${missionId}`);

            const morseAudios = await verifierMorseConfig(missionConfig);

            if (!morseAudios) {
                logger.warn(`Pas de morse valide`);
                return;
            }

            const finalConfig = {
                ...missionConfig,
                morse: morseAudios
            };

            await CommunicationBDD.updateMissionConfig(missionId, finalConfig);

            // 🔥 ENVOI DIRECT À LA MISSION (COMME AVANT)
            client.publish(
                `escape/mission/${missionId}/config`,
                JSON.stringify(finalConfig)
            );

            client.publish(
                `escape/mission/${missionId}/state`,
                "start"
            );

            logger.info(`Mission ${missionId} lancée`);

            return;
        }

        // ================= Lest will =================
        const statusMatch = topic.match(/^escape\/mission\/(\d+)\/status$/);

        if (statusMatch) {

            const missionId = statusMatch[1];

            logger.info(`Mission ${missionId} status : ${msg}`);

            if (msg === "online") {

                // 🔥 demander config automatiquement
                client.publish(
                    `escape/mission/${missionId}/state`,
                    "config"
                );
            }

            if (msg === "offline") {

                logger.warn(`Mission ${missionId} déconnectée !`);
            }

            return;
        }
        // ================= Event missions =================
        const eventMatch = topic.match(/^escape\/mission\/(\d+)\/event$/);
        if (eventMatch) {
            const missionId = eventMatch[1];
            logger.info(`Event mission ${missionId} : ${msg}`);
            return;
        }

        // ================= Result missions =================
        const resultMatch = topic.match(/^escape\/mission\/(\d+)\/result$/);
        if (resultMatch) {
            const missionId = resultMatch[1];
            if (msg === "success") {
                logger.info(`Mission ${missionId} SUCCESS`);

                // passe à l'étape suivante
                NextMission();
            }
            return;
        }

        // ============================================
        // SPEAKER STATUS
        // ============================================

        if (topic === "escape/speaker/status") {

            const data = JSON.parse(msg);

            if (data.status === "finished") {

                logger.info(`Audio terminé : ${data.file}`);
            }

            return;   

        }

        if (msg === "online") {

            logger.info(`Mission ${missionId} connectée`);

            // 🔥 ENVOIE DIRECT CONFIG
            const missionConfig = await CommunicationBDD.getMissionConfig(missionId);

            if (!missionConfig) {
                logger.warn(`Pas de config pour mission ${missionId}`);
                return;
            }

            client.publish(
                `escape/mission/${missionId}/config`,
                JSON.stringify(missionConfig)
            );

            client.publish(
                `escape/mission/${missionId}/state`,
                "start"
            );
        }

    } catch (err) {
        logger.error("Erreur MQTT : " + err.message);
    }
});

export default client;