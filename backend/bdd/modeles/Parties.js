import { DataTypes } from "sequelize";

export default function (bdd) {
    const Parties = bdd.define(
        "Parties",
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
            scenarioId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Scenarios",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            dateDebut: { type: DataTypes.DATE, allowNull: true },
            dateFin: { type: DataTypes.DATE, allowNull: true },
            statut: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "enCours",
                validate: {
                    isIn: [["planifiee", "enCours", "terminee", "abandonnee"]],
                },
            },
        },
        {
            tableName: "Parties",
        }
    );
    return Parties;
}
