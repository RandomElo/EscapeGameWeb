import gestionErreur from "../middlewares/gestionErreur.js";

export const recupererTout = gestionErreur(async (req, res) => {
    const scores = await req.Scores.findAll({ raw: true });

    const scoreParties = {};
    const scoreMissions = {}
    for (const score of scores) {
        if (scoreParties[score.partieId]) {
            scoreParties[score.partieId] += score.score;
        } else {
            scoreParties[score.partieId] = score.score;
        }
        if (scoreMissions[score.missionId]) {
            scoreMissions[score.missionId] += score.score;

        } else {
            scoreMissions[score.missionId] = score.score;
        }
    }

    const classementGeneral = []
    for (const [partieId, score] of Object.entries(scoreParties)) {
        const partie = await req.Parties.findByPk(partieId, { raw: true })
        const equipe = await req.Equipes.findByPk(partie.equipeId, { raw: true })
        const nbrMembres = await req.MembresEquipe.count({ where: { id: equipe.id } })

        classementsGenerales.push({ partieId, score, nomEquipe: equipe.nom, nbrMembres })
    }

    const classementsMissions = []
    for (const [missionId, score] of Object.entries(scoreMissions)) {
        const mission = await req.Missions.findByPk(missionId, { raw: true })
        const equipe = await req.Equipes.findByPk(partie.equipeId, { raw: true })
        const nbrMembres = await req.MembresEquipe.count({ where: { id: equipe.id } })

        classementsMissions.push({ missionId, nom: mission.nom, description: mission.description, score, nomEquipe: equipe.nom, nbrMembres })
    }

    return res.json({ etat: true, detail: { classementGeneral, classementsMissions } })
}, "controleurRecupererTout", "Erreur lors de la récupération des classements")

export const general = gestionErreur(async (req, res) => {
    return res.json({ etat: true, detail: "dev" })
}, "controleurRecuperationClassementGenejural", "Erreur lors de la récupération du classement général");

export const mission = gestionErreur((req, res) => { }, "controleurRecuperationClassementMission", "Erreur lors de la récupération d'un classement pour une action");

export const listeMissions = gestionErreur((req, res) => { }, "controleurRecuperationListeMissionClassée", "Erreur lors de la récupération des missions classées");