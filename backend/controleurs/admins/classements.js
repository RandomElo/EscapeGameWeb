import gestionErreur from "../../middlewares/gestionErreur.js";

export const modification = gestionErreur((req, res) => {}, "controleurModificationClassement", "Erreur lors de la modification du classement");
export const suppression = gestionErreur((req, res) => {}, "controleurSuppressionEnregistrementClassement", "Erreur lors de la suppression de l'enregistrement dans le classement");