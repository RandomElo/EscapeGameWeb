import nodemailer from "nodemailer";

export async function envoyerMail({ destinataire, sujet, texte, html }) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_UTILISATEUR,
            pass: process.env.MAIL_MDP,
        },
    });

    await transporter.sendMail({
        from: `"Escape Game" <${process.env.MAIL_USER}>`,
        to: destinataire,
        subject: sujet,
        text: texte,
        html,
    });
}
