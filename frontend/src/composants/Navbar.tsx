import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BellDot, Menu, X, Shield, Trophy, Users, UserCircle2, MonitorPlay, House, Scale, UserRound, UserRoundPlus } from "lucide-react";
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
        <>
            <aside className="navbar">
                {/* LOGO */}
                <NavLink className="navbar-logo" to="/" onClick={fermerMenu}>
                    <img src="/ancre.png" alt="Logo ancre" />
                    <span>Escape Game</span>
                </NavLink>

                {/* NAVIGATION PRINCIPALE */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <NavLink className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} to="/" onClick={fermerMenu}>
                        <House size={16} />
                        Accueil
                    </NavLink>
                    {role == "controleur" && (
                        <>
                            <li>
                                <NavLink
                                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                                    onClick={() => {
                                        fermerMenu();

                                        if (location.pathname !== "/suivi-partie") {
                                            setNavigationEnCours("suiviPartie");
                                        }
                                    }}
                                    to="/suivi-partie"
                                >
                                    {navigationEnCours == "suiviPartie" ? <Chargement variant="button" /> : <MonitorPlay size={16} />}
                                    Suivi partie
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                                    onClick={() => {
                                        fermerMenu();

                                        if (location.pathname !== "/administration") {
                                            setNavigationEnCours("administration");
                                        }
                                    }}
                                    to="/administration"
                                >
                                    {navigationEnCours == "administration" ? <Chargement variant="button" /> : <Shield size={16} />}
                                    Administration
                                </NavLink>
                            </li>
                        </>
                    )}
                    <li>
                        <NavLink className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} to="/classement">
                            <Trophy size={16} />
                            Classements
                        </NavLink>
                    </li>
                    {role === "joueur" && (
                        <li>
                            <NavLink className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} to="/equipe">
                                <Users size={16} />
                                Équipe
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} to="/informations-legales">
                            <Scale size={16} />
                            Informations légales
                        </NavLink>
                    </li>
                </ul>

                {/* FOOTER — connexion ou profil */}
                <div className="navbar-footer">
                    {estAuth ? (
                        <>
                            <NavLink
                                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
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

                            {demandesAdhesion && demandesAdhesion.length > 0 && (
                                <button className="navbarNotification" onClick={() => setAfficherModal(true)}>
                                    <BellDot size={18} />
                                    <span className="navbarNotificationBadge">{demandesAdhesion.length}</span>
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <NavLink className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} to="/connexion" onClick={() => fermerMenu()}>
                                <UserRound size={18} />
                                Connexion
                            </NavLink>

                            <NavLink className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} to="/inscription" onClick={() => fermerMenu()}>
                                <UserRoundPlus size={18} />
                                Inscription
                            </NavLink>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}
