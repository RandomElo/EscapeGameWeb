import { DataTypes } from "sequelize";

export default function (bdd) {
    const DemandesAdhesion = bdd.define(
        "DemandesAdhesion",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            utilisateurId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "Utilisateurs",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
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
            type: {
                type: DataTypes.STRING(20),
                allowNull: false,
                validate: {
                    isIn: [["demande", "ajout"]],
                },
            },

            mail: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },

            accepter: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: "DemandesAdhesion",
            timestamps: true,
            createdAt: "date",
            updatedAt: false,
        },
    );
    return DemandesAdhesion;
}
