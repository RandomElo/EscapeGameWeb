import gestionErreur from "../middlewares/gestionErreur.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { genererToken } from "../fonctions/genererToken.js";
import { envoyerMail, recupererTexteMail } from "../fonctions/envoyerMail.js";
import { Json } from "sequelize/lib/utils";

// Fonctions
async function verifierCode2FA(utilisateur, token) {
    if (!token) {
        return false;
    }

    if (!utilisateur.doubleAuthentificationSecret) {
        return false;
    }

    return speakeasy.totp.verify({
        secret: utilisateur.doubleAuthentificationSecret,
        encoding: "base32",
        token,
        window: 1,
    });
}

async function generer2FA(req, idUtilisateur) {
    const utilisateur = await req.Utilisateurs.findByPk(idUtilisateur);

    const secret = speakeasy.generateSecret({
        name: `EscapeGame (${utilisateur.mail})`,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    utilisateur.doubleAuthentificationSecret = secret.base32;
    await utilisateur.save();

    return qrCode
}

async function VerifierCode2FA(req, idUtilisateur, code) {
    const utilisateur = await req.Utilisateurs.findByPk(idUtilisateur);

    const valide = await verifierCode2FA(utilisateur, code);

    if (!valide) {
        return res.status(401).json({
            etat: true,
            detail: { active: false, detail: "Code 2FA invalide" },
        });
    }

    utilisateur.doubleAuthentificationActive = true;
    await utilisateur.save();
}

async function RecuperationMonCompte(req) {

    const { nom, mail, role, doubleAuthentificationActive } = await req.Utilisateurs.findByPk(req.idUtilisateur, { raw: true });
    if (role == "controleur") {
        return { nom, mail, doubleAuthentificationActive }
    } else {
        const mesEquipes = await req.MembresEquipe.findAll({ where: { utilisateurId: req.idUtilisateur }, raw: true });

        let nbrParties = 0;
        for (const e of mesEquipes) {
            const equipe = await req.Equipes.findByPk(e.equipeId, { raw: true });
            nbrParties += await req.Parties.count({ where: { equipeId: e.id } });
        }

        return { nom, mail, doubleAuthentificationActive, nbrParties }
    }
}

// --- AUTHENTIFICATION ---
export const inscription = gestionErreur(
    async (req, res) => {
        // Verification des valeurs reçues
        const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const regexMdp = /^.{8,}$/;
        const regexNom = /^[a-zA-Z0-9_-]+$/;

        if (!regexMail.test(req.body.mail) || !regexMdp.test(req.body.mdp) || !regexNom.test(req.body.nom)) {
            return res.json({ etat: true, detail: { compte: false, detail: "Les informations d'authentification ne respectent pas les règles définies." } });
        }

        const utilisateurEmail = await req.Utilisateurs.findOne({ where: { mail: req.body.mail } });

        if (utilisateurEmail) {
            return res.json({ etat: true, detail: { compte: false, detail: "L'adresse mail est déjà utilisée" } });
        }

        const motDePasseHash = await bcrypt.hash(req.body.mdp, 12);

        const utilisateur = await req.Utilisateurs.create({
            nom: req.body.nom,
            mail: req.body.mail,
            motDePasse: motDePasseHash,
        });

        if (req.body.doubleAuthentification) {
            const token2FA = jwt.sign({ sub: utilisateur.id, scope: "2fa_config" }, process.env.CHAINE_JWT_CONFIG_2FA, { expiresIn: "15m" });
            return res.json({ etat: true, detail: { message: "Parametrage 2FA", token2FA } });
        } else {
            return await req.Utilisateurs.generationToken(req, res, utilisateur);
        }
    },
    "controleurInscription",
    "Erreur lors de l'inscription",
);

export const connexion = gestionErreur(
    async (req, res) => {
        const utilisateur = await req.Utilisateurs.findOne({
            where: { mail: req.body.mail },
        });

        if (!utilisateur) {
            return res.json({ etat: true, detail: { compte: false, detail: "Mail ou mot de passe incorrect" } });
        }

        const mdpValide = await bcrypt.compare(req.body.mdp, utilisateur.motDePasse);
        if (!mdpValide) {
            return res.json({ etat: true, detail: { compte: false, detail: "Mail ou mot de passe incorrect" } });
        }

        // if (utilisateur.role == "controleur" && !utilisateur.doubleAuthentification) {
        //     const token2FA = jwt.sign({ sub: utilisateur.id, scope: "2fa_config" }, process.env.CHAINE_JWT_CONFIG_2FA, { expiresIn: "15m" });

        //     return res.json({ etat: true, detail: { message: "Parametrage 2FA", token2FA } });
        // }

        if (utilisateur.doubleAuthentificationActive) {
            const valide2FA = await verifierCode2FA(utilisateur, req.body.token);

            if (!valide2FA) {
                return res.json({ etat: true, detail: "connexion2FA" });
            }
        }

        return await req.Utilisateurs.generationToken(req, res, utilisateur);
    },
    "controleurConnexion",
    "Erreur lors de la connexion",
);

export const verification = gestionErreur(
    async (req, res) => {
        if (!!req.idUtilisateur) {
            const { role } = await req.Utilisateurs.findByPk(req.idUtilisateur);
            return res.json({ etat: true, detail: role });
        } else {
            return res.json({ etat: true, detail: false });
        }
    },
    "controleurVerficiationAuthentification",
    "Erreur lors de la vérification de l'authentification",
);

// --- GESTION 2FA INSCRIPTION ---
export const generer2FAControleur = gestionErreur(
    async (req, res) => {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        const tokenEnClair = jwt.verify(token, process.env.CHAINE_JWT_CONFIG_2FA);
        if (tokenEnClair.scope !== "2fa_config") {
            return res.sendStatus(403);
        }

        const qrCode = await generer2FA(req, tokenEnClair.sub)

        return res.json({
            etat: true,
            detail: qrCode,
        });
    },
    "controleurGenerer2FA",
    "Erreur lors de la génération de la double authentification",
);

export const verifier2FA = gestionErreur(
    async (req, res) => {
        const tokenEnClair = jwt.verify(req.body.token, process.env.CHAINE_JWT_CONFIG_2FA);

        if (tokenEnClair.scope !== "2fa_config") {
            return res.sendStatus(403);
        }

        const utilisateur = await req.Utilisateurs.findByPk(tokenEnClair.sub);

        const valide = await verifierCode2FA(utilisateur, req.body.code);

        if (!valide) {
            return res.status(401).json({
                etat: false,
                detail: "Code 2FA invalide",
            });
        }

        await VerifierCode2FA(req, tokenEnClair.sub, req.body.code)

        return await req.Utilisateurs.generationToken(req, res, utilisateur);
    },
    "controleurVerifier2FA",
    "Erreur lors de la vérification de la double authentification",
);

// --- GESTION 2FA DEPUIS /mon-compte ---
export const genererQRCode = gestionErreur(async (req, res) => {
    const qrCode = await generer2FA(req, req.idUtilisateur)

    return res.json({
        etat: true,
        detail: qrCode,
    });
}, "genererQRCodeMonCompte", "Erreur lors de l'activation de la double authentification.")

export const initialisationCode2FA = gestionErreur(async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(401).json({
            etat: false,
            detail: "Requête incorrecte",
        });
    }

    await VerifierCode2FA(req, req.idUtilisateur, code)
    return res.json({ etat: true, detail: { active: true, detail: await RecuperationMonCompte(req) } })

}, "controleurInitialisation2FA", "Erreur lors de la vérification du code de double authentification")

export const desactiver2FA = gestionErreur(async (req, res) => {
    const utilisateur = await req.Utilisateurs.findByPk(req.idUtilisateur)
    if (utilisateur.role == "controleur") {
        return res.status(403).json({
            etat: false,
            detail: "Fonctionnalité interdite",
        });
    }

    utilisateur.doubleAuthentificationActive = false
    utilisateur.doubleAuthentificationSecret = ""
    await utilisateur.save()

    return res.json({ etat: true, detail: await RecuperationMonCompte(req) })

}, "controleurDesactiver2FA", "Erreur lors de la désactivation de la double authentification")

// --- MODIFICATIONS PARAMETRES COMPTE ---
export const modifierMail = gestionErreur(
    async (req, res) => {
        const { mail } = req.body;
        if (!mail) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!regexMail.test(mail)) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }

        const utilisateur = await req.Utilisateurs.findByPk(req.idUtilisateur);

        // Crée le token
        const token = genererToken(10);

        await req.Tokens.create({
            token,
            type: "changementMail",
            details: { idUtilisateur: req.idUtilisateur, nouvelleAdresseMail: mail },
        });

        // Envoyer le mail
        const { texte, html } = recupererTexteMail("validationChangementEmail", { nomUtilisateur: utilisateur.nom, nouvelleAdresseMail: mail, lienValidation: `${process.env.IP_FRONTEND}/mon-compte?type=mail&token=${token}` });

        await envoyerMail({
            destinataire: utilisateur.mail,
            sujet: "Changement d'adresse mail",
            texte,
            html,
        });

        return res.json({ etat: true, detail: "ok" });
    },
    "controleurModifierMail",
    "Erreur lors de la modification du mail",
);

export const verificationTokenChangementMail = gestionErreur(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({
            etat: false,
            detail: "Requête incorrecte",
        });
    }
    const { details, id } = await req.Tokens.findOne({ where: { type: "changementMail", token }, raw: true, attributes: ["details", "id"] })

    const detailsParse = JSON.parse(details)
    console.log(detailsParse)

    await req.Utilisateurs.update({ mail: detailsParse.nouvelleAdresseMail }, { where: { id: detailsParse.idUtilisateur } })

    await req.Tokens.destroy({ where: { id } });

    return res.json({ etat: true, detail: "ok" })

}, "controleurVerificationTokenChangementMail", "Erreur lors de la vérifiation du lien reçu par mail")

export const modifierMdp = gestionErreur(async (req, res) => {
    const utilisateur = await req.Utilisateurs.findByPk(req.idUtilisateur)
    const token = genererToken(10)

    await req.Tokens.create({
        token,
        type: "changementMdp",
        details: { idUtilisateur: req.idUtilisateur },
    });

    const { texte, html } = recupererTexteMail("validationChangementMotDePasse", { nomUtilisateur: utilisateur.nom, lienValidation: `${process.env.IP_FRONTEND}/mon-compte?type=mdp&token=${token}` });

    await envoyerMail({
        destinataire: utilisateur.mail,
        sujet: "Changement de mot de passe",
        texte,
        html,
    });

    return res.json({ etat: true, detail: "ok" });

}, "controleurModifierMdp", "Erreur lors de l'envoie du mail pour modifier le mot de passe")

export const validationTokenModifierMdp = gestionErreur(async (req, res) => {
    const { mdp, token } = req.body;
    if (!mdp || !token) {
        return res.status(401).json({
            etat: false,
            detail: "Requête incorrecte",
        });
    }

    const tokenBdd = await req.Tokens.findOne({ where: { token }, raw: true })

    if (!tokenBdd) {
        return res.status(404).json({
            etat: false,
            detail: "Ressource inexistante",
        });
    }

    const { idUtilisateur } = JSON.parse(tokenBdd.details);

    if (req.idUtilisateur !== idUtilisateur) {
        return res.json({ etat: true, detail: { modifier: false, detail: "Erreur utilisateur" } })
    }

    const regexMdp = /^.{8,}$/;
    if (!regexMdp.test(mdp)) {
        return res.json({ etat: true, detail: { modifier: false, detail: "Mot de passe trop court." } });
    }
    const motDePasseHash = await bcrypt.hash(mdp, 12);
    await req.Utilisateurs.update({ motDePasse: motDePasseHash }, { where: { id: req.idUtilisateur } })

    return res.json({ etat: true, detail: { modifier: false, detail: "Erreur utilisateur" } })

    // return res.json({ etat: true, detail: { modifier: true } });

}, "controleurValidationTokenModifierMdp", "Erreur lors du changement de mot de passe")

// --- AUTRE ---
export const deconnexion = gestionErreur(
    async (req, res) => {
        res.clearCookie("utilisateur", {
            httpOnly: true,
            sameSite: "Strict",
            secure: process.env.MODE == "production",
        });

        return res.json({ etat: true, detail: "ok" });
    },
    "controleurDeconnexion",
    "Erreur lors de la déconnexion",
);

export const detailsToken = gestionErreur(
    async (req, res) => {
        const { token } = req.query;

        if (!token) {
            return res.status(401).json({
                etat: false,
                detail: "Requête incorrecte",
            });
        }
        const lien = await req.Tokens.findOne({ where: { token }, raw: true });

        if (!lien) {
            return res.json({ etat: true, detail: { trouver: false } });
        }
        if (lien.type != "creationCompte") {
            return res.status(403).json({
                etat: false,
                detail: "Erreur d'utilisation du token",
            });
        }
        const detailLien = JSON.parse(lien.details);

        return res.json({ etat: true, detail: { trouver: true, mail: detailLien } });
    },
    "controleurDetailTokenAuthentification",
    "Erreur lors de la récupération des détails du lien de connexion",
);

export const monCompte = gestionErreur(
    async (req, res) => {
        return res.json({ etat: true, detail: await RecuperationMonCompte(req) })
    },
    "controleurMonCompte",
    "Erreur lors de la récupération des informations de votre compte",
);
export const suppressionCompte = gestionErreur(async (req, res) => {
    await req.Utilisateurs.destroy({ where: { id: req.idUtilisateur } })

    res.clearCookie("utilisateur", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.MODE == "production",
    });

    return res.json({ etat: true, detail: "ok" });
}, "controleurSuppressionCompte", "Erreur lors de la suppression du compte")