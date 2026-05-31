import { Sequelize } from "sequelize";
import gestionErreur from "../../middlewares/gestionErreur.js";

export async function ConfigurationInterfaceAdmin(req) {
    // Requêtes DB lancées en parallèle
    const [
        missionsListe,
        derouleScenario,
        scenariosListe,
        messagesAudio,
        aideAudios,
        quizQuestions,
        quizAudios,
        devinettes,
        diaporamas,
        images,
    ] = await Promise.all([
        req.Missions.findAll({
            raw: true,
            attributes: ["id", "nom", "description", "topicMQTT"],
        }),
        req.DerouleScenario.findAll({
            raw: true,
            attributes: ["scenarioId", "missionId", "audioId", "ordre", "configuration", "type"],
            order: [["scenarioId", "ASC"], ["ordre", "ASC"]],
        }),
        req.Scenarios.findAll({ raw: true }),
        req.MessagesAudio.findAll({
            raw: true,
            attributes: ["id", "detail", "nomFichier"],
        }),
        req.AideAudios.findAll({
            raw: true,
            attributes: ["missionId", "scenarioId", "audioId"],
        }),
        req.QuizQuestions.findAll({
            raw: true,
            attributes: ["question", "type", "reponse", "difficulte", "nomFichier"],
        }),
        req.QuizAudios.findAll({
            raw: true,
            attributes: ["type", "texte", "nomFichier"],
        }),
        req.Devinettes.findAll({
            raw: true,
            attributes: ["devinette", "reponse", "nomFichier"],
        }),
        req.Diapos.findAll({
            raw: true,
            attributes: ["id", "nom"],
        }),
        req.Images.findAll({
            raw: true,
            attributes: ["id", "ordre", "diapoId"],
            order: [["diapoId", "ASC"], ["ordre", "ASC"]],
        })

    ]);

    // Maps de lookup
    const mapMissions = Object.fromEntries(missionsListe.map((m) => [m.id, m]));
    const mapAudios = Object.fromEntries(messagesAudio.map((a) => [a.id, a]));

    // Map des audios d'aide : "scenarioId_missionId" → [{nomFichier, detail}]
    const mapAideAudios = {};
    for (const aide of aideAudios) {
        const audio = mapAudios[aide.audioId];
        if (!audio) continue;
        const key = `${aide.scenarioId}_${aide.missionId}`;
        (mapAideAudios[key] ??= []).push({
            nomFichier: audio.nomFichier,
            detail: audio.detail,
        });
    }

    // Parcours unique de derouleScenario
    const mapMissionScenarios = {};
    const mapScenarioDeroule = {};

    for (const etape of derouleScenario) {
        // — Alimentation de mapMissionScenarios (ex-premier forEach)
        if (etape.type === "mission") {
            (mapMissionScenarios[etape.missionId] ??= []).push({
                scenarioId: etape.scenarioId,
                ordre: etape.ordre,
                configuration: etape.configuration,
            });
        }

        // — Construction du déroulé enrichi
        const derouleEnrichi = {
            ordre: etape.ordre,
            type: etape.type,
            configuration: etape.configuration,
        };

        if (etape.type === "mission") {
            derouleEnrichi.mission = mapMissions[etape.missionId] ?? null;
            derouleEnrichi.audiosAide = mapAideAudios[`${etape.scenarioId}_${etape.missionId}`] ?? [];
        } else if (etape.type === "audio") {
            const audio = mapAudios[etape.audioId];
            derouleEnrichi.fichierId = audio?.id ?? null;
            derouleEnrichi.fichierDetail = audio?.detail ?? null;
            derouleEnrichi.fichierNom = audio?.nomFichier ?? null;
        }

        (mapScenarioDeroule[etape.scenarioId] ??= []).push(derouleEnrichi);
    }

    const missions = missionsListe.map((mission) => ({
        ...mission,
        scenarios: mapMissionScenarios[mission.id] ?? [],
    }));

    const scenarios = scenariosListe.map((scenario) => ({
        ...scenario,
        deroule: mapScenarioDeroule[scenario.id] ?? [],
    }));

    const diapos = diaporamas.map((diapo) => ({
        ...diapo,
        images: images
            .filter((img) => img.diapoId === diapo.id)
            .map((img) => img.id)
    }));

    return { missions, scenarios, messagesAudio, quiz: { questions: quizQuestions, audios: quizAudios }, devinettes, diaporamas: diapos };
}

export const configurationComplete = gestionErreur(
    async (req, res) => {
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurRecuperationConfiugrationComplete",
    "Erreur lors de la récupération des données pour l'interface d'administration",
);

export const liste = gestionErreur((req, res) => { }, "controleurListeScenarios", "Erreur lors de la récupération de la liste des scénarios");

export const details = gestionErreur((req, res) => { }, "controleurDetailsScenario", "Erreur lors de la récupération des détails du scénario");

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

export const modificationNom = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { nom } = req.body;
        if (!req.params.id || !nom) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Scenarios.update({ nom }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationNomScenario",
    "Erreur lors de la modification du nom du scénario",
);

export const modificationDescription = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { description } = req.body;
        if (!req.params.id || !description) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: true,
                detail: "Ressource introuvable",
            });
        }

        await req.Scenarios.update({ description }, { where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "modificationDescription",
    "Erreur lors de la modification du scénario",
);

export const modificationEnTete = gestionErreur((req, res) => { }, "controleurModificationEnTete", "Erreur lors de la modification de l'en-tête du scénario");

async function ajoutElement(type, req, res) {
    const { id } = req.params;
    const { liste } = req.body;

    if (!liste || !id) {
        return res.status(400).json({
            etat: false,
            detail: "Requête incorrecte",
        });
    }

    const scenario = await req.Scenarios.findByPk(id);
    if (!scenario) {
        return res.status(404).json({
            etat: false,
            detail: "Ressource inexistante",
        });
    }

    const listeEtapes = await req.DerouleScenario.findAll({
        where: { scenarioId: id },
        raw: true,
    });

    const elementsIds = new Set(listeEtapes.filter((m) => m.type === type).map((m) => m[`${type}Id`]));

    const ordresUtilises = new Set(listeEtapes.map((m) => m.ordre));

    for (let index = 0; index < liste.length; index++) {
        const elementId = liste[index];

        if (elementsIds.has(elementId)) {
            return res.status(400).json({
                etat: false,
                detail: `${type} déjà présent (${elementId})`,
            });
        }

        let ordre = index;

        while (ordresUtilises.has(ordre)) {
            ordre++;
        }

        const element = await req[`${type == "mission" ? "Missions" : "MessagesAudio"}`].findByPk(elementId);
        if (!element) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        await req.DerouleScenario.create({
            scenarioId: id,
            [`${type}Id`]: elementId,
            ordre,
            type,
        });

        ordresUtilises.add(ordre);
        elementsIds.add(elementId);
    }

    return res.json({
        etat: true,
        detail: await ConfigurationInterfaceAdmin(req),
    });
}

export const ajoutMission = gestionErreur(
    async (req, res) => {
        await ajoutElement("mission", req, res);
    },
    "controleurAjoutMissionScenario",
    "Erreur lors de l'ajout de mission dans le scénario",
);

export const ajoutAudio = gestionErreur(
    async (req, res) => {
        await ajoutElement("audio", req, res);
    },
    "controleurAjoutAudioScenario",
    "Erreur lors de l'ajout de l'audio au scénario",
);

export const modificationDeroule = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { donnees } = req.body;
        console.log(donnees)
        if (!donnees || !id) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id);
        if (!scenario) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        const derouleScenario = await req.DerouleScenario.findAll({ where: { scenarioId: id }, raw: true });

        for (const ordre in donnees) {
            const element = donnees[ordre];
            if (derouleScenario.filter((etape) => (etape.type == "mission" ? etape.missionId == element.id : etape.audioId == element.id)).length == 0) {
                return res.status(400).json({
                    etat: false,
                    detail: "Requête incorrecte",
                });
            }

            const elementBdd = await req[`${element.type == "mission" ? "Missions" : "MessagesAudio"}`].findByPk(element.id);
            if (!elementBdd) {
                return res.status(404).json({
                    etat: false,
                    detail: "Ressource inexistante",
                });
            }
        }

        // Pour éviter les conflits (si deux étape on le meme ordre je décale avant)
        await req.DerouleScenario.update({ ordre: Sequelize.literal("ordre + 1000") }, { where: { scenarioId: id } });

        for (const ordre in donnees) {
            const element = donnees[ordre];
            await req.DerouleScenario.update({ ordre, configuration: element.type == "mission" ? JSON.parse(element.configuration) : element.configuration }, { where: { scenarioId: id, [`${element.type == "mission" ? "missionId" : "audioId"}`]: element.id } });
        }

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurModificationDerouleScenario",
    "Erreur lors de la modification du déroulé du scénario",
);

export const suppressionMission = gestionErreur((req, res) => { }, "controleurSuppressionMissionScenario", "Erreur lors de la suppression de mission dans la scénario");

export const modifierReponses = gestionErreur((req, res) => { }, "controleurModifierReponses", "Erreur lors de la mise a jour des réponses");
export const generationAudiosAide = gestionErreur((req, res) => { }, "controleurGenerationAudiosAide", "Erreur lors de la génération des audios d'aide");

export const suppression = gestionErreur(
    async (req, res) => {
        console.log("je suis laaa")
        const { id } = req.params;
        if (!req.params.id) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource introuvable",
            });
        }

        await req.Scenarios.destroy({ where: { id } });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSuppressionScenario",
    "Erreur lors de la suppression du scénario",
);
export const ajouterAudiosAide = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { fichiers, missionId } = req.body;

        if (!id || !missionId || !fichiers) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        if (!Array.isArray(fichiers) || fichiers.some((f) => typeof f !== "string")) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const [scenario, mission, missionScenario] = await Promise.all([
            req.Scenarios.findByPk(id, { raw: true }),
            req.Missions.findByPk(missionId, { raw: true }),
            req.DerouleScenario.findOne({
                where: { missionId, scenarioId: id },
                raw: true,
            }),
        ]);

        if (!scenario || !mission || !missionScenario) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource introuvable",
            });
        }

        const fichiersBDD = await req.MessagesAudio.findAll({
            where: {
                nomFichier: fichiers,
            },
            raw: true,
        });

        if (fichiersBDD.length !== fichiers.length) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistantee",
            });
        }

        const inserts = fichiersBDD.map((fichier) => ({
            missionId,
            scenarioId: id,
            audioId: fichier.id,
        }));

        await req.AideAudios.bulkCreate(inserts, {
            ignoreDuplicates: true,
        });

        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurAjouterAudiosAide",
    "Erreur lors de l'ajout des audios d'aide",
);

export const supprimerAudioAide = gestionErreur(
    async (req, res) => {
        const { id } = req.params;
        const { nomFichier } = req.body;
        if (!id || !nomFichier) {
            return res.status(400).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const scenario = await req.Scenarios.findByPk(id, { raw: true });
        if (!scenario) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        const fichier = await req.AideAudios.findOne({ where: { nomFichier } });
        if (!fichier) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }
        await req.AideAudios.destroy({ where: { id: fichier.id } });
        return res.json({ etat: true, detail: await ConfigurationInterfaceAdmin(req) });
    },
    "controleurSupprimerAudioAide",
    "Erreur lors de la suppression de l'audio d'aide",
);
