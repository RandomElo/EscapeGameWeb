// Middleware qui permet de rendre facilement accessible l'ORM Sequelize
export const accessibiliteBdd = (bdd) => {
    return (req, res, next) => {
        const { sequelize, Utilisateurs, Equipes, MembresEquipe, Parties, Scenarios, Missions, EtatsMissions, DerouleScenario, Scores, MessagesAudio, JournauxEvenements, Tokens, DemandesAdhesion, MorseAudios, QuizAudios, QuizQuestions, AideAudios, Devinettes, Diapos, Images } = bdd;

        req.Sequelize = sequelize;
        req.Utilisateurs = Utilisateurs;
        req.Equipes = Equipes;
        req.MembresEquipe = MembresEquipe;
        req.Parties = Parties;
        req.Scenarios = Scenarios;
        req.Missions = Missions;
        req.EtatsMissions = EtatsMissions;
        req.DerouleScenario = DerouleScenario;
        req.Scores = Scores;
        req.MessagesAudio = MessagesAudio;
        req.JournauxEvenements = JournauxEvenements;
        req.Tokens = Tokens;
        req.DemandesAdhesion = DemandesAdhesion;
        req.MorseAudios = MorseAudios;
        req.QuizAudios = QuizAudios;
        req.QuizQuestions = QuizQuestions;
        req.AideAudios = AideAudios;
        req.Devinettes = Devinettes;
        req.Diapos = Diapos;
        req.Images = Images;

        next();
    };
};
