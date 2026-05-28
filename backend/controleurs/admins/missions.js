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
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const zip = new AdmZip(req.file.path);
        const entries = zip.getEntries();
        const dossierImages = "uploads";

        if (!fs.existsSync(dossierImages)) {
            fs.mkdirSync(dossierImages, {
                recursive: true,
            });
        }

        const nomDiapo = path.parse(req.file.originalname).name;
        const diapoExistant = await req.Diapos.findOne({
            where: {
                nom: nomDiapo,
            },
        });

        if (diapoExistant) {
            fs.unlinkSync(req.file.path);
            return res.json({
                etat: true,
                detail: {
                    cree: false,
                    detail: "Nom déjà présent",
                },
            });
        }

        const diapo = await req.Diapos.create({
            nom: nomDiapo,
        });

        let nombreImages = 0;
        const fichiersCrees = [];

        for (const entry of entries) {
            if (entry.isDirectory) {
                continue;
            }

            const nomFichierZip = path.basename(entry.entryName);
            if (!nomFichierZip.toLowerCase().endsWith(".png")) {
                continue;
            }

            const match = nomFichierZip.match(/^(\d+)\.png$/i);
            if (!match) {
                continue;
            }

            const ordre = parseInt(match[1]);
            const nomFichierPhysique = `${Date.now()}-${ordre}.png`;
            const chemin = path.join(dossierImages, nomFichierPhysique);

            fs.writeFileSync(chemin, entry.getData());

            fichiersCrees.push(chemin);

            try {
                const buffer = entry.getData();
                const image = await req.Images.create({
                    ordre,
                    image: buffer,
                    chemin,
                    diapoId: diapo.id,
                });

                nombreImages++;
            } catch (e) {
                if (fs.existsSync(chemin)) {
                    fs.unlinkSync(chemin);
                }
            }
        }

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (nombreImages === 0) {
            for (const fichier of fichiersCrees) {
                if (fs.existsSync(fichier)) {
                    fs.unlinkSync(fichier);
                }
            }

            await diapo.destroy();

            return res.status(400).json({
                etat: true,
                detail: { cree: false, detail: "Aucune image valide" },
            });
        }

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },

    "controleurEnregistrementDiapo",
    "Erreur lors de l'enregistrement du diapo",
);

export const telechargerDiaporama = gestionErreur(
    async (req, res) => {
        const { nom } = req.params;
        console.log("je suis ici")
        console.log(nom)
        const diaporama = await req.Diapos.findOne({ where: { nom }, raw: true });
        if (!diaporama) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const images = await req.Images.findAll({
            where: { diapoId: diaporama.id },
            attributes: ["image", "ordre"],
            order: [["ordre", "ASC"]],
            raw: true,
        });

        if (!images.length) {
            return res.status(404).json({
                etat: false,
                detail: "Aucune image trouvée",
            });
        }

        const zip = new AdmZip();

        images.forEach((img, index) => {
            const nom = `${String(img.ordre)}.png`;
            zip.addFile(nom, img.image);
        });

        const buffer = zip.toBuffer();

        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Length", buffer.length);
        res.setHeader("Content-Disposition", `attachment; filename="${diaporama.nom}.zip"`);

        return res.send(buffer);
    },
    "controleurTelechargerDiaporama",
    "Erreur lors du téléchargement du diaporama",
);
export const recupererDiapositive = gestionErreur(
    async (req, res) => {
        const { idDiapositive } = req.params;

        const image = await req.Images.findByPk(idDiapositive, { raw: true });

        res.setHeader("Content-Type", "image/png");
        res.send(image.image);
    },
    "controleurRecupererDiapositive",
    "Erreur lors de la récupération de la diapositive",
);

export const suppressionDiaporama = gestionErreur(
    async (req, res) => {
        const { nomFichier } = req.body;

        if (!nomFichier) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const diapo = await req.Diapos.findOne({ where: { nom: nomFichier }, raw: true });
        if (!diapo) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        await req.Images.destroy({ where: { diapoId: diapo.id } });
        await req.Diapos.destroy({ where: { id: diapo.id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSuppressionDiaporama",
    "Erreur lors de la suppression du diaporama",
);
export const suppressionAudioQuiz = gestionErreur(
    async (req, res) => {
        const { nomFichier } = req.body;

        if (!nomFichier) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const fichier = await req.QuizQuestions.findOne({ where: { nomFichier } });
        if (!fichier) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }
        const cheminDossierAudio = path.join(process.cwd(), "audios", "quiz", "questions");
        const cheminFichier = path.join(cheminDossierAudio, nomFichier);

        try {
            await fs.unlink(cheminFichier);
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.error("Erreur suppression fichier :", err);
                return res.status(500).json({ etat: false, erreur: "Erreur suppression fichier" });
            }
        }

        await req.QuizQuestions.destroy({ where: { id: fichier.id } });
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSuppressionAudioQuiz",
    "Erreur lors de la suppression de l'audio du quiz",
);
export const suppressionDevinette = gestionErreur(
    async (req, res) => {
        const { nomFichier } = req.body;

        if (!nomFichier) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const fichier = await req.Devinettes.findOne({ where: { nomFichier } });
        if (!fichier) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }
        const cheminDossierAudio = path.join(process.cwd(), "audios", "devinette");
        const cheminFichier = path.join(cheminDossierAudio, nomFichier);

        try {
            await fs.unlink(cheminFichier);
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.error("Erreur suppression fichier :", err);
                return res.status(500).json({ etat: false, erreur: "Erreur suppression fichier" });
            }
        }

        await req.Devinettes.destroy({ where: { id: fichier.id } });
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSuppressionDevinette",
    "Erreur lors de la suppression de la devinette",
);
