import { DataTypes } from "sequelize";

export default function (bdd) {
    const LiensMail = bdd.define(
        "LiensMail",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            token: {
                type: DataTypes.STRING(10),
                allowNull: false,
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{10}$/,
                },
            },
            type: {
                type: DataTypes.ENUM("recapPartie", "resetMdp", "invitationEquipe", "validationCompte", "demandeAdhesion", "creationCompte"),
                allowNull: false,
            },
            details: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: {},
            },
        },
        {
            tableName: "LiensMail",
        },
    );
    return LiensMail;
}
