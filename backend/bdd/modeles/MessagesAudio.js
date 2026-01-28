import { DataTypes } from "sequelize";

export default function (bdd) {
    const MessagesAudio = bdd.define(
        "MessagesAudio",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            scenarioId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Scenarios",
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
            detail: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nomFichier: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: "MessagesAudio",
        }
    );
    return MessagesAudio;
}
