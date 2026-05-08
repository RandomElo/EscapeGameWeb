// Middleware qui permet de rendre facilement accessible l'ORM Sequelize
export const accessibiliteBdd = (bdd) => {
    return (req, res, next) => {
        const { sequelize, Utilisateurs, Equipes, MembresEquipe, Parties, Scenarios, Missions, EtatsMissions, DerouleScenario, Scores, MessagesAudio, JournauxEvenements, Tokens, DemandesAdhesion, MorseAudios, QuizAudios, QuizQuestions, AideAudios, Devinettes, Diapos, Images, QuestionPoseesPartie } = bdd;

        req.Sequelize = sequelize;

        // Utilisateur
        req.Utilisateurs = Utilisateurs;
        req.Equipes = Equipes;
        req.MembresEquipe = MembresEquipe;
        req.DemandesAdhesion = DemandesAdhesion;

        // Jeux
        req.Parties = Parties;
        req.Scenarios = Scenarios;
        req.Missions = Missions;
        req.MessagesAudio = MessagesAudio;
        req.DerouleScenario = DerouleScenario;

        req.EtatsMissions = EtatsMissions;
        req.Scores = Scores;

        // Autres
        req.JournauxEvenements = JournauxEvenements;
        req.Tokens = Tokens;

        // Mission 2
        req.MorseAudios = MorseAudios;

        // Mission 5
        req.QuizAudios = QuizAudios;
        req.QuizQuestions = QuizQuestions;
        req.AideAudios = AideAudios;

        // Mission 4
        req.Devinettes = Devinettes;

        // Mission 1
        req.Diapos = Diapos;
        req.Images = Images;
        req.QuestionPoseesPartie = QuestionPoseesPartie;

        next();
    };
};
