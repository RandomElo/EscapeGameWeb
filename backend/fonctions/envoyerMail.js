import nodemailer from "nodemailer";

const textesMail = {
    ajoutEquipeCreationCompte: ({ nomUtilisateur, nomEquipe, lienCreation }) => ({
        texte: `Bonjour,

        ${nomUtilisateur} vous a invité à rejoindre l’équipe "${nomEquipe}".

        Pour accepter cette invitation, vous devez d’abord créer un compte en utilisant l’adresse email à laquelle ce message a été envoyé.

        Cliquez sur le lien ci-dessous pour créer votre compte :
        ${lienCreation}

        Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer ce message.

        Cordialement,
        L’équipe Escape Game`,
        html: /* html */ `
            <p>Bonjour,</p>

            <p><strong>${nomUtilisateur}</strong> vous a invité à rejoindre l’équipe <strong>${nomEquipe}</strong>.</p>

            <p>Pour accepter cette invitation, vous devez d’abord créer un compte.</p>

            <p>
                <a href="${lienCreation}"
                   style="display:inline-block;padding:10px 16px;background:#0085ff;color:#fff;text-decoration:none;border:none;border-radius:5px;">
                    Créer mon compte
                </a>
            </p>

            <p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer ce message.</p>

            <p>Cordialement,<br>L’équipe Escape Game</p>
        `,
    }),
    ajoutEquipeNotification: ({ nomUtilisateur, nomEquipe }) => ({
        texte: `Bonjour,

        ${nomUtilisateur} vous a ajouté à l’équipe "${nomEquipe}".

        Vous faites désormais partie de cette équipe et pouvez y accéder dès votre prochaine connexion ou directement a partir de ce lien.

        ${process.env.IP_FRONTEND}/equipe

        Si vous pensez qu’il s’agit d’une erreur, merci de contacter un administrateur.

        Cordialement,
        L’équipe Escape Game`,
        html: /* html */ `
            <p>Bonjour,</p>

            <p>
                <strong>${nomUtilisateur}</strong> vous a ajouté à l’équipe
                <strong>${nomEquipe}</strong>.
            </p>

            <p>
                Vous faites désormais partie de cette équipe et pouvez y accéder dès votre prochaine connexion ou directement a partir de ce lien.
            </p>

            <p>
                <a href="${process.env.IP_FRONTEND}/equipe"
                   style="display:inline-block;padding:10px 16px;background:#0085ff;color:#fff;text-decoration:none;border:none;border-radius:5px;">
                    Mes équipes
                </a>
            </p>

            <p style="color:#666;font-size:0.9em;">
                Si vous pensez qu’il s’agit d’une erreur, merci de contacter un administrateur.
            </p>

            <p>Cordialement,<br>L’équipe Escape Game</p>
        `,
    }),
    validationChangementEmail: ({ nomUtilisateur, nouvelleAdresseMail, lienValidation }) => ({
        texte: `Bonjour,

        ${nomUtilisateur}, vous avez demandé à modifier votre adresse email.

        Nouvelle adresse email : ${nouvelleAdresseMail}

        Pour confirmer ce changement, veuillez cliquer sur le lien ci-dessous :
        ${lienValidation}

        Si vous n’êtes pas à l’origine de cette demande, nous vous recommandons de sécuriser votre compte immédiatement.

        Cordialement,
        L’équipe Escape Game`,

        html: /* html */ `
            <p>Bonjour,</p>

            <p>
                <strong>${nomUtilisateur}</strong>, vous avez demandé à modifier votre adresse email.
            </p>

            <p>
                Nouvelle adresse email : <strong>${nouvelleAdresseMail}</strong>
            </p>

            <p>Pour confirmer ce changement, cliquez sur le bouton ci-dessous :</p>

            <p>
                <a href="${lienValidation}"
                style="display:inline-block;padding:10px 16px;background:#0085ff;color:#fff;text-decoration:none;border:none;border-radius:5px;">
                    Valider le changement d’adresse email
                </a>
            </p>

            <p style="color:#666;font-size:0.9em;">
                Si vous n’êtes pas à l’origine de cette demande, nous vous recommandons de sécuriser votre compte immédiatement.
            </p>

            <p>Cordialement,<br>L’équipe Escape Game</p>
        `,
    }), 
    validationChangementMotDePasse: ({ nomUtilisateur, lienValidation }) => ({
        texte: `Bonjour,

        ${nomUtilisateur}, vous avez demandé à modifier votre mot de passe.

        Pour confirmer ce changement, veuillez cliquer sur le lien ci-dessous :
        ${lienValidation}

        Si vous n’êtes pas à l’origine de cette demande, nous vous recommandons de sécuriser votre compte immédiatement.

        Cordialement,
        L’équipe Escape Game`,

        html: /* html */ `
        <p>Bonjour,</p>

        <p>
            <strong>${nomUtilisateur}</strong>, vous avez demandé à modifier votre mot de passe.
        </p>

        <p>Pour confirmer ce changement, cliquez sur le bouton ci-dessous :</p>

        <p>
            <a href="${lienValidation}"
               style="display:inline-block;padding:10px 16px;background:#0085ff;color:#fff;text-decoration:none;border:none;border-radius:5px;">
                Valider le changement de mot de passe
            </a>
        </p>

        <p style="color:#666;font-size:0.9em;">
            Si vous n’êtes pas à l’origine de cette demande, nous vous recommandons de sécuriser votre compte immédiatement.
        </p>

        <p>Cordialement,<br>L’équipe Escape Game</p>
    `,
    })

};

export function recupererTexteMail(nomTemplate, donnees) {
    const template = textesMail[nomTemplate];

    if (!template) {
        throw new Error(`Template de mail inconnu : ${nomTemplate}`);
    }

    return template(donnees);
}

export async function envoyerMail({ destinataire, sujet, texte, html }) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_UTILISATEUR,
                pass: process.env.MAIL_MDP,
            },
        });

        // Vérifie la connexion SMTP
        await transporter.verify();

        const info = await transporter.sendMail({
            from: `"Escape Game" <${process.env.MAIL_UTILISATEUR}>`,
            to: destinataire,
            subject: sujet,
            text: texte,
            html,
        });
        console.log("✅ Mail envoyé");
        return {
            succes: true,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        };
    } catch (error) {
        console.error("❌ Erreur envoi mail :", error);

        return {
            succes: false,
            erreur: error.message,
        };
    }
}
