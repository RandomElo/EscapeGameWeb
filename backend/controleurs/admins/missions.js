import gestionErreur from "../../middlewares/gestionErreur.js";
import { ConfigurationInterfaceAdmin } from "./scenarios.js";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import logger from "../../mqtt/logger.js";

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
        const { nom, description, topicMQTT } = req.body;
        if (!nom || !description || !topicMQTT) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        await req.Missions.create({
            nom,
            description,
            topicMQTT,
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

export const enregistrementDiapo = gestionErreur(
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                erreur: "Aucun fichier",
            });
        }

        const zip = new AdmZip(req.file.path);

        const entries = zip.getEntries();
        console.log("entries:", entries.length);
        const dossierImages = "uploads";

        if (!fs.existsSync(dossierImages)) {
            fs.mkdirSync(dossierImages);
        }
        const nomDossier = path.parse(req.file.originalname).name;
        if (await req.Diapos.findOne({ where: { nom: nomDossier } })) {
            return res.json({ etat: true, detail: { cree: false, detail: "Nom déjà présent" } });
        }
        const diapo = await req.Diapos.create({ nom: path.parse(req.file.originalname).name });

        for (const entry of entries) {
            // ignorer dossiers
            if (entry.isDirectory) {
                continue;
            }

            // uniquement png
            if (!entry.entryName.endsWith(".png")) {
                continue;
            }

            // récupérer le numéro
            const match = entry.entryName.match(/^(\d+)\.png$/);

            if (!match) {
                continue;
            }
            console.log(entry.entryName);
            const ordre = parseInt(match[1]);

            const nomFichier = `${Date.now()}-${entry.entryName}`;

            const chemin = path.join(dossierImages, nomFichier);

            // extraction
            fs.writeFileSync(chemin, entry.getData());

            logger.info({
                ordre,
                nomFichier,
                chemin,
                diapoId: diapo.id,
            });
            // BDD
            await req.Images.create({
                ordre,
                nomFichier,
                chemin,
                diapoId: diapo.id,
            });
        }

        fs.unlinkSync(req.file.path);

        res.json({
            etat: true,
            detail: "ok",
        });
    },
    "controleurEnregistrementDiapo",
    "Erreur lors de l'enregistrement du diapo",
);
