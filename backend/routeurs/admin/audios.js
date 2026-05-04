import e from "express";
import { generation, generationQuiz, lecture, recuperationLien, recuperationMorse, suppression } from "../../controleurs/admins/audios.js";
import { accesAdmin } from "../../middlewares/accesAdmin.js";
import { stream } from "../../controleurs/admins/stream.js";

const routeurAudios = e.Router();

routeurAudios.post("/generation", accesAdmin, generation);
routeurAudios.post("/generation-quiz", accesAdmin, generationQuiz);

routeurAudios.delete("/suppression", accesAdmin, suppression);
routeurAudios.post("/recuperation-lien", accesAdmin, recuperationLien);

routeurAudios.get("/lecture/:nomFichier", lecture);
routeurAudios.get("/stream/:type/:nomFichier", stream);
routeurAudios.get("/recuperation-morse", recuperationMorse);
export default routeurAudios;
