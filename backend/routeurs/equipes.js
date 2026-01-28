import e from "express";
import { ajoutUtilisateur, creation, creeDemandeAdhesion, demandeAdhesion, listeMembres, mesEquipes, modificationNom, quitter, reponseDemandeAdhesion, suppressionEquipe, suppressionMembre } from "../controleurs/equipes.js";
import { autorisationAcces } from "../middlewares/autorisationAcces.js";

const routeurEquipes = e.Router();
routeurEquipes.get("/mes-equipes", autorisationAcces, mesEquipes);
routeurEquipes.post("/creation", autorisationAcces, creation);
routeurEquipes.patch("/modification-nom", autorisationAcces, modificationNom);
routeurEquipes.get("/liste-membres", autorisationAcces, listeMembres);
routeurEquipes.post("/ajout-utilisateur", autorisationAcces, ajoutUtilisateur);

routeurEquipes.delete("/quitter", autorisationAcces, quitter);
routeurEquipes.delete("/suppression-membre", autorisationAcces, suppressionMembre);
routeurEquipes.delete("/suppression", autorisationAcces, suppressionEquipe);

routeurEquipes.post("/cree-demande-adhesion", autorisationAcces, creeDemandeAdhesion);
routeurEquipes.get("/demandes-adhesion", autorisationAcces, demandeAdhesion);
routeurEquipes.patch("/reponse-demande-adhesion", autorisationAcces, reponseDemandeAdhesion);

export default routeurEquipes;