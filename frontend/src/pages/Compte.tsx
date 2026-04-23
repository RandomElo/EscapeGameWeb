import { useLoaderData, useNavigate } from "react-router-dom";
import "../styles/Compte.css";
import { useEffect, useState } from "react";
import { useRequete } from "../fonctions/requete";
import { useAuth } from "../contexts/AuthContext";
export default function Compte() {
    const donneesLoader = useLoaderData();
    const requete = useRequete();
    const naviation = useNavigate();
    const { estAuth, chargement, deconnexion } = useAuth();

    const [donnees, setDonnees] = useState<{ nom: string; mail: string; doubleAuthentificationActive: boolean; nbrParties?: number }>();
    const [chargementRequete, setChargementRequete] = useState<boolean>(false);
    // mettre en place le chargement de deconnexion + verification auth
    useEffect(() => {
        setDonnees(donneesLoader);
    }, [donneesLoader]);

    return (
        <div className="Compte">
            <h1 id="titre">Mon compte</h1>
            <div className="mesInfos">
                <p>
                    <span className="gras">Nom : </span>
                    {donnees?.nom}
                </p>
                <p>
                    <span className="gras">Mail : </span>
                    {donnees?.mail}
                </p>
                <p>
                    <span className="gras">2FA : </span>
                    {donnees?.doubleAuthentificationActive ? "active" : "inactive"}
                </p>

                {donnees?.nbrParties && (
                    <p>
                        <span className="gras">Nombres de parties jouées :</span>
                        {donnees?.nbrParties}
                    </p>
                )}
            </div>

            <div className="divActions">
                <button className="bouton">Changer d'adresse mail</button>
                <button className="bouton">Changer de mot de passe</button>
                {!donnees?.doubleAuthentificationActive && <button className="bouton">Activer la 2FA</button>}
                <button
                    className="bouton rouge"
                    onClick={async () => {
                        setChargementRequete(true);
                        await requete({ url: "/utilisateurs/deconnexion", methode: "DELETE" });
                        setTimeout(() => {
                            setChargementRequete(false);
                            deconnexion();
                            naviation("/connexion");
                        }, 1000);
                    }}
                >
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
