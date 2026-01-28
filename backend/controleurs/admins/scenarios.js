import gestionErreur from "../../middlewares/gestionErreur.js";

export const liste = gestionErreur((req, res) => {}, "controleurListeScenarios", "Erreur lors de la récupération de la liste des scénarios");

export const details = gestionErreur((req, res) => {}, "controleurDetailsScenario", "Erreur lors de la récupération des détails du scénario");

export const creation = gestionErreur((req, res) => {}, "controleurCreationScenario", "Erreur lors de la création du scénario");

export const modificationOrdre = gestionErreur((req, res) => {}, "controleurModificationOrdreScenario", "Erreur lors la modification de l'ordre de la mission");

export const modificationEnTete = gestionErreur((req, res) => {}, "controleurModificationEnTete", "Erreur lors de la modification de l'en-tête du scénario");

export const ajoutMission = gestionErreur((req, res) => {}, "controleurAjoutMissionScenario", "Erreur lors de l'ajout de mission dans la scénario");

export const suppressionMission = gestionErreur((req, res) => {}, "controleurSuppressionMissionScenario", "Erreur lors de la suppression de mission dans la scénario");

export const creationAudio = gestionErreur((req, res) => {}, "controleurCreationFichierAudio", "Erreur lors de la génération du fichier audio");

export const modificationAudio = gestionErreur((req, res) => {}, "controleurModificationAudio", "Erreur lors du changement du fichier audio");

export const modifierReponses = gestionErreur((req, res) => {}, "controleurModifierReponses", "Erreur lors de la mise a jour des réponses");

export const suppression = gestionErreur((req, res) => {}, "controleurSuppressionScenario", "Erreur lors de la suppression du scénario");
