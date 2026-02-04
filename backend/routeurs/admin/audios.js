import e from "express";
import { generation } from "../../controleurs/admins/audios.js";

const routeurAudios = e.Router();

routeurAudios.post("/generation", generation);

export default routeurAudios;
