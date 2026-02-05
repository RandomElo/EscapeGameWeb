import e from "express";
import { generation, suppression } from "../../controleurs/admins/audios.js";

const routeurAudios = e.Router();

routeurAudios.post("/generation", generation);
routeurAudios.delete("/suppression", suppression);

export default routeurAudios;
