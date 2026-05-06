import { DataTypes } from "sequelize";

export default function (bdd) {
    const Devinettes = bdd.define("Devinettes", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nom: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        devinette: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    });
    return Devinettes;
}
