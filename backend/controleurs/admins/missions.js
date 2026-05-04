import gestionErreur from "../../middlewares/gestionErreur.js";
import { ConfigurationInterfaceAdmin } from "./scenarios.js";

async function RecuperationMissions(req) {
    return await req.Missions.findAll();
}

export const liste = gestionErreur(
    async (req, res) => {
        return res.json({ etat: true, detail: await RecuperationMissions(req) });
    },
    "controleurRecuperationListeMission",
    "Erreur lors de la récupération de la liste des missions",
);
export const creation = gestionErreur(
    async (req, res) => {
        const { nom, description } = req.body;
        if (!nom || !description) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        await req.Missions.create({
            nom,
            description,
        });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurCreationMission",
    "Erreur lors de la création de la mission",
);
export const suppression = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        if (!req.params.id) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const mission = await req.Missions.findByPk(id, { raw: true });
        if (!mission) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource introuvable",
            });
        }

        await req.Missions.destroy({ where: { id } });
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSuppressionMission",
    "Erreur lors de la suppression de la mission",
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

        const mission = await req.Missions.findByPk(id, { raw: true });
        if (!mission) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Missions.update({ nom }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationNom",
    "Erreur lors de la modification du nom",
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

        const mission = await req.Missions.findByPk(id, { raw: true });
        if (!mission) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Missions.update({ description }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationDescription",
    "Erreur lors de la modification de la description",
);

export const modificationConfiguration = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { configuration } = req.body;

        if (!req.params.id || !configuration) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const mission = await req.Missions.findByPk(id, { raw: true });
        if (!mission) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Missions.update({ configuration }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationConfiguration",
    "Erreur lors de la modification de la configuration",
);

export const modificationAdresseIp = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { adresseIp } = req.body;
        if (!req.params.id || !adresseIp) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const mission = await req.Missions.findByPk(id, { raw: true });
        if (!mission) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Missions.update({ ipAdresse: adresseIp }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationAdresseIp",
    "Erreur lors de la modification de la adresse IP",
);
