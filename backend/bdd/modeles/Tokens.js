import { DataTypes } from "sequelize";

export default function (bdd) {
    const Tokens = bdd.define(
        "Tokens",
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
                type: DataTypes.ENUM("recapPartie", "resetMdp", "invitationEquipe", "validationCompte", "demandeAdhesion", "creationCompte", 'accesBackendAudio'),
                allowNull: false,
            },
            details: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: {},
            },
        },
        {
            tableName: "Tokens",
        },
    );
    return Tokens;
}
