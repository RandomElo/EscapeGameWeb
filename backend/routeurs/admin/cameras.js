import e from "express";
import {  liste, recuperationToken, tournerCamera } from "../../controleurs/admins/cameras.js";

const routeurCameras = e.Router();

routeurCameras.get("/liste", liste);
routeurCameras.post("/:ip/tourner-camera", tournerCamera);
routeurCameras.post("/recuperation-token", recuperationToken)

export default routeurCameras;
