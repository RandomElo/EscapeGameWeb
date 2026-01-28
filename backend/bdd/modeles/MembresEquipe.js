import { DataTypes } from "sequelize";

export default function (bdd) {
    const MembresEquipe = bdd.define(
        "MembresEquipe",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            equipeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Equipes",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            utilisateurId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Utilisateurs",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            estChef: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: "MembresEquipe",
            indexes: [
                {
                    unique: true,
                    fields: ["equipeId", "utilisateurId"],
                },
            ],
        }
    );
    return MembresEquipe;
}
