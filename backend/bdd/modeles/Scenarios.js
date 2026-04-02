import { DataTypes } from "sequelize";

export default function (bdd) {
    const Scenarios = bdd.define(
        "Scenarios",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nom: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: "Scenarios",
        }
    );
    return Scenarios;
}
