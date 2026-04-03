import { genererToken } from "../../fonctions/genererToken.js";
import gestionErreur from "../../middlewares/gestionErreur.js";
import jwt from "jsonwebtoken";

export const liste = gestionErreur((req, res) => {}, "controleurRecuperationListe", "Erreur lors de la récupération des caméras.");

// WebSocket flux caméras

export const tournerCamera = gestionErreur((req, res) => {}, "controleurTournerCamera", "Erreur lors du pivotement de la caméra");

export const recuperationToken = gestionErreur(
    async (req, res) => {
        const token = genererToken(10)
        await req.Tokens.create({ token, type: "accesBackendCamera" });

        return res.json({ etat: true, detail: token });
    },
    "controleurRecuperationTokenCamera",
    "Erreur lors de la récupération du token d'accès a la caméra",
);
