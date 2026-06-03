import e from "express";
import { general, listeMissions, mission, recupererTout } from "../controleurs/classements.js";

const routeurClassements = e.Router();

routeurClassements.get("/recuperer-tout", recupererTout)
routeurClassements.get("/general", general);
routeurClassements.get("/liste", listeMissions);
routeurClassements.get("/mission/:id", mission);

export default routeurClassements;
