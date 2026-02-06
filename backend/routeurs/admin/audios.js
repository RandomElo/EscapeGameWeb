import e from "express";
import { generation, lecture, recuperationLien, suppression } from "../../controleurs/admins/audios.js";
import {accesAdmin} from "../../middlewares/accesAdmin.js";

const routeurAudios = e.Router();

routeurAudios.post("/generation", accesAdmin, generation);
routeurAudios.delete("/suppression", accesAdmin, suppression);
routeurAudios.post("/recuperation-lien", accesAdmin, recuperationLien);
routeurAudios.get("/lecture/:nomFichier", lecture);
export default routeurAudios;
