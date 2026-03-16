import gestionErreur from "../../middlewares/gestionErreur.js";

export const partiesEnCours = gestionErreur(
    async (req, res) => {
        const parties = await req.Parties.findAll({ where: { statut: "enCours" } });
        if (parties.length > 0) {
            // je doit récupérer les détails {equipe, dateDebut,scenarioNom, scenarioDescription; nbr de mission par scénario}

            return res.json({ etat: true, detail: { partiesEnCours: true, details: parties } });
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
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        // verifier bdd

    },
    "controleurLancerPartie",
    "Erreur lors du lancement de la partie",
);
