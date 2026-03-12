import e from "express";
import { generation, lecture, recuperationLien, recuperationMorse, suppression } from "../../controleurs/admins/audios.js";
import { accesAdmin } from "../../middlewares/accesAdmin.js";

const routeurAudios = e.Router();

routeurAudios.post("/generation", accesAdmin, generation);
routeurAudios.delete("/suppression", accesAdmin, suppression);
routeurAudios.post("/recuperation-lien", accesAdmin, recuperationLien);
routeurAudios.get("/lecture/:nomFichier", lecture);

routeurAudios.get("/recuperation-morse", recuperationMorse);
export default routeurAudios;
