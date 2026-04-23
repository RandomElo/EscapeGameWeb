import gestionErreur from "../middlewares/gestionErreur.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

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
        console.log("je suis iciz");
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

export const generer2FA = gestionErreur(
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

        const utilisateur = await req.Utilisateurs.findByPk(tokenEnClair.sub);

        const secret = speakeasy.generateSecret({
            name: `EscapeGame (${utilisateur.mail})`,
        });

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        utilisateur.doubleAuthentificationSecret = secret.base32;
        await utilisateur.save();

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

        utilisateur.doubleAuthentificationActive = true;
        await utilisateur.save();

        return await req.Utilisateurs.generationToken(req, res, utilisateur);
    },
    "controleurVerifier2FA",
    "Erreur lors de la vérification de la double authentification",
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
        const { nom, mail, role, doubleAuthentificationActive } = await req.Utilisateurs.findByPk(req.idUtilisateur, { raw: true });
        if (role == "controleur") {
            return res.json({ etat: true, detail: { nom, mail, doubleAuthentificationActive } });
        } else {
            const mesEquipes = await req.MembresEquipe.findAll({ where: { idUtilisateur: req.idUtilisateur }, raw: true });

            let nbrParties = 0;
            for (const e of mesEquipes) {
                const equipe = await req.Equipes.findByPk(e.equipeId, { raw: true });
                nbrParties += await req.Parties.count({ where: { equipeId: e.id } });
            }

            return res.json({ etat: true, detail: { nom, mail, doubleAuthentificationActive, nbrParties } });
        }
    },
    "controleurMonCompte",
    "Erreur lors de la récupération des informations de votre compte",
);
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
