import gestionErreur from "../middlewares/gestionErreur.js";

export const general = gestionErreur((req, res) => {}, "controleurRecuperationClassementGenral", "Erreur lors de la récupération du classement général");

export const mission = gestionErreur((req, res) => {}, "controleurRecuperationClassementMission", "Erreur lors de la récupération d'un classement pour une action");

export const listeMissions = gestionErreur((req, res) => {}, "controleurRecuperationListeMissionClassée", "Erreur lors de la récupération des missions classées");