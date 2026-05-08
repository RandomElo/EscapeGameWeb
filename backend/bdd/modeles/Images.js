import { DataTypes } from "sequelize";
import { randomUUID } from "crypto";

export default function (bdd) {
    const Images = bdd.define(
        "Images",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nom: {
                type: DataTypes.STRING(255),
                defaultValue: randomUUID()
            },
            image: {
                type: DataTypes.BLOB("long"),
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
