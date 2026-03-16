export const partiesEnCours = gestionErreur(async (req, res) => {
    const parties = await req.Parties.findAll({where:{statut:"enCours"}})
    if(parties.length > 0) {
        // je doit récupérer les détails {equipe, dateDebut,scenarioNom, scenarioDescription}
        return res.json({etat:true, detail:{partiesEnCours:true, detail:parties}})
    } else {
        // je doit récupérer les scénarios et les equipes
    }
}, "controleurPartiesEnCours", "Erreur lors de la récupération des parties en cours");
