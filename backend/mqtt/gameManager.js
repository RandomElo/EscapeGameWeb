import bdd from "../bdd/bdd.js";
import client from "./mqttClient.js";
import logger from "./logger.js";
import CommunicationBDD from "./CommunicationBDD.js";

let currentScenario = null;
let currentStepIndex = 0;
let steps = [];
let waitingForAudio = false;

// ============================================
// LOAD SCENARIO
// ============================================

async function loadScenario(scenarioId) {
    steps = await bdd.DerouleScenario.findAll({
        where: { scenarioId },
        order: [["ordre", "ASC"]],
    });

    if (!steps.length) {
        throw new Error("Scenario vide");
    }

    currentScenario = scenarioId;
    currentStepIndex = 0;

    logger.info(`Scenario ${scenarioId} chargé avec ${steps.length} étapes`);
}

// ============================================
// START GAME
// ============================================

export async function startGame(scenarioId) {
    try {
        await loadScenario(scenarioId);

        logger.info("Démarrage de la partie");

        await playCurrentStep();
    } catch (err) {
        logger.error("Erreur startGame : " + err.message);
    }
}

// ============================================
// STOP GAME
// ============================================

export function stopGame() {
    logger.warn("Arrêt de la partie");

    currentScenario = null;
    currentStepIndex = 0;
    steps = [];

    // broadcast stop à toutes les missions
    client.publish("escape/game/state", "stop");
}

// ============================================
// SKIP MISSION
// ============================================

export async function NextMission() {
    logger.warn("Next mission");

    currentStepIndex++;

    if (currentStepIndex >= steps.length) {
        logger.info("Fin du scénario");

        client.publish("escape/game/state", "finished");

        return;
    }

    await playCurrentStep();
}

//Passage mission suivante
export function setAudioFinished() {

    if (!waitingForAudio) return;

    waitingForAudio = false;

    logger.info("Audio terminé → passage à l'étape suivante");

    NextMission();
}

// ============================================
// PLAY STEP
// ============================================

async function playCurrentStep() {
    const step = steps[currentStepIndex];

    logger.info(`Lecture étape ${currentStepIndex + 1}`);

    // ==========================
    // MISSION
    // ==========================

    if (step.type === "mission") {
        const missionId = step.missionId;
        const topicMQTT = await CommunicationBDD.getTopicMqtt(missionId);
        logger.info(`Lancement mission ${missionId}`);

        // envoyer config spécifique si besoin
        if (step.configuration) {
            if(step.configuration.morse) {
                const tableauConfiguration = []
                for(const messageMorse of step.configuration.morse) {
                    const configuration =await CommunicationBDD.getAudioMorse(messageMorse)
                    
                    tableauConfiguration.push(configuration)
                }
                console.log(tableauConfiguration)
                step.configuration = tableauConfiguration;
            }
            client.publish(`escape/mission/${topicMQTT}/config`, JSON.stringify(step.configuration));
        }

        // trigger mission
        client.publish(`escape/mission/${topicMQTT}/state`, JSON.stringify("start"));
    }

    // ==========================
    // AUDIO
    // ==========================

    if (step.type === "audio") {
        const audio = await bdd.MessagesAudio.findByPk(step.audioId);

        if (!audio) {
            logger.error("Audio introuvable");
            return;
        }

        logger.info(`Lecture audio ${audio.nomFichier}`);

        waitingForAudio = true;

        client.publish(
            "escape/speaker/play",
            JSON.stringify({
                nomFichier: audio.nomFichier,
                type:"message"
            }),
        );

        return;
    }
}
