import e from "express";
import { ajoutAudio, ajouterAudiosAide, ajoutMission, configurationComplete, creation, details, liste, modificationDeroule, modificationDescription, modificationEnTete, modificationNom, modifierReponses, suppression, suppressionMission, supprimerAudioAide } from "../../controleurs/admins/scenarios.js";

const routeurScenarios = e.Router();

routeurScenarios.get("/configuration-complete", configurationComplete);
routeurScenarios.get("/liste", liste);
routeurScenarios.get("/:id/details", details);
routeurScenarios.post("/creation", creation);

routeurScenarios.patch("/:id/modification-nom", modificationNom);
routeurScenarios.patch("/:id/modification-description", modificationDescription);
routeurScenarios.patch("/:id/modification-en-tete", modificationEnTete);
routeurScenarios.post("/:id/ajout-mission", ajoutMission);
routeurScenarios.post("/:id/ajout-audio", ajoutAudio);
routeurScenarios.delete("/:id/suppression-mission", suppressionMission);
routeurScenarios.patch("/:id/modifier-reponse", modifierReponses);
routeurScenarios.patch("/:id/modification-deroule", modificationDeroule);
routeurScenarios.delete("/:id/suppression", suppression);
routeurScenarios.post("/:id/ajouter-audios-aide", ajouterAudiosAide)
routeurScenarios.delete("/:id/supprimer-audio-aide", supprimerAudioAide)

export default routeurScenarios;
