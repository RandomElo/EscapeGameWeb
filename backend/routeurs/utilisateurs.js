import e from "express";
import { connexion, deconnexion, detailsToken, generer2FA, inscription, modifierMail, monCompte, verification, verifier2FA } from "../controleurs/utilisateurs.js";
import { autorisationAcces } from "../middlewares/autorisationAcces.js";

const routeurUtilisateurs = e.Router();

routeurUtilisateurs.post("/inscription", inscription);
routeurUtilisateurs.post("/connexion", connexion);
routeurUtilisateurs.get("/verification", verification);
routeurUtilisateurs.post("/generer-2fa", generer2FA);
routeurUtilisateurs.post("/verifier-2fa", verifier2FA);
routeurUtilisateurs.get("/details-token", detailsToken);
routeurUtilisateurs.get("/mon-compte", monCompte);
routeurUtilisateurs.delete("/deconnexion", autorisationAcces, deconnexion);
routeurUtilisateurs.put("/modifier-mail", autorisationAcces, modifierMail);

export default routeurUtilisateurs;