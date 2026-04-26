import { DataTypes } from "sequelize";

export default function (bdd) {
    const Missions = bdd.define(
        "Missions",
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
            public: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: "Missions",
        },
    );
    return Missions;
}
