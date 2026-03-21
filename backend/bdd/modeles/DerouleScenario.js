import { DataTypes } from "sequelize";

export default function (bdd) {
    const DerouleScenario = bdd.define(
        "DerouleScenario",
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
            type: {
                type: DataTypes.STRING(20),
                allowNull: false,
                validate: {
                    isIn: [["mission", "audio"]],
                },
            },
            missionId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "Missions",
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
            ordre: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            configuration: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: {},
            },
        },
        {
            tableName: "DerouleScenario",
            indexes: [
                {
                    unique: true,
                    fields: ["scenarioId", "missionId"],
                },
                {
                    unique: true,
                    fields: ["scenarioId", "ordre"],
                },
            ],
        },
    );
    return DerouleScenario;
}
