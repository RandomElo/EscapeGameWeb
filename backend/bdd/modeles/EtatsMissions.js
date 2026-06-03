import { DataTypes } from "sequelize";

export default function (bdd) {
    const EtatsMissions = bdd.define(
        "EtatsMissions",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            partieId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Parties",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            missionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Missions",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            etat: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "enCours",
                validate: {
                    isIn: [["enCours", "finie"]],
                },
            },
            dateDebut: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            dateFin: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "EtatsMissions",
        },
    );
    return EtatsMissions;
}
