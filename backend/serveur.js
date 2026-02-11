// Packages
import e from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import "./mqtt/serveur.js";

// Middlewares
import { accessibiliteBdd } from "./middlewares/accessibiliteBdd.js";

// Autre
import bdd from "./bdd/bdd.js";
import routeurUtilisateurs from "./routeurs/utilisateurs.js";
import routeurEquipes from "./routeurs/equipes.js";
import routeurClassements from "./routeurs/classements.js";
import routeurAdmins from "./routeurs/admin/admins.js";
import { verificationCookie } from "./middlewares/verificationCookie.js";

// Routeurs

dotenv.config();
const { PORT_EXPRESS, IP_FRONTEND } = process.env;

const app = e();

// CORS
app.use(
    cors({
        origin: IP_FRONTEND,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

app.use(e.json());
app.use(cookieParser());
app.use(accessibiliteBdd(bdd));
app.use(verificationCookie);

app.use("/utilisateurs", routeurUtilisateurs);
app.use("/equipes", routeurEquipes);
app.use("/classements", routeurClassements);
app.use("/admins", routeurAdmins);

app.listen(PORT_EXPRESS, () => console.log("Serveur démarré => port " + PORT_EXPRESS));
