import e from "express";
import { creation, liste, modificationNom, suppression, modificationDescription, modificationConfiguration, modificationAdresseIp } from "../../controleurs/admins/missions.js";

const routeurMissions = e.Router();

routeurMissions.get("/liste", liste);
routeurMissions.post("/creation", creation);
routeurMissions.delete("/:id/suppression", suppression);
routeurMissions.patch("/:id/modification-nom", modificationNom);
routeurMissions.patch("/:id/modification-description", modificationDescription);
routeurMissions.patch("/:id/modification-configuration", modificationConfiguration);
routeurMissions.patch("/:id/modification-adresse-ip", modificationAdresseIp);

export default routeurMissions;
