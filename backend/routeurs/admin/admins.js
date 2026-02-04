import e from "express";

import routeurScenarios from "./scenarios.js";
import routeurMissions from "./missions.js";
import routeurCameras from "./cameras.js";
import routeurClassementsAdmin from "./classements.js";
import routeurAudios from "./audios.js";

const routeurAdmins = e.Router();

routeurAdmins.use("/scenarios", routeurScenarios);
routeurAdmins.use("/missions", routeurMissions);
routeurAdmins.use("/cameras", routeurCameras);
routeurAdmins.use("/classements", routeurClassementsAdmin);
routeurAdmins.use("/audios", routeurAudios)
export default routeurAdmins;
