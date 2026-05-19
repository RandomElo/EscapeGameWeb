import e from "express";
import { general, listeMissions, mission } from "../controleurs/classements.js";

const routeurClassements = e.Router();

routeurClassements.get("/general", general);
routeurClassements.get("/liste", listeMissions);
routeurClassements.get("/mission/:id", mission);

export default routeurClassements;
