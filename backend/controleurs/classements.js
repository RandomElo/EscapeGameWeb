import gestionErreur from "../middlewares/gestionErreur.js";

export const recupererTout = gestionErreur(
    async (req, res) => {
        const scores = await req.Scores.findAll({ raw: true });

        const scoreParties = {};
        const scoreMissions = {};

        for (const score of scores) {
            // Classement général
            if (scoreParties[score.partieId]) {
                scoreParties[score.partieId] += score.score;
            } else {
                scoreParties[score.partieId] = score.score;
            }

            // Classement par mission
            const key = `${score.missionId}-${score.partieId}`;

            if (scoreMissions[key]) {
                scoreMissions[key].score += score.score;
            } else {
                scoreMissions[key] = {
                    missionId: score.missionId,
                    partieId: score.partieId,
                    score: score.score,
                };
            }
        }

        const classementGeneral = [];
        for (const [partieId, score] of Object.entries(scoreParties)) {
            const partie = await req.Parties.findByPk(partieId, { raw: true });
            const equipe = await req.Equipes.findByPk(partie.equipeId, { raw: true });
            const nbrMembres = await req.MembresEquipe.count({ where: { id: equipe.id } });

            classementGeneral.push({ partieId, score:score, nomEquipe: equipe.nom, nbrMembres });
        }

        const classementsMissions = [];

        for (const missionData of Object.values(scoreMissions)) {
            const mission = await req.Missions.findByPk(missionData.missionId, { raw: true });
            const partie = await req.Parties.findByPk(missionData.partieId, { raw: true });
            const equipe = await req.Equipes.findByPk(partie.equipeId, { raw: true });

            const nbrMembres = await req.MembresEquipe.count({
                where: { equipeId: equipe.id },
            });

            classementsMissions.push({
                missionId: mission.id,
                partieId: partie.id,
                nom: mission.nom,
                description: mission.description,
                score: missionData.score,
                nomEquipe: equipe.nom,
                nbrMembres,
            });
        }

        return res.json({ etat: true, detail: { classementGeneral, classementsMissions } });
    },
    "controleurRecupererTout",
    "Erreur lors de la récupération des classements",
);

export const general = gestionErreur(
    async (req, res) => {
        return res.json({ etat: true, detail: "dev" });
    },
    "controleurRecuperationClassementGenejural",
    "Erreur lors de la récupération du classement général",
);

export const mission = gestionErreur((req, res) => {}, "controleurRecuperationClassementMission", "Erreur lors de la récupération d'un classement pour une action");

export const listeMissions = gestionErreur((req, res) => {}, "controleurRecuperationListeMissionClassée", "Erreur lors de la récupération des missions classées");
