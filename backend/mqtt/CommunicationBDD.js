import { access } from "fs/promises";
import bdd from "../bdd/bdd.js";
import generateMorseAudio from "../fonctions/genererMorse.js";
import logger from "./logger.js";
import path from "path";
import { fileURLToPath } from "url";
import { generationAudiosMission, generationTTS } from "../controleurs/admins/audios.js";
import { Sequelize } from "sequelize";
import { Op } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cheminDossierAudios = path.resolve(__dirname, "../../audios");
class CommunicationBDD {
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
            const audio = await bdd.MorseAudios.findOne({ where: { reponse: message }, raw: true });

            if (!audio) {
                logger.info(`Génération morse :  ${message}`);

                return await generateMorseAudio(message);
            } else {
                return { morse: audio.reponse, nomFichier: audio.nomFichier };
            }
        } catch (err) {
            logger.error(`Erreur getAudioMorse : ${err.message}`);
            return null;
        }
    }

    async getDevinette(reponse, code) {
        try {
            const devinette = await bdd.Devinettes.findOne({ where: { reponse }, raw: true });

            if (!devinette) {
                logger.info(`Devinette inexistante :  ${reponse}`);
                return false;
            } else {
                try {
                    await access(path.resolve(__dirname, "../audios/devinette", devinette.nomFichier), constants.F_OK);

                    return true;
                } catch {
                    console.log("je doit générer la DEVINETTTE");
                    const cheminDossier = path.resolve(__dirname, "../audios/devinette");
                    await generationTTS(cheminDossier, devinette.nomFichier, devinette.devinette);
                }
                return { reponse: devinette.reponse, nomFichier: devinette.nomFichier, code };
            }
        } catch (err) {
            logger.error(`Erreur getDevinette : ${err.message}`);
            return null;
        }
    }

    async getDiaporama(nom, combinaisonSecrete, badges) {
        try {
            const diaporama = await bdd.Diapos.findOne({ where: { nom }, raw: true });

            if (!diaporama) {
                logger.info(`Diaporama inexistant :  ${nom}`);
                diaporama;
                return false;
            } else {
                return { diaporama: nom, combinaisonSecrete, badges };
            }
        } catch (err) {
            logger.error(`Erreur getDiaporama : ${err.message}`);
            return null;
        }
    }

    async recupererQuestions(type, nombre) {
        const partieId = (await bdd.Parties.findOne({ where: { statut: "enCours" } })).id;

        const questionsPosees = await bdd.QuestionPoseesPartie.findAll({ where: { partieId }, attributes: ["questionId"], raw: true });

        const idsQuestionsPosees = questionsPosees.map((q) => q.questionId);

        const questions = await bdd.QuizQuestions.findAll({
            where: { difficulte: type, id: { [Op.notIn]: idsQuestionsPosees } },
            attributes: ["id", "nomFichier", "type", "reponse"],
            order: bdd.sequelize.random(),
            limit: nombre,
            raw: true,
        });

        await bdd.QuestionPoseesPartie.bulkCreate(
            questions.map((q) => ({
                partieId,
                questionId: q.id,
            })),
        );
        logger.info("Longeur : " + questions.length);
        return questions;
    }
    async getBoiteAQuizInitialisation() {
        try {
            const questionFacile = await this.recupererQuestions("facile", 21);
            const questionDur = await this.recupererQuestions("difficile", 6);

            const comboFlop = (
                await bdd.QuizAudios.findAll({
                    where: { type: "serieErreurs" },
                    attributes: ["nomFichier"],
                    order: bdd.sequelize.random(),
                    limit: 3,
                    raw: true,
                })
            ).map((q) => q.nomFichier);

            const comboTop = (
                await bdd.QuizAudios.findAll({
                    where: { type: "finQuiz" },
                    attributes: ["nomFichier"],
                    order: bdd.sequelize.random(),
                    limit: 1,
                    raw: true,
                })
            ).map((q) => q.nomFichier);
            [0];

            const bonneReponse = (
                await bdd.QuizAudios.findAll({
                    where: { type: "bonneReponse" },
                    attributes: ["nomFichier"],
                    order: bdd.sequelize.random(),
                    limit: 20,
                    raw: true,
                })
            ).map((q) => q.nomFichier);

            const mauvaiseReponse = (
                await bdd.QuizAudios.findAll({
                    where: { type: "mauvaiseReponse" },
                    attributes: ["nomFichier"],
                    order: bdd.sequelize.random(),
                    limit: 20,
                    raw: true,
                })
            ).map((q) => q.nomFichier);

            return { questionFacile, questionDur, comboFlop, comboTop, bonneReponse, mauvaiseReponse };
        } catch (err) {
            logger.error(`Erreur getBoiteAQuiz : ${err.message}`);
            return null;
        }
    }
    async verificationAudiosNecessaire(donnees) {
        for (const texte of donnees) {
            const audio = await bdd.MissionAudios.findOne({ where: { texte }, raw: true });
            const tableauAGenerer = [];
            if (!audio) tableauAGenerer.push(texte);
        }

        logger.info("Audio à générer");
        logger.info(tableauAGenerer);
        await generationAudiosMission(tableauAGenerer);
        logger.info("Audio mission générer");
    }

    async demarragePartie(missionId) {
        try {
            console.log("Je suis dans démarrage partie")
            await bdd.EtatsMissions.update({ etat: "finie" }, { where: { etat: "enCours" } });

            const partie = await bdd.Parties.findOne({ where: { statut: "enCours" } });
            await bdd.EtatsMissions.create({ partieId: partie.id, missionId });
        } catch (err) {
            logger.error(`Erreur demarragePartie : ${err.message}`);
            return null;
        }
    }

    async terminerMission() {
        try {
            console.log("je suis dans terminer mission")
            await bdd.EtatsMissions.update({ dateFin: new Date(), etat: "finie" }, { where: { etat: "enCours" } });
        } catch (err) {
            logger.error(`Erreur terminerMission : ${err.message}`);
            return null;
        }
    }
}

export default new CommunicationBDD();
