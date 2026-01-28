import e from "express";
import { creation, liste, modifierConfiguration, modifierEnTete, modifierFormatReponse, suppression } from "../../controleurs/admins/missions.js";
const routeurMissions = e.Router();

routeurMissions.get("/liste", liste);
routeurMissions.post("/creation", creation);
routeurMissions.delete("/:id/suppression", suppression);
routeurMissions.patch("/:id/modifier-en-tete", modifierEnTete);
routeurMissions.patch("/:id/modifier-configuration", modifierConfiguration);
routeurMissions.patch("/:id/modifier-format-reponse", modifierFormatReponse);

export default routeurMissions;
