import gestionErreur from "../../middlewares/gestionErreur.js";

async function recuperationDetailsParties(parties, req) {
    const equipesIds = [...new Set(parties.map((p) => p.equipeId))];
    const scenariosIds = [...new Set(parties.map((p) => p.scenarioId))];

    const [equipes, membres, scenarios, missions] = await Promise.all([
        req.Equipes.findAll({
            where: { id: equipesIds },
            attributes: ["id", "nom"],
            raw: true,
        }),
        req.MembresEquipe.findAll({
            where: { equipeId: equipesIds },
            attributes: ["equipeId"],
            raw: true,
        }),
        req.Scenarios.findAll({
            where: { id: scenariosIds },
            attributes: ["id", "nom"],
            raw: true,
        }),
        req.MissionsScenario.findAll({
            where: { scenarioId: scenariosIds },
            attributes: ["scenarioId"],
            raw: true,
        }),
    ]);

    const equipesMap = Object.fromEntries(equipes.map((e) => [e.id, e]));
    const scenariosMap = Object.fromEntries(scenarios.map((s) => [s.id, s]));

    const membresCount = {};
    for (const m of membres) {
        membresCount[m.equipeId] = (membresCount[m.equipeId] || 0) + 1;
    }

    const missionsCount = {};
    for (const m of missions) {
        missionsCount[m.scenarioId] = (missionsCount[m.scenarioId] || 0) + 1;
    }

    return parties.map((partie) => ({
        equipeNom: equipesMap[partie.equipeId]?.nom || null,
        nbrMembres: membresCount[partie.equipeId] || 0,
        scenarioNom: scenariosMap[partie.scenarioId]?.nom || null,
        nbrMissions: missionsCount[partie.scenarioId] || 0,
        dateDebut: partie.dateDebut,
    }));
}

export const partiesEnCours = gestionErreur(
    async (req, res) => {
        const parties = await req.Parties.findAll({ where: { statut: "enCours" } });
        if (parties.length > 0) {
            return res.json({ etat: true, detail: { partiesEnCours: true, details: await recuperationDetailsParties(parties, req) } });
        } else {
            const equipes = await req.Equipes.findAll();
            const scenarios = await req.Scenarios.findAll();

            return res.json({ etat: true, detail: { partiesEnCours: false, details: { equipes, scenarios } } });

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

        return res.json({ etat: true, detail: { partieLancer: true, details: await recuperationDetailsParties(await req.Parties.findAll({ where: { statut: "enCours" } }), req) } });
    },
    "controleurLancerPartie",
    "Erreur lors du lancement de la partie",
);
