import { DataTypes } from "sequelize";

export default function (bdd) {
    const MissionAudios = bdd.define(
        "MissionAudios",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            texte: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nomFichier: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: "MissionAudios",
        }
    );
    return MissionAudios;
}