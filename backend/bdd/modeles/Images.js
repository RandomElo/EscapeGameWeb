import { DataTypes } from "sequelize";

export default function (bdd) {
    const Images = bdd.define(
        "Images",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            nomFichier: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            ordre: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            diapoId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "Images",

            indexes: [
                {
                    fields: ["diapoId"],
                },
                {
                    unique: true,
                    fields: ["diapoId", "ordre"],
                },
            ],
        },
    );

    return Images;
}
