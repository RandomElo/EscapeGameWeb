import { DataTypes } from "sequelize";

export default function (bdd) {
    const QuizAudios = bdd.define(
        "QuizAudios",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING(20),
                allowNull: false,
                validate: {
                    isIn: [["bonneReponse", "mauvaiseReponse", "serieErreurs", "finQuiz", "question"]],
                },
            },
            texte: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nomFichier: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: "QuizAudios",
        },
    );
    return QuizAudios;
}
