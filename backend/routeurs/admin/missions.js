import e from "express";
import { creation, liste, modificationNom, suppression, modificationDescription, modificationConfiguration, enregistrementDiapo } from "../../controleurs/admins/missions.js";
import multer from "multer";

const upload = multer({
    dest: "tmp/",
});

const routeurMissions = e.Router();

routeurMissions.get("/liste", liste);
routeurMissions.post("/creation", creation);
routeurMissions.delete("/:id/suppression", suppression);
routeurMissions.patch("/:id/modification-nom", modificationNom);
routeurMissions.patch("/:id/modification-description", modificationDescription);
routeurMissions.patch("/:id/modification-configuration", modificationConfiguration);

routeurMissions.post("/enregistrement-diapo", upload.single("zip"), enregistrementDiapo)

export default routeurMissions;
