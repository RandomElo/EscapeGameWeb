import Missions from "../bdd/modeles/Missions.js";
import logger from "./logger.js";

class CommunicationBDD {

    async updateMissionConfig(missionId, config) {
        const mission = await Missions.findByPk(missionId);

        if (!mission) {
            logger.error(`Mission ${missionId} introuvable`);
            return;
        }

        mission.formatReponse = JSON.stringify(config);
        await mission.save();

        logger.info(`Config mission ${missionId} sauvegardée en BDD`);
    }

    async getMissionConfig(missionId) {
        const mission = await Missions.findByPk(missionId);

        if (!mission) {
            logger.warn(`Mission ${missionId} introuvable`);
            return null;
        }

        if (!mission.formatReponse) {
            return null;
        }

        try {
            return JSON.parse(mission.formatReponse);
        } catch {
            logger.warn(`Config mission ${missionId} invalide en BDD`);
            return null;
        }
    }

}

export default new CommunicationBDD();
