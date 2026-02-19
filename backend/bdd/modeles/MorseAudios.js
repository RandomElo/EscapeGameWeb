import { DataTypes } from "sequelize";

export default function (bdd) {
    const MorseAudios = bdd.define(
        "MorseAudios",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            reponse: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nomFichier: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: "MorseAudios",
        },
    );
    return MorseAudios;
}