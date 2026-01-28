import { DataTypes } from "sequelize";

export default function (bdd) {
    const JournauxEvenements = bdd.define(
        "JournauxEvenements",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            source: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            tableName: "JournauxEvenements",
            timestamps: true,
            createdAt: "dateEvenement",
            updatedAt: false,
        }
    );
    return JournauxEvenements;
}
