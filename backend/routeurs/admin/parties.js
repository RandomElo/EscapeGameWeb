import e from "express";
import { lancer, partieEnCours } from "../../controleurs/admins/parties.js";

const routeurParties = e.Router();
routeurParties.get("/partie-en-cours", partieEnCours);
routeurParties.post("/lancer", lancer);
export default routeurParties;
