import e from "express";
import { lancer, partiesEnCours } from "../../controleurs/admins/parties.js";

const routeurParties = e.Router();
routeurParties.get("/parties-en-cours", partiesEnCours);
routeurParties.post("/lancer", lancer);
export default routeurParties;
