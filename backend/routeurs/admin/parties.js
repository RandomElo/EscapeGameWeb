import e from "express";
import { avorterPartie, lancer, partieEnCours } from "../../controleurs/admins/parties.js";

const routeurParties = e.Router();

routeurParties.get("/partie-en-cours", partieEnCours);
routeurParties.post("/lancer", lancer);
routeurParties.patch("/avorter-partie", avorterPartie);

export default routeurParties;
