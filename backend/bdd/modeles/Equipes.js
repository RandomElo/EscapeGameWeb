import { DataTypes } from "sequelize";

export default function (bdd) {
    const Equipes = bdd.define(
        "Equipes",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nom: {
                type: DataTypes.STRING(150),
                unique: true,
                allowNull: false,
            },
            statut: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "inactive",
                validate: {
                    isIn: [["inactive", "enCours"]],
                },
            },
        },
        {
            tableName: "Equipes",
            timestamps: true,
            createdAt: "dateCreation",
            updatedAt: false,
        },
    );
    return Equipes;
}
