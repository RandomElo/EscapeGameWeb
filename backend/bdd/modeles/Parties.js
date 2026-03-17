import { DataTypes } from "sequelize";
function genererId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
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
            token: {
                type: DataTypes.STRING(5),
                allowNull: false,
                unique: true,
                defaultValue: () => genererId(),
            },
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
        },
    );
    return Parties;
}
