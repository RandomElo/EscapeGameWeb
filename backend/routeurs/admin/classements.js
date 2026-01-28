import e from "express";
import { modification, suppression } from "../../controleurs/admins/classements.js";

const routeurClassementsAdmin = e.Router();

routeurClassementsAdmin.patch("/:id/modifier", modification);
routeurClassementsAdmin.delete("/:id/suppression", suppression);

export default routeurClassementsAdmin;