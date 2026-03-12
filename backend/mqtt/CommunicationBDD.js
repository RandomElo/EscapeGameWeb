import bdd from "../bdd/bdd.js";
import logger from "./logger.js";

class CommunicationBDD {

    // =====================================================
    // UPDATE MISSION CONFIG
    // =====================================================

    async updateMissionConfig(missionId, config) {
        try {
            const mission = await bdd.Missions.findByPk(missionId);

            if (!mission) {
                logger.error(`Mission ${missionId} introuvable`);
                return false;
            }

            // On stocke en JSON dans configuration
            mission.configuration = JSON.stringify(config);

            await mission.save();

            logger.info(`Config mission ${missionId} sauvegardée en BDD`);
            return true;

        } catch (err) {
            logger.error(`Erreur updateMissionConfig : ${err.message}`);
            return false;
        }
    }

    // =====================================================
    // GET MISSION CONFIG
    // =====================================================

    async getMissionConfig(missionId) {
        try {
            const mission = await bdd.Missions.findByPk(missionId);

            if (!mission) {
                logger.warn(`Mission ${missionId} introuvable`);
                return null;
            }

            if (!mission.configuration) {
                logger.warn(`Mission ${missionId} sans configuration`);
                return null;
            }

            try {
                return JSON.parse(mission.configuration);
            } catch (parseError) {
                logger.error(`Config mission ${missionId} invalide en BDD`);
                return null;
            }

        } catch (err) {
            logger.error(`Erreur getMissionConfig : ${err.message}`);
            return null;
        }
    }
}

export default new CommunicationBDD();
