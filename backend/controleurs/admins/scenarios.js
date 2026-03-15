import gestionErreur from "../../middlewares/gestionErreur.js";

export async function ConfigurationInterfaceAdmin(req) {
    const missionsListe = await req.Missions.findAll({
        raw: true,
        attributes: ["id", "nom", "description", "ipAdresse", "configuration"],
    });

    const missionsScenarios = await req.MissionsScenario.findAll({
        raw: true,
        attributes: ["missionId", "scenarioId", "ordre", "configuration"],
    });

    const mapMissionScenarios = {};

    missionsScenarios.forEach((rel) => {
        if (!mapMissionScenarios[rel.missionId]) {
            mapMissionScenarios[rel.missionId] = [];
        }

        mapMissionScenarios[rel.missionId].push({
            scenarioId: rel.scenarioId,
            ordre: rel.ordre,
            configuration: rel.configuration,
        });
    });

    // ajout du tableau scenarios dans chaque mission
    const missions = missionsListe.map((mission) => ({
        ...mission,
        scenarios: mapMissionScenarios[mission.id] || [],
    }));

    // scenario
    const scenariosListe = await req.Scenarios.findAll({ raw: true });
    // message audio
    const messagesAudio = await req.MessagesAudio.findAll({ raw: true });
    // adresse ip
    return { missions, scenarios: scenariosListe, messagesAudio };
}

export const configurationComplete = gestionErreur(
    async (req, res) => {
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurRecuperationConfiugrationComplete",
    "Erreur lors de la récupération des données pour l'interface d'administration",
);

export const liste = gestionErreur((req, res) => {}, "controleurListeScenarios", "Erreur lors de la récupération de la liste des scénarios");

export const details = gestionErreur((req, res) => {}, "controleurDetailsScenario", "Erreur lors de la récupération des détails du scénario");

export const creation = gestionErreur(
    async (req, res) => {
        const { nom, description } = req.body;
        if (!nom | !description) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        await req.Scenarios.create({
            nom,
            description,
        });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurCreationScenario",
    "Erreur lors de la création du scénario",
);

export const modificationNom = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { nom } = req.body;
        if (!req.params.id || !nom) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Scenarios.update({ nom }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationNomScenario",
    "Erreur lors de la modification du nom du scénario",
);

export const modificationDescription = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { description } = req.body;
        if (!req.params.id || !description) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Scenarios.update({ description }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "modificationDescription",
    "Erreur lors de la modification du scénario",
);

export const modificationOrdre = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { missions } = req.body;
        if (!missions || !id) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante 1",
            });
        }

        const listeMissions = await req.MissionsScenario.findAll({ where: { scenarioId: id }, raw: true });

        if (listeMissions.length !== missions.length) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        for (const mission of missions) {
            if (listeMissions.filter((element) => element.missionId == mission.id).length == 0) {
                return res.status(404).json({
                    etat: false,
                    detail: "Ressource inexistante",
                });
            }
        }

        for (const idMission in missions) {
            const mission = missions[idMission];
            await req.MissionsScenario.update({ ordre: idMission + 1 }, { where: { id: mission.id } });
        }

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationOrdreScenario",
    "Erreur lors la modification de l'ordre de la mission",
);

export const modificationEnTete = gestionErreur((req, res) => {}, "controleurModificationEnTete", "Erreur lors de la modification de l'en-tête du scénario");

export const ajoutMission = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { listeMissions } = req.body;
        if (!listeMissions || !id) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id);
        if (!scenario) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        const listeMissionsEnregistrees = await req.MissionsScenario.findAll({ where: { scenarioId: id }, raw: true });

        for (let idTableau in listeMissions) {
            const missionId = listeMissions[idTableau];

            if (listeMissionsEnregistrees.filter((item) => item.missionId == missionId).length > 0) {
                return res.status(400).json({
                    etat: false,
                    detail: "Requête incorrecte",
                });
            } else {
                await req.MissionsScenario.create({
                    scenarioId: id,
                    missionId,
                    ordre: idTableau,
                    configuration: '{ "etat": true }',
                });
            }
        }
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurAjoutMissionScenario",
    "Erreur lors de l'ajout de mission dans la scénario",
);

export const suppressionMission = gestionErreur((req, res) => {}, "controleurSuppressionMissionScenario", "Erreur lors de la suppression de mission dans la scénario");

export const modifierReponses = gestionErreur((req, res) => {}, "controleurModifierReponses", "Erreur lors de la mise a jour des réponses");

export const suppression = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        if (!req.params.id) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource introuvable",
            });
        }
        await req.Scenarios.destroy({ where: { id } });
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSuppressionScenario",
    "Erreur lors de la suppression du scénario",
);
