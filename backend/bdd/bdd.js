import { Sequelize } from "sequelize";
import fs from "fs";
import readlineSync from "readline-sync";
import qrcode from "qrcode-terminal";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import dotenv from "dotenv";

dotenv.config();

// Importation des modèles
import Utilisateurs from "./modeles/Utilisateurs.js";
import Equipes from "./modeles/Equipes.js";
import MembresEquipe from "./modeles/MembresEquipe.js";
import Parties from "./modeles/Parties.js";
import Scenarios from "./modeles/Scenarios.js";
import Missions from "./modeles/Missions.js";
import EtatsMissions from "./modeles/EtatsMissions.js";
import DerouleScenario from "./modeles/DerouleScenario.js";
import Scores from "./modeles/Scores.js";
import MessagesAudio from "./modeles/MessagesAudio.js";
import JournauxEvenements from "./modeles/JournauxEvenements.js";
import Tokens from "./modeles/Tokens.js";
import DemandesAdhesion from "./modeles/DemandesAdhesion.js";
import MorseAudios from "./modeles/MorseAudios.js";
import QuizAudios from "./modeles/QuizAudios.js";
import QuizQuestions from "./modeles/QuizQuestions.js";
import AideAudios from "./modeles/AideAudios.js";
import Devinettes from "./modeles/Devinettes.js";
import Diapos from "./modeles/Diapos.js";
import Images from "./modeles/Images.js";

const cheminBDD = "./bdd/bdd.sqlite";

// Initialisation de l'ORM
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: cheminBDD,
    logging: false,
    define: {
        freezeTableName: true,
        timestamps: false,
    },
});

// Création d'instance pour chaque modèle
const bdd = {
    sequelize,
    Utilisateurs: Utilisateurs(sequelize),
    Equipes: Equipes(sequelize),
    MembresEquipe: MembresEquipe(sequelize),
    Parties: Parties(sequelize),
    Scenarios: Scenarios(sequelize),
    Missions: Missions(sequelize),
    EtatsMissions: EtatsMissions(sequelize),
    DerouleScenario: DerouleScenario(sequelize),
    Scores: Scores(sequelize),
    MessagesAudio: MessagesAudio(sequelize),
    JournauxEvenements: JournauxEvenements(sequelize),
    Tokens: Tokens(sequelize),
    DemandesAdhesion: DemandesAdhesion(sequelize),
    MorseAudios: MorseAudios(sequelize),
    QuizAudios: QuizAudios(sequelize),
    QuizQuestions: QuizQuestions(sequelize),
    AideAudios: AideAudios(sequelize),
    Devinettes: Devinettes(sequelize),
    Diapos: Diapos(sequelize),
    Images: Images(sequelize),
};

// Initialisation de la bdd
const existanceBdd = fs.existsSync(cheminBDD);

if (!existanceBdd) {
    await sequelize.sync({ force: true });
    console.log("✅ Base SQLite initialisée (première création)");
}

// Vérification de la présence d'un controleur dans la bdd
const controleurExiste = await bdd.Utilisateurs.findOne({
    where: { role: "controleur" },
});

if (!controleurExiste) {
    console.log("⚠️  Aucun controleur enregistrer");
    await bdd.Utilisateurs.create({
        nom: "Controleur",
        mail: "escape.game.lla@gmail.com",
        motDePasse: process.env.CONTROLEUR_DEFAUT,
        role: "controleur",
    });
}

export default bdd;
