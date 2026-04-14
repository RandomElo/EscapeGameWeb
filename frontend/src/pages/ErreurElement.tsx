import { useNavigate, useRouteError } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Generale from "../composants/Generale";

export default function ErreurElement() {
    const navigation = useNavigate();
    const { estAuth, chargement } = useAuth();
    const erreur = useRouteError() as Error;

    useEffect(() => {
        if (!estAuth && !chargement) {
            navigation("/connexion");
        }
    }, [estAuth, navigation]);
    return (
        <Generale>
            <div className="Erreur">
                <h1>🚨 Une erreur est survenue 🚨</h1>
                <p>
                    <span className="gras souligner">Détail erreur :</span> {erreur?.message || "Une erreur inconnue est survenue."}
                </p>
                <button onClick={() => window.location.reload()} className="lien">
                    Recharger
                </button>
            </div>
        </Generale>
    );
}
