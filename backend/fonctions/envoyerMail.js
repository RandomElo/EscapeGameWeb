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
