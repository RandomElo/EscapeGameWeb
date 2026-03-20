import { DataTypes } from "sequelize";

export default function (bdd) {
    const QuizQuestions = bdd.define(
        "QuizQuestions",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            question: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            reponse: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            difficulte: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nomFichier: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: "QuizQuestions",
        },
    );
    return QuizQuestions;
}
