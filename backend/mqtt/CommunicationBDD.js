import bdd from "../bdd/bdd.js";
import generateMorseAudio from "../fonctions/genererMorse.js";
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

    async getTopicMqtt(missionId) {
        try {
            const mission = await bdd.Missions.findByPk(missionId);

            if (!mission) {
                logger.warn(`Mission ${missionId} introuvable`);
                return null;
            }

            return mission.topicMQTT;
        } catch (err) {
            logger.error(`Erreur getTopicMqtt : ${err.message}`);
            return null;
        }
    }

    async getAudioMorse(message) {
        
        try {
            const audio = await bdd.MorseAudios.findOne({where:{reponse:message}, raw:true});

            if (!audio) {
                logger.info(`Génération morse :  ${message}`);
                
                return await generateMorseAudio(message);
            } else {
                return {morse: audio.reponse,nomFichier:audio.nomFichier};
            }

        } catch (err) {
            logger.error(`Erreur getAudioMorse : ${err.message}`);
            return null;
        }
    }
}

export default new CommunicationBDD();
