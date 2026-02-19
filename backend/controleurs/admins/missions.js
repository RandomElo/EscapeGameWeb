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
        const { nom, description, ipAdresse, reponse } = req.body;
        if (!nom || !description || !ipAdresse || !reponse) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        await req.Missions.create({
            nom,
            description,
            ipAdresse,
            configuration: reponse,
        });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurCreationMission",
    "Erreur lors de la création de la mission",
);
export const suppression = gestionErreur((req, res) => {}, "controleurSuppressionMission", "Erreur lors de la suppression de la mission");
export const modifierEnTete = gestionErreur((req, res) => {}, "controleurModificationEnTete", "Erreur lors de la mise à jour de l'en-tête");
export const modifierConfiguration = gestionErreur((req, res) => {}, "controleurModificationConfiguration", "Erreur lors de la modification de la configuration");
export const modifierconfiguration = gestionErreur((req, res) => {}, "controleurModificationFormat Reponse", "Erreur lors de la modification du format réponse");
