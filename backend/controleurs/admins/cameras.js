import gestionErreur from "../../middlewares/gestionErreur.js";


export const liste = gestionErreur((req, res) => {}, "controleurRecuperationListe", "Erreur lors de la récupération des caméras.");

// WebSocket flux caméras

export const tournerCamera = gestionErreur((req, res) => {}, "controleurTournerCamera", "Erreur lors du pivotement de la caméra");

export const recuperationToken = gestionErreur((req, res) => {
    
}, "controleurRecuperationTokenCamera", "Erreur lors de la récupération du token d'accès a la caméra")