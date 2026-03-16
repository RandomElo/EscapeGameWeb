import e from "express";
import { partiesEnCours } from "../../controleurs/admins/parties";

const routeurParties = e.Router();
routeurParties.get("/parties-en-cours", partiesEnCours)
export default routeurParties;
