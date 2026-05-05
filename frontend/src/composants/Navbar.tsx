import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BellDot, Menu, X, Shield, Trophy, Users, UserCircle2, MonitorPlay } from "lucide-react";
import type { Role } from "../contexts/AuthContext";
import type { DemandeAdhesion } from "./Generale";
import "../styles/composants/Navbar.css";
import Chargement from "./Chargement";

type Props = {
    estAuth: boolean;
    role: Role;
    demandesAdhesion: DemandeAdhesion[] | undefined;
    setAfficherModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ estAuth, role, demandesAdhesion, setAfficherModal }: Props) {
    const [menuOuvert, setMenuOuvert] = useState(false);
    const [navigationEnCours, setNavigationEnCours] = useState<"administration" | "suiviPartie" | "monCompte">();
    const fermerMenu = () => setMenuOuvert(false);
    const location = useLocation();

    useEffect(() => {
        const suppressionEtat = () => {
            setNavigationEnCours("");
        };
        suppressionEtat();
    }, [location.pathname]);
    return (
        <header className="navbarContainer">
            <nav className="navbar">
                <NavLink className="navbarLogo" to="/" onClick={fermerMenu}>
                    <img src="/ancre.png" alt="Logo en forme d'ancre" className="navbarLogoImg" />

                    <div className="navbarLogoTexte">Escape Game</div>
                </NavLink>

                <button className="navbarBurger" onClick={() => setMenuOuvert(!menuOuvert)} aria-label="Ouvrir le menu">
                    {menuOuvert ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className={`navbarNavigation ${menuOuvert ? "navbarNavigationOuverte" : ""}`}>
                    <ul className="navbarListeLiens">
                        <li>
                            <NavLink className="navbarLien" to="/" onClick={fermerMenu}>
                                Accueil
                            </NavLink>
                        </li>

                        {estAuth ? (
                            <>
                                {role === "joueur" ? (
                                    <>
                                        <li>
                                            <NavLink className="navbarLien" to="/classements" onClick={fermerMenu}>
                                                <Trophy size={16} />
                                                Classements
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink className="navbarLien" to="/equipe" onClick={fermerMenu}>
                                                <Users size={16} />
                                                Équipe
                                            </NavLink>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            <NavLink
                                                className="navbarLien"
                                                to="/suivi-partie"
                                                onClick={() => {
                                                    fermerMenu();

                                                    if (location.pathname !== "/suivi-partie") {
                                                        setNavigationEnCours("suiviPartie");
                                                    }
                                                }}
                                            >
                                                {navigationEnCours == "suiviPartie" ? <Chargement variant="button" /> : <MonitorPlay size={16} />}
                                                Suivi partie
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                className="navbarLien"
                                                to="/administration"
                                                onClick={() => {
                                                    fermerMenu();

                                                    if (location.pathname !== "/administration") {
                                                        setNavigationEnCours("administration");
                                                    }
                                                }}
                                            >
                                                {navigationEnCours == "administration" ? <Chargement variant="button" /> : <Shield size={16} />}
                                                Administration
                                            </NavLink>
                                        </li>

                                        <li>
                                            <NavLink className="navbarLien" to="/classements" onClick={fermerMenu}>
                                                <Trophy size={16} />
                                                Classement
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                            </>
                        ) : null}
                    </ul>

                    <div className="navbarActions">
                        {estAuth ? (
                            <>
                                {demandesAdhesion && demandesAdhesion.length > 0 && (
                                    <button
                                        className="navbarNotification"
                                        onClick={() => {
                                            setAfficherModal(true);
                                            fermerMenu();
                                        }}
                                    >
                                        <BellDot size={18} />
                                        <span className="navbarNotificationBadge">{demandesAdhesion.length}</span>
                                    </button>
                                )}

                                <NavLink
                                    className="navbarProfil navbarLien"
                                    to="/mon-compte"
                                    onClick={() => {
                                        fermerMenu();

                                        if (location.pathname !== "/mon-compte") {
                                            setNavigationEnCours("monCompte");
                                        }
                                    }}
                                >
                                    {navigationEnCours == "monCompte" ? <Chargement variant="button" /> : <UserCircle2 size={18} />}
                                    Mon compte
                                </NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink className="navbarLienSecondaire" to="/connexion" onClick={fermerMenu}>
                                    Connexion
                                </NavLink>

                                <NavLink className="navbarBoutonPrincipal" to="/inscription" onClick={fermerMenu}>
                                    Inscription
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
