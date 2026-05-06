import { DataTypes } from "sequelize";

export default function (bdd) {
    const MessagesAudio = bdd.define(
        "MessagesAudio",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            detail: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            nomFichier: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: "MessagesAudio",
        }
    );
    return MessagesAudio;
}
