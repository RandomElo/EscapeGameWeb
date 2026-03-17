import gestionErreur from "../../middlewares/gestionErreur.js";

async function recuperationDetailsParties(parties) {
    let tableauRecapitulatif = [];
    for (const partie of parties) {
        const equipe = await req.Equipes.findByPk(partie.equipeId);
        const listeMembres = await req.MembresEquipes.findAll({ where: { equipeId: partie.equipeId }, raw: true });
        const scenario = await req.Scenarios.findByPk(partie.scenarioId, { raw: true });
        const listeMissions = await req.MissionsScenario.findAll({ where: { scenarioId: partie.scenarioId }, raw: true });
        tableauRecapitulatif.push({ equipeNom: equipe.nom, nbrMembres: listeMembres.length, scenarioNom: scenario.nom, nbrMissions: listeMissions.length, dateDebut:partie.dateDebut });
    }
    return tableauRecapitulatif
}

export const partiesEnCours = gestionErreur(
    async (req, res) => {
        const parties = await req.Parties.findAll({ where: { statut: "enCours" } });
        if (parties.length > 0) {
            return res.json({ etat: true, detail: { partiesEnCours: true, details: await recuperationDetailsParties(parties) } });
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

        const membresEquipes = await req.MembresEquipes.findAll({
            where: { equipeId: equipe },
            attributes: ["utilisateurId"],
            raw: true,
        });

        const utilisateursIds = membresEquipes.map((m) => m.utilisateurId);

        if (utilisateursIds.length === 0) {
            return res.json({
                etat: true,
                detail: { partieLancer: false, details: "Aucun membre dans l'équipe" },
            });
        }

        const toutesEquipes = await req.MembresEquipes.findAll({
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

        const nouvellePartie = await req.Parties.create({
            equipeId: equipe,
            scenarioId: scenario,
            dateDebut: new Date(),
        });

        console.log("JE DOIT ENVOYER UN MESSAGE EN MQTT");

        return res.json({ etat: true, detail: "dev" });
    },
    "controleurLancerPartie",
    "Erreur lors du lancement de la partie",
);
