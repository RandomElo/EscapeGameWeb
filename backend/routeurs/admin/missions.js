import e from "express";
import { creation, liste, modificationNom, suppression, modificationDescription, modificationConfiguration } from "../../controleurs/admins/missions.js";

const routeurMissions = e.Router();

routeurMissions.get("/liste", liste);
routeurMissions.post("/creation", creation);
routeurMissions.delete("/:id/suppression", suppression);
routeurMissions.patch("/:id/modification-nom", modificationNom);
routeurMissions.patch("/:id/modification-description", modificationDescription);
routeurMissions.patch("/:id/modification-configuration", modificationConfiguration);

export default routeurMissions;
