import mqtt from "mqtt";
import config from "./config.js";
import logger from "./logger.js";
import CommunicationBDD from "./CommunicationBDD.js";

const client = mqtt.connect(config.mqtt.host, {
    username: config.mqtt.username,
    password: config.mqtt.password,
});

client.on("connect", () => {
    logger.info("ENGINE connecté au broker MQTT");
    client.subscribe(`${config.mqtt.baseTopic}/#`);
});

client.on("message", async (topic, messageBuffer) => {

    const msg = messageBuffer.toString();
    logger.info(`MQTT | ${topic} | ${msg}`);

    try {

        // =====================================================
        // CONNECTED HANDSHAKE (Mission 2 & 3)
        // =====================================================

        const connectedMatch = topic.match(/^escape\/mission\/(\d+)\/connected$/);
        if (connectedMatch) {
            const missionId = connectedMatch[1];

            logger.info(`Mission ${missionId} handshake`);

            client.publish(
                `escape/mission/${missionId}/connected/reply`,
                "ok"
            );

            // Demande config immédiatement
            client.publish(
                `escape/mission/${missionId}/state`,
                "config"
            );

            return;
        }

        // =====================================================
        // WEB → SAVE CONFIG (Mission 2 & 3)
        // =====================================================

        const configMatch = topic.match(/^escape\/mission\/(\d+)\/config$/);
        if (configMatch) {

            const missionId = configMatch[1];
            const missionConfig = JSON.parse(msg);

            await CommunicationBDD.updateMissionConfig(missionId, missionConfig);

            logger.info(`Config mission ${missionId} sauvegardée en BDD`);

            return;
        }

        // =====================================================
        // MISSION → CONFIG REQUEST
        // =====================================================

        const requestMatch = topic.match(/^escape\/mission\/(\d+)\/config\/request$/);
        if (requestMatch) {

            const missionId = requestMatch[1];

            // Demande initiale de config
            if (msg === "true") {

                const missionConfig = await CommunicationBDD.getMissionConfig(missionId);

                if (missionConfig) {

                    client.publish(
                        `escape/mission/${missionId}/config`,
                        JSON.stringify(missionConfig)
                    );

                    client.publish(
                        `escape/mission/${missionId}/state`,
                        "start"
                    );

                    logger.info(`Config envoyée à mission ${missionId}`);

                } else {
                    logger.warn(`Aucune config trouvée pour mission ${missionId}`);
                }

                return;
            }

            // Validation Mission 3 (LED feedback)
            if (msg === "ok") {

                logger.info(`Mission ${missionId} validation OK`);

                client.publish(
                    `escape/mission/${missionId}/led`,
                    "ok"
                );

                return;
            }

            if (msg === "ko") {

                logger.warn(`Mission ${missionId} validation KO`);

                client.publish(
                    `escape/mission/${missionId}/led`,
                    "error"
                );

                return;
            }
        }

        // =====================================================
        // EVENT (Mission 2 & 3)
        // =====================================================

        const eventMatch = topic.match(/^escape\/mission\/(\d+)\/event$/);
        if (eventMatch) {

            const missionId = eventMatch[1];
            logger.info(`Event mission ${missionId} : ${msg}`);

            return;
        }

        // =====================================================
        // RESULT (Mission 2 SUCCESS)
        // =====================================================

        const resultMatch = topic.match(/^escape\/mission\/(\d+)\/result$/);
        if (resultMatch) {

            const missionId = resultMatch[1];

            if (msg === "success") {
                logger.info(`Mission ${missionId} SUCCESS`);
            }

            return;
        }

    } catch (err) {
        logger.error("Erreur MQTT : " + err.message);
    }

});

export default client;