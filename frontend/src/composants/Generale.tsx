import { useEffect, useState, type ReactNode } from "react";
import { useErreur } from "../contexts/ErreurContext";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRequete } from "../fonctions/requete";
import { BellDot, Check, X } from "lucide-react";
import Modal from "./Modal";

export default function Generale({ children }: { children?: ReactNode }) {
    const { erreur, setErreur } = useErreur();
    const { estAuth, role } = useAuth();
    const requete = useRequete();
    const location = useLocation();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    interface PropsDemandeAdhesion {
        etat: "accepter" | "refuser";
        demande: {
            nom: string;
            mail: string;
            nomEquipe: string;
            date: Date;
        };
    }
    const [demandesAdhesion, setDemandesAdhesion] = useState<
        {
            nom: string;
            mail: string;
            nomEquipe: string;
            date: Date;
        }[]
    >();

    useEffect(() => {
        if (erreur) {
            setErreur(null);
        }
    }, [location]);

    useEffect(() => {
        const verificationDemandeAdhesion = async () => {
            const reponse = await requete({ url: "/equipes/demandes-adhesion" });
            if (reponse.estConnecte) {
                setDemandesAdhesion(reponse.details);
            }
        };
        verificationDemandeAdhesion();
    }, []);

    function formattageDate(date: string | Date): string {
        const now = new Date().getTime();
        const past = new Date(date).getTime();
        const diffMs = now - past;

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return "à l’instant";
        if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
        if (diffHours < 24) return `il y a ${diffHours} h`;
        if (diffDays < 7) return `il y a ${diffDays} j`;

        return new Date(date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
    async function reponseDemandeAdhesion({ etat, demande }: PropsDemandeAdhesion): Promise<any> {
        const reponse = await requete({ url: "/equipes/reponse-demande-adhesion", methode: "PATCH", corps: { etat, mail: demande.mail, date: demande.date, nomEquipe: demande.nomEquipe } });
    }
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
                                    {demandesAdhesion && (
                                        <li
                                            className="notificationDemandesAdhesion"
                                            onClick={() => {
                                                setAfficherModal(true);
                                            }}
                                        >
                                            <BellDot />
                                        </li>
                                    )}
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
            <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)}>
                {afficherModal && demandesAdhesion && (
                    <div id="modalGestionDemandesAdhesion">
                        <h1>Demandes d'adhésion</h1>
                        <table>
                            <tr>
                                <th>Date</th>
                                <th>Nom</th>
                                <th>Mail</th>
                                <th>Équipe</th>
                                <th></th>
                                <th></th>
                            </tr>
                            <tbody>
                                {demandesAdhesion.map((demande, key) => (
                                    <tr key={key}>
                                        <td>{formattageDate(demande.date)}</td>
                                        <td>{demande.nom}</td>
                                        <td className="tdMail">
                                            <a href={`mailto:${demande.mail}`}>{demande.mail}</a>
                                        </td>
                                        <td>{demande.nomEquipe}</td>
                                        <td className="tdAccepter" onClick={() => reponseDemandeAdhesion({ etat: "accepter", demande })}>
                                            <Check />
                                        </td>
                                        <td className="tdRefuser" onClick={() => reponseDemandeAdhesion({ etat: "accepter", demande })}>
                                            <X />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
        </>
    );
}
