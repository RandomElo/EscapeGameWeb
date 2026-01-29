import { envoyerMail, recupererTexteMail } from "../fonctions/envoyerMail.js";
import { genererToken } from "../fonctions/genererToken.js";
import gestionErreur from "../middlewares/gestionErreur.js";

async function RecuperationMesEquipes(req) {
    const mesEquipes = await req.MembresEquipe.findAll({ where: { utilisateurId: req.idUtilisateur }, raw: true });
    let tableauEquipes = [];
    for (const equipe of mesEquipes) {
        const detailEquipe = await req.Equipes.findByPk(equipe.equipeId, { raw: true });
        tableauEquipes.push({ ...detailEquipe, estChef: equipe.estChef });
    }
    return tableauEquipes.map(({ nom, estChef }) => ({ nom, estChef }));
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

export const listeMembres = gestionErreur((req, res) => {}, "controleurRecuperationListeMembres", "Erreur lors de la récupération des membres de l'équipe");

export const ajoutUtilisateur = gestionErreur(
    async (req, res) => {
        const { mail, activerNotification, nomEquipe } = req.body;

        if (!mail || !activerNotification || !nomEquipe) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        const equipe = await VerificationChef(nomEquipe, req, res);

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
                details: JSON.stringify({ mail }),
            });

            const utilisateur = await req.Utilisateurs.findByPk(req.idUtilisateur);
            const { texte, html } = recupererTexteMail("ajoutEquipeCreationCompte", {
                nomUtilisateur: utilisateur.nom,
                nomEquipe,
                lienCreation: `${process.env.IP_FRONTED}/inscription?token=${token}`,
            });

            await envoyerMail({
                destinataire: mail,
                sujet: "Invitation à rejoindre une équipe",
                texte,
                html,
            });

            console.log(mail);
            return res.json({ etat: true, detail: "dev" });
        }
    },
    "controleurAjoutUtilisateurEquipe",
    "Erreur lors de l'ajout de l'utilisateur dans l'équipe",
);

export const quitter = gestionErreur((req, res) => {}, "controleurQuitterEquipe", "Erreur lors du départ de l'équipe");

export const suppressionMembre = gestionErreur((req, res) => {}, "controleurSuppressionMembre", "Erreur lors de la suppression du membre de l'équipe");

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

export const creeDemandeAdhesion = gestionErreur((req, res) => {}, "controleurCreeDemandeAdhesion", "Erreur lors de la création de la demande d'adhésion");

export const demandeAdhesion = gestionErreur((req, res) => {}, "controleurRecuperationDemandeAdhesion", "Erreur lors de la récupération des demandes d'adhésion pour l'équipe");

export const reponseDemandeAdhesion = gestionErreur((req, res) => {}, "controleurReponseDemandeAdhesion", "Erreur lors de l'envoi de la réponse pour la demande d'adhésion");
