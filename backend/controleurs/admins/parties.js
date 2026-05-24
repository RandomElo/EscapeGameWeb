import gestionErreur from "../../middlewares/gestionErreur.js";
import { startGame } from "../../mqtt/gameManager.js";

async function recuperationDetailsPartie(partie, req) {
    if (!partie?.equipeId || !partie?.scenarioId) {
        throw new Error("Données partie invalides");
    }

    const [equipe, membres, scenario, derouleScenario] = await Promise.all([
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
        req.DerouleScenario.findAll({
            where: { scenarioId: partie.scenarioId },
            attributes: ["id", "type", "missionId", "scenarioId", "audioId", "ordre", "configuration"],
            order: [["ordre", "ASC"]],
            raw: true,
        }),
    ]);

    // Extraction des IDs
    const missionIds = derouleScenario.filter((d) => d.type === "mission" && d.missionId).map((d) => d.missionId);

    const audioIds = derouleScenario.filter((d) => d.type === "audio" && d.audioId).map((d) => d.audioId);
    // Chargement des données associées
    const [missions, audios, aideAudios] = await Promise.all([
        req.Missions.findAll({
            where: { id: missionIds },
            attributes: ["id", "nom", "description", "topicMQTT"],
            raw: true,
        }),
        req.MessagesAudio.findAll({
            where: { id: audioIds },
            raw: true,
        }),
        req.AideAudios.findAll({
            raw: true,
            attributes: ["missionId", "scenarioId", "audioId"],
        }),
    ]);

    // Indexation pour accès rapide O(1)
    const missionsMap = new Map(missions.map((m) => [m.id, m]));
    const audiosMap = new Map(audios.map((a) => [a.id, a]));

    const mapAideAudios = {};

    for (const aide of aideAudios) {
        const key = `${aide.scenarioId}_${aide.missionId}`;

        if (!mapAideAudios[key]) {
            mapAideAudios[key] = [];
        }

        const audio = audiosMap.get(aide.audioId);
        if (audio) {
            mapAideAudios[key].push({
                nomFichier: audio.nomFichier,
                detail: audio.detail,
            });
        }
    }

    // Enrichissement du déroulé
    const derouleScenarioEnrichi = derouleScenario
        .map((step, index) => {
            if (step.type === "mission") {
                const mission = missionsMap.get(step.missionId);
                const key = `${step.scenarioId}_${step.missionId}`;

                return {
                    type: "mission",
                    ordre: step.ordre,
                    topicMQTT: mission.topicMQTT,
                    nom: mission?.nom || null,
                    description: mission?.description || null,
                    configuration: step.configuration,
                    tags: [],
                    etat: index == 0 || (index == 1 && derouleScenario[0].type == "audio") ? "EnCours" : "EnAttente",
                    audiosAide: mapAideAudios[key] || [],
                };
            }

            if (step.type === "audio") {
                const audio = audiosMap.get(step.audioId);

                return {
                    type: "audio",
                    ordre: step.ordre,
                    nom: audio?.detail || null,
                    etat: index == 0 ? "EnCours" : "EnAttente",
                };
            }

            return null;
        })
        .filter(Boolean);

    return {
        derouleScenario: derouleScenarioEnrichi,
        detailsPartie: {
            equipeNom: equipe?.nom || null,
            nbrMembres: membres,
            nbrMissions: missions.length,
            scenarioNom: scenario?.nom || null,
            nbrEtapes: derouleScenarioEnrichi.length,
            dateDebut: partie.dateDebut,
        },
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

        await startGame(scenario);

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