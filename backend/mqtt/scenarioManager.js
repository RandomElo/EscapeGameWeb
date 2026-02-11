import logger from "./logger.js";
import Missions from "../bdd/modeles/Missions.js"
// import mqttClient from "./mqttClient.js";

let currentScenario = null;
let currentMissionIndex = 0;
let missionConfigs = {};

// CHARGEMENT MANUEL (MQTT JSON)

function loadScenario(scenario) {
    currentScenario = scenario;
    currentMissionIndex = 0;

    logger.info(`Scénario chargé: ${scenario.name}`);
    logger.info(`Ordre des missions: ${scenario.missions.join(" → ")}`);

    startNextMission();
}

// CHARGEMENT DEPUIS BDD (Sequelize)

async function loadScenarioFromDB(id) {
    try {
        const scenario = await Scenario.findByPk(id, {
            include: Mission
        });

        if (!scenario) {
            logger.error("Scénario introuvable");
            return;
        }

        const formattedScenario = {
            id: scenario.id,
            name: scenario.name,
            missions: scenario.Missions.map(m => m.id)
        };

        loadScenario(formattedScenario);

    } catch (err) {
        logger.error("Erreur DB scénario: " + err.message);
    }
}

// DÉMARRAGE MISSION

function startNextMission() {
    if (!currentScenario) return;

    if (currentMissionIndex >= currentScenario.missions.length) {
        logger.info("Scénario terminé !");
        return;
    }

    const missionId = currentScenario.missions[currentMissionIndex];

    logger.info(`Démarrage mission ${missionId}`);

    // mqttClient.publish(
    //     `escape/mission/${missionId}/state`,
    //     "config"
    // );
}

// VALIDATION MISSION

function completeMission(missionId) {
    if (!currentScenario) return;

    const expectedMission = currentScenario.missions[currentMissionIndex];

    if (missionId == expectedMission) {
        logger.info(`Mission ${missionId} réussie`);

        mqttClient.publish(
            `escape/mission/${missionId}/state`,
            "SUCCESS"
        );

        currentMissionIndex++;
        setTimeout(startNextMission, 2000);
    }
}

// CONFIG MISSIONS

function updateMissionConfig(missionId, config) {
    missionConfigs[missionId] = config;

    logger.info(
        `Config mission ${missionId} mise à jour: ${JSON.stringify(config)}`
    );

    mqttClient.publish(
        `escape/mission/${missionId}/config`,
        JSON.stringify(config)
    );
}

function getMissionConfig(missionId) {
    return missionConfigs[missionId];
}

export default {
    loadScenario,
    loadScenarioFromDB,
    completeMission,
    updateMissionConfig,
    getMissionConfig
};
