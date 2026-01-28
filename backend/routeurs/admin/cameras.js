import e from "express";
import { liste, tournerCamera } from "../../controleurs/admins/cameras.js";

const routeurCameras = e.Router();

routeurCameras.get("/liste", liste);
routeurCameras.post("/:ip/tourner-camera", tournerCamera);

export default routeurCameras;
