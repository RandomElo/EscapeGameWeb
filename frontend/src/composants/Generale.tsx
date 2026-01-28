import { useEffect, type ReactNode } from "react";
import { useErreur } from "../contexts/ErreurContext";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Generale({ children }: { children?: ReactNode }) {
    const { erreur, setErreur } = useErreur();
    const { estAuth, role } = useAuth();

    const location = useLocation();

    useEffect(() => {
        if (erreur) {
            setErreur(null);
        }
    }, [location]);

    return (
        <>
            <header>
                <nav className="navbar">
                    <NavLink className="logo" to="/">
                        Escape Game
                    </NavLink>
                    <div className="navLinks">
                        <ul>
                            <li>
                                <NavLink to="/">Accueil</NavLink>
                            </li>
                            {estAuth ? (
                                <>
                                    {role == "joueur" ? (
                                        <>
                                            <li>
                                                <NavLink to="/equipe">Équipe</NavLink>
                                            </li>
                                            <li>
                                                <NavLink to="/classements">Classements</NavLink>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink to="/connexion">Interface d'administration</NavLink>
                                        </>
                                    )}

                                    <li>
                                        <NavLink to="/mon-compte">Mon compte</NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <NavLink to="/inscription">Inscription</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/connexion">Connexion</NavLink>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </nav>
            </header>
            {erreur ? (
                <div className="Erreur">
                    <h1>🚨 Une erreur est survenue 🚨</h1>
                    <p>
                        <span className="gras souligner">Détail erreur :</span> {erreur?.message || "Une erreur inconnue est survenue."}
                    </p>
                    <button onClick={() => window.location.reload()} className="lien">
                        Recharger
                    </button>
                </div>
            ) : (
                children || <Outlet />
            )}
        </>
    );
}
