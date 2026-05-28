import e from "express";
import { creation, liste, modificationNom, suppression, modificationDescription, modificationConfiguration, enregistrementDiapo, telechargerDiaporama, recupererDiapositive, suppressionAudioQuiz, suppressionDiaporama, suppressionDevinette } from "../../controleurs/admins/missions.js";
import multer from "multer";
import { accesAdmin } from "../../middlewares/accesAdmin.js";

const upload = multer({ dest: "tmp/", });

const routeurMissions = e.Router();

routeurMissions.get("/liste", accesAdmin, liste);
routeurMissions.post("/creation", accesAdmin, creation);
routeurMissions.delete("/:id/suppression", accesAdmin, suppression);
routeurMissions.patch("/:id/modification-nom", accesAdmin, modificationNom);
routeurMissions.patch("/:id/modification-description", accesAdmin, modificationDescription);
routeurMissions.patch("/:id/modification-configuration", accesAdmin, modificationConfiguration);

routeurMissions.post("/enregistrement-diapo", accesAdmin, upload.single("zip"), enregistrementDiapo)
routeurMissions.get("/:idDiapositive/recuperer-diapositive", accesAdmin, recupererDiapositive)
routeurMissions.get("/:nom/telecharger-diaporama", telechargerDiaporama)

routeurMissions.delete("/suppression-diaporama", accesAdmin, suppressionDiaporama)
routeurMissions.delete("/suppression-quiz", accesAdmin, suppressionAudioQuiz)
routeurMissions.delete("/suppression-devinette", accesAdmin, suppressionDevinette)

export default routeurMissions;
