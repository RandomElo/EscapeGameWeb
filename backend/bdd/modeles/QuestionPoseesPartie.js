import { DataTypes } from "sequelize";

export default function (bdd) {
    const QuestionPoseesPartie = bdd.define(
        "QuestionPoseesPartie",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            partieId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Parties",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            questionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "QuizQuestions",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            }
        },
        {
            tableName: "QuestionPoseesPartie",

            indexes: [
                { fields: ["partieId"], },
                { fields: ["questionId"], },

                {
                    unique: true,
                    fields: ["partieId", "questionId",],
                },
            ],
        },
    );

    return QuestionPoseesPartie;
}
