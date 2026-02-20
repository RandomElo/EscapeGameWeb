// Middleware qui permet de rendre facilement accessible l'ORM Sequelize
export const accessibiliteBdd = (bdd) => {
    return (req, res, next) => {
        const { sequelize, Utilisateurs, Equipes, MembresEquipe, Parties, Scenarios, Missions, EtatsMissions, MissionsScenario, Scores, MessagesAudio, JournauxEvenements, Tokens, DemandesAdhesion, MorseAudios } = bdd;

        req.Sequelize = sequelize;
        req.Utilisateurs = Utilisateurs;
        req.Equipes = Equipes;
        req.MembresEquipe = MembresEquipe;
        req.Parties = Parties;
        req.Scenarios = Scenarios;
        req.Missions = Missions;
        req.EtatsMissions = EtatsMissions;
        req.MissionsScenario = MissionsScenario;
        req.Scores = Scores;
        req.MessagesAudio = MessagesAudio;
        req.JournauxEvenements = JournauxEvenements;
        req.Tokens = Tokens;
        req.DemandesAdhesion = DemandesAdhesion;
        req.MorseAudios = MorseAudios;

        next();
    };
};
