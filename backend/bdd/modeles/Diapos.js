import { DataTypes } from "sequelize";

export default function (bdd) {
    const Diapos = bdd.define("Diapos", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nom: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
    });
    return Diapos;
}
