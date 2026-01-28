import e from "express";
import { ajoutMission, creation, creationAudio, details, liste, modificationAudio, modificationEnTete, modificationOrdre, modifierReponses, suppression, suppressionMission } from "../../controleurs/admins/scenarios.js";

const routeurScenarios = e.Router();

routeurScenarios.get("/liste", liste);
routeurScenarios.get("/:id/details", details);
routeurScenarios.post("/creation", creation);
routeurScenarios.patch("/:id/modification-ordre", modificationOrdre);
routeurScenarios.patch("/:id/modification-en-tete", modificationEnTete);
routeurScenarios.post("/:id/ajout-mission", ajoutMission);
routeurScenarios.delete("/:id/suppression-mission", suppressionMission);
routeurScenarios.post("/:id/creation-audio", creationAudio);
routeurScenarios.post("/:id/modification-audio", modificationAudio);
routeurScenarios.patch("/:id/modifier-reponse", modifierReponses);
routeurScenarios.delete("/:id/suppression", suppression);

export default routeurScenarios;
