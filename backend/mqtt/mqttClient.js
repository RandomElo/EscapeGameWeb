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
        // CONNECTED (handshake)
        // =====================================================

        const connectedMatch = topic.match(/^escape\/mission\/(\d+)\/connected$/);
        if (connectedMatch) {
            const missionId = connectedMatch[1];

            logger.info(`Mission ${missionId} connectée`);

            client.publish(
                `escape/mission/${missionId}/connected/reply`,
                "ok"
            );

            client.publish(
                `escape/mission/${missionId}/state`,
                "config"
            );

            return;
        }

        // =====================================================
        // WEB → SAVE CONFIG
        // =====================================================

        const configMatch = topic.match(/^escape\/mission\/(\d+)\/config$/);
        if (configMatch) {
            const missionId = configMatch[1];

            const missionConfig = JSON.parse(msg);

            await CommunicationBDD.updateMissionConfig(missionId, missionConfig);

            logger.info(`Config mission ${missionId} sauvegardée`);

            return;
        }

        // =====================================================
        // MISSION → CONFIG REQUEST
        // =====================================================

        const requestMatch = topic.match(/^escape\/mission\/(\d+)\/config\/request$/);
        if (requestMatch) {
            const missionId = requestMatch[1];

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
                } else {
                    logger.warn(`Pas de config pour mission ${missionId}`);
                }

                return;
            }

            // OK / KO restent comme avant
            if (msg === "ok") {
                logger.info(`Mission ${missionId} validée`);
                client.publish(
                    `escape/mission/${missionId}/led`,
                    "ok"
                );
                return;
            }

            if (msg === "ko") {
                logger.warn(`Mission ${missionId} erreur`);
                client.publish(
                    `escape/mission/${missionId}/led`,
                    "error"
                );
                return;
            }
        }

        // =====================================================
        // EVENT RFID
        // =====================================================

        const eventMatch = topic.match(/^escape\/mission\/(\d+)\/event$/);
        if (eventMatch) {
            logger.info(`Event mission ${eventMatch[1]} : ${msg}`);
            return;
        }

    } catch (err) {
        logger.error("Erreur MQTT : " + err.message);
    }

});

export default client;
