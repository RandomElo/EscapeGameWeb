import gestionErreur from "../../middlewares/gestionErreur.js";

export const liste = gestionErreur((req, res) => {}, "controleurRecuperationListeMission", "Erreur lors de la récupération de la liste des missions");
export const creation = gestionErreur((req, res) => {}, "controleurCreationMission", "Erreur lors de la création de la mission");
export const suppression = gestionErreur((req, res) => {}, "controleurSuppressionMission", "Erreur lors de la suppression de la mission");
export const modifierEnTete = gestionErreur((req, res) => {}, "controleurModificationEnTete", "Erreur lors de la mise à jour de l'en-tête");
export const modifierConfiguration = gestionErreur((req, res) => {}, "controleurModificationConfiguration", "Erreur lors de la modification de la configuration");
export const modifierFormatReponse = gestionErreur((req, res) => {}, "controleurModificationFormat Reponse", "Erreur lors de la modification du format réponse");
