import gestionErreur from "../../middlewares/gestionErreur.js";

export async function ConfigurationInterfaceAdmin(req) {
    // mission
    const missionsListe = await req.Missions.findAll({ raw: true, attributes: ["id", "nom", "description", "ipAdresse", "formatReponse"] });
    console.log(missionsListe);
    // scenarion
    const scenariosListe = await req.Scenarios.findAll({ raw: true });
    // message audio
    const messagesAudio = await req.MessagesAudio.findAll({ raw: true });
    // adresse ip
    return { missions: missionsListe, scenarios: scenariosListe, messagesAudio };
}

export const configurationComplete = gestionErreur(
    async (req, res) => {
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurRecuperationConfiugrationComplete",
    "Erreur lors de la récupération des données pour l'interface d'administration",
);

export const liste = gestionErreur((req, res) => {}, "controleurListeScenarios", "Erreur lors de la récupération de la liste des scénarios");

export const details = gestionErreur((req, res) => {}, "controleurDetailsScenario", "Erreur lors de la récupération des détails du scénario");

export const creation = gestionErreur(
    async (req, res) => {
        const { nom, description } = req.body;
        if (!nom | !description) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        await req.Scenarios.create({
            nom,
            description,
        });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurCreationScenario",
    "Erreur lors de la création du scénario",
);

export const modificationOrdre = gestionErreur((req, res) => {}, "controleurModificationOrdreScenario", "Erreur lors la modification de l'ordre de la mission");

export const modificationEnTete = gestionErreur((req, res) => {}, "controleurModificationEnTete", "Erreur lors de la modification de l'en-tête du scénario");

export const ajoutMission = gestionErreur((req, res) => {}, "controleurAjoutMissionScenario", "Erreur lors de l'ajout de mission dans la scénario");

export const suppressionMission = gestionErreur((req, res) => {}, "controleurSuppressionMissionScenario", "Erreur lors de la suppression de mission dans la scénario");

export const modifierReponses = gestionErreur((req, res) => {}, "controleurModifierReponses", "Erreur lors de la mise a jour des réponses");

export const suppression = gestionErreur((req, res) => {}, "controleurSuppressionScenario", "Erreur lors de la suppression du scénario");
