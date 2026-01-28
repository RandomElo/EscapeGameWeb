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
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    is: /^[A-Za-z0-9]{10}$/,
                },
            },
            type: {
                type: DataTypes.ENUM("recapPartie", "resetMdp", "invitationEquipe", "validationCompte", "demandeAdhesion"),
                allowNull: false,
            },
        },
        {
            tableName: "LiensMail",
        },
    );
    return LiensMail;
}
