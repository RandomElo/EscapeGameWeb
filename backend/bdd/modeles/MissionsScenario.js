import { DataTypes } from "sequelize";

export default function (bdd) {
    const MissionsScenario = bdd.define(
        "MissionsScenario",
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
            ordre: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            reponse: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: {},
            },
        },
        {
            tableName: "MissionsScenario",
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
        }
    );
    return MissionsScenario;
}
