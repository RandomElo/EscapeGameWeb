import bdd from "../bdd/bdd.js"
import logger from "./logger.js";

class CommunicationBDD {

    async updateMissionConfig(missionId, config) {
        const mission = await bdd.Missions.findByPk(missionId);

        if (!mission) {
            logger.error(`Mission ${missionId} introuvable`);
            return;
        }

        mission.configuration = JSON.stringify(config);
        await mission.save();

        logger.info(`Config mission ${missionId} sauvegardée en BDD`);
    }

    async getMissionConfig(missionId) {
        const mission = await bdd.Missions.findByPk(missionId);

        if (!mission) {
            logger.warn(`Mission ${missionId} introuvable`);
            return null;
        }

        if (!mission.configuration) {
            return null;
        }

        try {
            return JSON.parse(mission.configuration);
        } catch {
            logger.warn(`Config mission ${missionId} invalide en BDD`);
            return null;
        }
    }

}

export default new CommunicationBDD();
