import gestionErreur from "../../middlewares/gestionErreur.js";
async function recuperationDetailsPartie(partie, req) {
    if (!partie?.equipeId || !partie?.scenarioId) {
        throw new Error("Données partie invalides");
    }

    const [equipe, membres, scenario, missionsScenario] = await Promise.all([
        req.Equipes.findOne({
            where: { id: partie.equipeId },
            attributes: ["nom"],
            raw: true,
        }),
        req.MembresEquipe.count({
            where: { equipeId: partie.equipeId },
        }),
        req.Scenarios.findOne({
            where: { id: partie.scenarioId },
            attributes: ["nom"],
            raw: true,
        }),
        req.MissionsScenario.findAll({
            where: { scenarioId: partie.scenarioId },
            attributes: ["missionId"],
            raw: true,
        }),
    ]);

    const missionIds = missionsScenario.map((m) => m.missionId);

    const missions = await req.Missions.findAll({
        where: { id: missionIds },
        attributes: ["id", "nom", "description"],
        raw: true,
    });
    const missionsAvecTags = missions.map((m) => ({
        ...m,
        tags: [],
    }));
    return {
        equipeNom: equipe?.nom || null,
        nbrMembres: membres,
        scenarioNom: scenario?.nom || null,
        nbrMissions: missions.length,
        missions: missionsAvecTags,
        dateDebut: partie.dateDebut,
    };
}
export const partieEnCours = gestionErreur(
    async (req, res) => {
        const partie = await req.Parties.findOne({ where: { statut: "enCours" } });
        if (partie) {
            return res.json({ etat: true, detail: { partieEnCours: true, details: await recuperationDetailsPartie(partie, req) } });
        } else {
            const equipes = await req.Equipes.findAll();
            const scenarios = await req.Scenarios.findAll();

            return res.json({ etat: true, detail: { partieEnCours: false, details: { equipes, scenarios } } });

            // je doit récupérer les scénarios et les equipes
        }
    },
    "controleurPartiesEnCours",
    "Erreur lors de la récupération des parties en cours",
);

export const lancer = gestionErreur(
    async (req, res) => {
        const { scenario, equipe } = req.body;

        if (!scenario || !equipe) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const [equipeDetails, scenarioDetails] = await Promise.all([req.Equipes.findByPk(equipe, { raw: true }), req.Scenarios.findByPk(scenario, { raw: true })]);

        if (!equipeDetails || !scenarioDetails) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource introuvable",
            });
        }

        const partieEquipe = await req.Parties.findOne({
            where: { equipeId: equipe, statut: "enCours" },
            raw: true,
        });

        if (partieEquipe) {
            return res.json({
                etat: true,
                detail: { partieLancer: false, details: "L'équipe est déjà en partie" },
            });
        }

        const membresEquipe = await req.MembresEquipe.findAll({
            where: { equipeId: equipe },
            attributes: ["utilisateurId"],
            raw: true,
        });

        const utilisateursIds = membresEquipe.map((m) => m.utilisateurId);

        if (utilisateursIds.length === 0) {
            return res.json({
                etat: true,
                detail: { partieLancer: false, details: "Aucun membre dans l'équipe" },
            });
        }

        const toutesEquipes = await req.MembresEquipe.findAll({
            where: { utilisateurId: utilisateursIds },
            attributes: ["equipeId"],
            raw: true,
        });

        const equipesIds = [...new Set(toutesEquipes.map((e) => e.equipeId))];

        const partieExistante = await req.Parties.findOne({
            where: {
                equipeId: equipesIds,
                statut: "enCours",
            },
            raw: true,
        });

        if (partieExistante) {
            return res.json({
                etat: true,
                detail: { partieLancer: false, details: "Un joueur est déjà en partie dans une autre équipe" },
            });
        }

        await req.Parties.create({
            equipeId: equipe,
            scenarioId: scenario,
            dateDebut: new Date(),
        });

        console.log("JE DOIT ENVOYER UN MESSAGE EN MQTT");

        return res.json({ etat: true, detail: { partieLancer: true, details: await recuperationDetailsPartie(await req.Parties.findOne({ where: { statut: "enCours" } }), req) } });
    },
    "controleurLancerPartie",
    "Erreur lors du lancement de la partie",
);

export const avorterPartie = gestionErreur(
    async (req, res) => {
        const partie = await req.Parties.findOne({ where: { statut: "enCours" } });
        if (!partie) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        await req.Parties.update({ statut: "abandonnee" }, { where: { id: partie.id } });
        return res.json({ etat: true, detail: "ok" });
    },
    "controleurAvorterPartie",
    "Erreur lors de l'arrêt de la partie",
);
