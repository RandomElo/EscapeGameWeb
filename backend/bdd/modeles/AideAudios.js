import { DataTypes } from "sequelize";

export default function (bdd) {
    const AideAudios = bdd.define(
        "AideAudios",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
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
            audioId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "MessagesAudio",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        {
            tableName: "AideAudios",
            indexes: [
                {
                    unique: true,
                    fields: ["scenarioId", "audioId"],
                },
            ],
        },
    );
    return AideAudios;
}
