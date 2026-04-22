import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Generale from "../composants/Generale";

export default function ErreurElement() {
    const navigation = useNavigate();
    const { estAuth, chargement } = useAuth();
    const erreur = useRouteError();

    useEffect(() => {
        if (!estAuth && !chargement) {
            navigation("/connexion");
        }
    }, [estAuth, chargement, navigation]);

    let message = "Une erreur inconnue est survenue.";

    if (isRouteErrorResponse(erreur)) {
        message = erreur.data || erreur.statusText || `Erreur ${erreur.status}`;
    } else if (erreur instanceof Error) {
        message = erreur.message;
    }

    return (
        <Generale>
            <div className="Erreur">
                <h1>🚨 Une erreur est survenue 🚨</h1>

                <p>
                    <span className="gras souligner">Détail erreur :</span> {message}
                </p>

                {isRouteErrorResponse(erreur) && (
                    <p>
                        <span className="gras souligner">Code :</span> {erreur.status}
                    </p>
                )}

                <button onClick={() => window.location.reload()} className="lien">
                    Recharger
                </button>
            </div>
        </Generale>
    );
}
