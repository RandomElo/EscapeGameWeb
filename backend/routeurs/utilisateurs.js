import e from "express";
import { connexion, deconnexion, desactiver2FA, detailsToken, generer2FAControleur, genererQRCode, initialisationCode2FA, inscription, modifierMail, modifierMdp, monCompte, suppressionCompte, validationTokenModifierMdp, verification, verificationTokenChangementMail, verifier2FA } from "../controleurs/utilisateurs.js";
import { autorisationAcces } from "../middlewares/autorisationAcces.js";
import { suppression } from "../controleurs/admins/scenarios.js";

const routeurUtilisateurs = e.Router();

routeurUtilisateurs.post("/inscription", inscription);
routeurUtilisateurs.post("/connexion", connexion);
routeurUtilisateurs.get("/verification", verification);
routeurUtilisateurs.post("/generer-2fa", generer2FAControleur);
routeurUtilisateurs.post("/verifier-2fa", verifier2FA);
routeurUtilisateurs.get("/details-token", detailsToken);
routeurUtilisateurs.get("/mon-compte", monCompte);
routeurUtilisateurs.delete("/deconnexion", autorisationAcces, deconnexion);
routeurUtilisateurs.put("/modifier-mail", autorisationAcces, modifierMail);
routeurUtilisateurs.put("/token-changement-mail", verificationTokenChangementMail)
routeurUtilisateurs.post("/modifier-mdp", autorisationAcces, modifierMdp)
routeurUtilisateurs.put("/validation-modifier-mdp", autorisationAcces, validationTokenModifierMdp)

// --- ACTIVATION 2FA depuis /mon-compte ---
routeurUtilisateurs.post("/qr-code-2fa", autorisationAcces, genererQRCode)
routeurUtilisateurs.post("/initialisation-code-2fa", autorisationAcces, initialisationCode2FA)
routeurUtilisateurs.delete("/desactiver-2fa", autorisationAcces, desactiver2FA)

routeurUtilisateurs.delete("/suppression", autorisationAcces, suppressionCompte)
export default routeurUtilisateurs;