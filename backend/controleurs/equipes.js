import { envoyerMail, recupererTexteMail } from "../fonctions/envoyerMail.js";
import { genererToken } from "../fonctions/genererToken.js";
import gestionErreur from "../middlewares/gestionErreur.js";
import { Op } from "sequelize";

async function RecuperationMesEquipes(req) {
    // --- Vérification des ajouts
    const utilisateur = await req.Utilisateurs.findByPk(req.idUtilisateur);
    const listeAjoutsEquipes = await req.DemandesAdhesion.findAll({
        where: {
            type: "ajout",
            traitee: false,
            [Op.or]: [{ utilisateurId: req.idUtilisateur }, { mail: utilisateur.mail }],
        },
        raw: true,
    });

    for (const equipe of listeAjoutsEquipes) {
        await req.MembresEquipe.create({
            equipeId: equipe.equipeId,
            utilisateurId: req.idUtilisateur,
        });
        await req.DemandesAdhesion.update({ traitee: true }, { where: { id: equipe.id } });
    }
    // ---

    const mesEquipes = await req.MembresEquipe.findAll({ where: { utilisateurId: req.idUtilisateur }, raw: true });
    let tableauEquipes = [];

    for (const equipe of mesEquipes) {
        // Récupération des détails de l'équipes
        const detailEquipe = await req.Equipes.findByPk(equipe.equipeId, {
            attributes: ["nom"],
            raw: true,
        });

        // Récupération de la liste des membres
        const membresEquipe = await req.MembresEquipe.findAll({ where: { equipeId: equipe.equipeId }, raw: true });

        // Récupération des détails des membres (nom et mail)
        const tableauMembresEquipe = [];
        for (const membre of membresEquipe) {
            const utilisateur = await req.Utilisateurs.findByPk(membre.utilisateurId, { raw: true });
            let detailsMembre = {};
            detailsMembre.nom = utilisateur.nom;
            detailsMembre.estChef = membre.estChef;
            if (equipe.estChef) {
                detailsMembre.mail = utilisateur.mail;
            }
            tableauMembresEquipe.push(detailsMembre);
        }

        tableauEquipes.push({
            nom: detailEquipe.nom,
            estChef: equipe.estChef,
            listeMembres: tableauMembresEquipe,
        });
    }

    return tableauEquipes;
}

async function VerificationChef(nomEquipe, req, res) {
    const equipe = await req.Equipes.findOne({ where: { nom: nomEquipe }, raw: true });
    if (!equipe) {
        return res.status(404).json({
            etat: false,
            detail: "Équipe inexistante",
        });
    }

    const membreEquipe = await req.MembresEquipe.findOne({ where: { equipeId: equipe.id, utilisateurId: req.idUtilisateur }, raw: true });
    if (!membreEquipe) {
        return res.status(404).json({
            etat: false,
            detail: "Ressource inaccessible",
        });
    }

    if (!membreEquipe.estChef) {
        return res.status(403).json({
            etat: false,
            detail: "Ressource inaccessible",
        });
    }
    return equipe;
}

export const mesEquipes = gestionErreur(
    async (req, res) => {
        const liste = await RecuperationMesEquipes(req);

        return res.json({ etat: true, detail: liste });
    },
    "controleurMesEquipes",
    "Erreur lors de la récupération des équipes auquel vous appartenez",
);

export const creation = gestionErreur(
    async (req, res) => {
        const { nom } = req.body;
        if (!nom) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        if (await req.Equipes.findOne({ where: { nom } })) {
            return res.json({ etat: true, detail: { cree: false, detail: "Nom déja utilisé" } });
        }
        const equipe = await req.Equipes.create({ nom });
        await req.MembresEquipe.create({
            equipeId: equipe.dataValues.id,
            utilisateurId: req.idUtilisateur,
            estChef: true,
        });
        const liste = await RecuperationMesEquipes(req);
        return res.json({ etat: true, detail: { cree: true, detail: liste } });
    },
    "controleurCreationEquipe",
    "Erreur lors de la création de l'équipe",
);

export const modificationNom = gestionErreur(
    async (req, res) => {
        const { nouveauNom, ancienNom } = req.body;

        if (!nouveauNom || !ancienNom) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const equipe = await VerificationChef(ancienNom, req, res);
        await req.Equipes.update({ nom: nouveauNom }, { where: { id: equipe.id } });

        const liste = await RecuperationMesEquipes(req);
        return res.json({ etat: true, detail: liste });
    },
    "controleurModificationNomEquipe",
    "Erreur lors de la modification du nom de l'équipe",
);

export const ajoutUtilisateur = gestionErreur(
    async (req, res) => {
        const { mail, activerNotification, nomEquipe } = req.body;

        if (!mail || !nomEquipe || req.body.activerNotification == undefined) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        const equipe = await VerificationChef(nomEquipe, req, res);
        const utilisateur = await req.Utilisateurs.findByPk(req.idUtilisateur);

        const utilisateurInviter = await req.Utilisateurs.findOne({ where: { mail } });
        if (!utilisateurInviter) {
            await req.DemandesAdhesion.create({
                equipeId: equipe.id,
                type: "ajout",
                mail,
            });

            const token = genererToken(10);

            await req.LiensMail.create({
                token,
                type: "creationCompte",
                details: mail,
            });

            const { texte, html } = recupererTexteMail("ajoutEquipeCreationCompte", {
                nomUtilisateur: utilisateur.nom,
                nomEquipe,
                lienCreation: `${process.env.IP_FRONTEND}/inscription?token=${token}`,
            });

            await envoyerMail({
                destinataire: mail,
                sujet: "Invitation à rejoindre une équipe",
                texte,
                html,
            });

            return res.json({ etat: true, detail: { utilisateurExistant: false } });
        } else {
            await req.MembresEquipe.create({
                equipeId: equipe.id,
                utilisateurId: utilisateurInviter.id,
            });
            if (activerNotification) {
                const { texte, html } = recupererTexteMail("ajoutEquipeNotification", {
                    nomUtilisateur: utilisateur.nom,
                    nomEquipe,
                });

                await envoyerMail({
                    destinataire: mail,
                    sujet: "Ajout à une équipe",
                    texte,
                    html,
                });

                const liste = await RecuperationMesEquipes(req);
                return res.json({ etat: true, detail: { utilisateurExistant: false, detail: liste } });
            }
        }
    },
    "controleurAjoutUtilisateurEquipe",
    "Erreur lors de l'ajout de l'utilisateur dans l'équipe",
);

export const quitter = gestionErreur(
    async (req, res) => {
        const { equipe } = req.body;
        if (!equipe) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const equipeDetails = await req.Equipes.findOne({ where: { nom: equipe }, raw: true });
        if (!equipeDetails) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        const membre = await req.MembresEquipe.findOne({ where: { utilisateurId: req.idUtilisateur, equipeId: equipeDetails.id } });
        if (!membre) {
            return res.status(403).json({
                etat: false,
                detail: "Accès interdit",
            });
        }

        if (membre.estChef) {
            return res.status(403).json({
                etat: false,
                detail: "Accès interdit",
            });
        }
        await req.MembresEquipe.destroy({ where: { id: membre.id } });

        const liste = await RecuperationMesEquipes(req);
        return res.json({ etat: true, detail: liste });
    },
    "controleurQuitterEquipe",
    "Erreur lors du départ de l'équipe",
);

export const suppressionMembre = gestionErreur(
    async (req, res) => {
        const { membre, equipe } = req.body;

        if (!membre || !equipe) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const utilisateur = await req.Utilisateurs.findOne({ where: { mail: membre }, raw: true });

        const equipeDetails = await req.Equipes.findOne({ where: { nom: equipe }, raw: true });

        if (!utilisateur || !equipeDetails) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        const membreEquipe = await req.MembresEquipe.findOne({ where: { utilisateurId: req.idUtilisateur, equipeId: equipeDetails.id }, raw: true });

        if (!membreEquipe.estChef) {
            return res.status(403).json({
                etat: false,
                detail: "Accès interdit",
            });
        }

        const membreEquipeASupprimer = await req.MembresEquipe.findOne({ where: { utilisateurId: utilisateur.id, equipeId: equipeDetails.id }, raw: true });

        if (!membreEquipeASupprimer) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }

        await req.MembresEquipe.destroy({ where: { id: membreEquipeASupprimer.id } });

        const liste = await RecuperationMesEquipes(req);
        return res.json({ etat: true, detail: liste });
    },
    "controleurSuppressionMembre",
    "Erreur lors de la suppression du membre de l'équipe",
);

export const suppressionEquipe = gestionErreur(
    async (req, res) => {
        const { nom } = req.body;
        if (!nom) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        await VerificationChef(nom, req, res);

        await req.Equipes.destroy({ where: { nom } });

        const liste = await RecuperationMesEquipes(req);
        return res.json({ etat: true, detail: liste });
    },
    "controleurSuppressionEquipe",
    "Erreur lors de la suppression de l'équipe",
);

// Gestion de l'adhésion

export const creeDemandeAdhesion = gestionErreur(
    async (req, res) => {
        const { nomEquipe } = req.body;
        if (!nomEquipe) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const equipe = await req.Equipes.findOne({ where: { nom: nomEquipe }, raw: true });
        if (!equipe) {
            return res.json({ etat: true, detail: { ajouter: false, detail: "Équipe inexistante" } });
        }

        if (await req.MembresEquipe.findOne({ where: { equipeId: equipe.id, utilisateurId: req.idUtilisateur } })) {
            return res.json({ etat: true, detail: { ajouter: false, detail: "Vous êtes déjà membre de cette équipe" } });
        }

        await req.DemandesAdhesion.create({
            utilisateurId: req.idUtilisateur,
            equipeId: equipe.id,
            type: "demande",
        });

        return res.json({ etat: true, detail: { ajouter: true } });
    },
    "controleurCreeDemandeAdhesion",
    "Erreur lors de la création de la demande d'adhésion",
);

export const demandeAdhesion = gestionErreur(
    async (req, res) => {
        if (!req.idUtilisateur) {
            return res.json({ etat: true, detail: { estConnecte: false } });
        }
        // Récupération des équipes dont je suis chef
        const mesEquipes = await req.MembresEquipe.findAll({ where: { utilisateurId: req.idUtilisateur, estChef: true }, raw: true });

        let demandesAdhesion = [];
        for (const equipe of mesEquipes) {
            const demandes = await req.DemandesAdhesion.findAll({ where: { traitee: false, type: "demande", equipeId: equipe.id } });
            if (demandes) {
                const detailsEquipe = await req.Equipes.findByPk(equipe.id);
                for (const demande of demandes) {
                    const utilisateur = await req.Utilisateurs.findByPk(demande.utilisateurId);

                    demandesAdhesion.push({
                        nom: utilisateur.nom,
                        mail: utilisateur.mail,
                        nomEquipe: detailsEquipe.nom,
                        date: demande.date,
                    });
                }
            }
        }

        return res.json({ etat: true, detail: { estConnecte: true, details: demandesAdhesion } });
    },
    "controleurRecuperationDemandeAdhesion",
    "Erreur lors de la récupération des demandes d'adhésion",
);

export const reponseDemandeAdhesion = gestionErreur(
    async (req, res) => {
        const { etat, mail, date, nomEquipe } = req.body;
        if (!etat || !mail || !date || !nomEquipe) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        await VerificationChef(nomEquipe, req, res);

        const utilisateur = await req.Utilisateurs.findOne({ where: { mail }, raw: true });
        const equipe = await req.Equipes.findOne({ where: { nom: nomEquipe }, raw: true });

        const demande = await req.DemandesAdhesion.findOne({ where: { utilisateurId: utilisateur.id, equipeId: equipe.id, date: date } });

        if (!utilisateur || !equipe || !demande) {
            return res.status(404).json({
                etat: false,
                detail: "Ressource inexistante",
            });
        }
        if (etat == "accepter") {
            await req.DemandesAdhesion.update({ traitee: true }, { where: { id: demande.id } });
            await req.MembresEquipe.create({
                equipeId: equipe.id,
                utilisateurId: utilisateur.id,
            });
        } else {
            await req.DemandesAdhesion.update({ traitee: true }, { where: { id: demande.id } });
        }
        // il faut que je renvoye la liste mise a jour
    },
    "controleurReponseDemandeAdhesion",
    "Erreur lors de l'envoi de la réponse pour la demande d'adhésion",
);
