export default function gestionErreur(action, emplacement, detailReponse) {
    return async (req, res, next) => {
        try {
            await action(req, res, next);
        } catch (erreur) {
            console.error(erreur);
            await req.JournauxEvenements.create({
                source: "serveurWeb",
                message: `${{ nom: erreur.name, message: erreur.message, stack: erreur.stack }}`,
            });
            res.json({ etat: false, detail: detailReponse });
        }
    };
}