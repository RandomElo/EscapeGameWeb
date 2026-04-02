import { DataTypes } from "sequelize";

export default function (bdd) {
    const Scores = bdd.define(
        "Scores",
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
            missionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Missions",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            points: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            tempsSecondes: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "Scores",
        }
    );
    return Scores;
}
