import e from "express";

import routeurScenarios from "./scenarios.js";
import routeurMissions from "./missions.js";
import routeurCameras from "./cameras.js";
import routeurClassementsAdmin from "./classements.js";
import routeurAudios from "./audios.js";
import { accesAdmin } from "../../middlewares/accesAdmin.js";
import routeurParties from "./parties.js";
const routeurAdmins = e.Router();

routeurAdmins.use("/scenarios", accesAdmin, routeurScenarios);
routeurAdmins.use("/missions", routeurMissions);
routeurAdmins.use("/cameras", accesAdmin, routeurCameras);
routeurAdmins.use("/classements", accesAdmin, routeurClassementsAdmin);
routeurAdmins.use("/parties", accesAdmin, routeurParties);

routeurAdmins.use("/audios", routeurAudios);

export default routeurAdmins;
