import gestionErreur from "../../middlewares/gestionErreur.js";

export const liste = gestionErreur((req, res) => {}, "controleurRecuperationListe", "Erreur lors de la récupération des caméras.")

// WebSocket flux caméras

export const tournerCamera = gestionErreur((req, res) => {}, "controleurTournerCamera", "Erreur lors du pivotement de la caméra")
