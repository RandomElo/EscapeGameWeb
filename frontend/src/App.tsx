import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErreurRoute from "./pages/ErreurRoute";
import ErreurElement from "./pages/ErreurElement";
import Accueil from "./pages/Accueil";
import Generale from "./composants/Generale";
import { ErreurProvider } from "./contexts/ErreurContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Identification from "./pages/Identification";
import "./styles/Generale.css";
import Equipe from "./pages/Equipe";
import InterfaceAdministration from "./pages/InterfaceAdministration";
import SuiviPartie from "./pages/SuiviPartie";
import { ResponsiveProvider } from "./contexts/ResponsiveContext";
import { redirect } from "react-router-dom";
import Compte from "./pages/Compte";
import ChangementMail from "./pages/ChangementMail";

async function verifUtilisateur() {
    const requeteVerification = await fetch("/utilisateurs/verification", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!requeteVerification.ok) {
        throw new Response("Erreur lors de la vérification utilisateur", {
            status: 500,
        });
    }

    const reponseVerification = await requeteVerification.json();

    if (!reponseVerification.etat) throw redirect("/connexion");
    return reponseVerification.detail;
}
async function verifAdmin() {
    const donneesVerif = await verifUtilisateur();
    if (donneesVerif !== "controleur") throw redirect("/");
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Generale />,
        errorElement: <ErreurElement />,
        children: [
            {
                path: "/",
                element: <Accueil />,
            },

            {
                path: "/inscription",
                element: <Identification mode="inscription" />,
            },
            {
                path: "/connexion",
                element: <Identification mode="connexion" />,
            },
            {
                path: "/connexion",
                element: <Identification mode="connexion" />,
            },
            {
                path: "/equipe",
                element: <Equipe />,
                loader: async () => {
                    try {
                        await verifUtilisateur();

                        const requeteDonnees = await fetch("/equipes/mes-equipes", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                        });

                        if (!requeteDonnees.ok) {
                            throw new Response("Impossible de charger l'interface administration", {
                                status: 500,
                            });
                        }
                        const reponse = await requeteDonnees.json();
                        return reponse.detail;
                    } catch (erreur) {
                        if (erreur instanceof Response) {
                            throw erreur;
                        }

                        console.error(erreur);

                        throw new Response("Erreur serveur", {
                            status: 500,
                        });
                    }
                },
            },
            {
                path: "/interface-administration",
                element: <InterfaceAdministration />,
                loader: async () => {
                    try {
                        await verifAdmin();

                        const requeteDonnees = await fetch("/admins/scenarios/configuration-complete", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                        });

                        if (!requeteDonnees.ok) {
                            throw new Response("Impossible de charger l'interface administration", {
                                status: 500,
                            });
                        }

                        const reponseDonnees = await requeteDonnees.json();

                        if (!reponseDonnees.etat) {
                            throw new Response("Impossible de charger l'interface administration", {
                                status: 500,
                            });
                        }

                        return reponseDonnees.detail;
                    } catch (erreur) {
                        if (erreur instanceof Response) {
                            throw erreur;
                        }

                        console.error(erreur);

                        throw new Response("Erreur serveur", {
                            status: 500,
                        });
                    }
                },
            },
            {
                path: "/suivi-partie",
                element: <SuiviPartie />,
                loader: async () => {
                    try {
                        await verifAdmin();

                        const requeteParties = await fetch("/admins/parties/partie-en-cours", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                        });

                        if (!requeteParties.ok) {
                            throw new Response("Impossible de charger l'interface de suivie de partie", {
                                status: 500,
                            });
                        }

                        const reponsePartie = await requeteParties.json();
                        if (!reponsePartie.etat) {
                            throw new Response("Impossible de charger l'interface de suivie de partie", {
                                status: 500,
                            });
                        }
                        const donnees = reponsePartie.detail.details;
                        if (reponsePartie.detail.partieEnCours) {
                            return { partieEnCours: false, detailsPartie: donnees.detailsPartie, deroule: donnees.derouleScenario };
                        } else {
                            return { partieEnCours: false, equipes: donnees.equipes, scenarios: donnees.scenarios };
                        }
                    } catch (erreur) {
                        if (erreur instanceof Response) {
                            throw erreur;
                        }

                        console.error(erreur);

                        throw new Response("Erreur serveur", {
                            status: 500,
                        });
                    }
                },
            },
            {
                path: "/mon-compte",
                element: <Compte />,
                loader: async () => {
                    try {
                        await verifUtilisateur();

                        const requeteDonnees = await fetch("/utilisateurs/mon-compte", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                        });

                        if (!requeteDonnees.ok) {
                            throw new Response("Impossible de charger l'interface administration", {
                                status: 500,
                            });
                        }
                        const reponse = await requeteDonnees.json();
                        return reponse.detail;
                    } catch (erreur) {
                        if (erreur instanceof Response) {
                            throw erreur;
                        }

                        console.error(erreur);

                        throw new Response("Erreur serveur", {
                            status: 500,
                        });
                    }
                },
            },
            {
                path: "/changement-mail",
                element: <ChangementMail />,
            },
            {
                path: "*",
                element: <ErreurRoute />,
            },
        ],
    },
]);

export default function App() {
    return (
        <ResponsiveProvider>
            <ErreurProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </ErreurProvider>
        </ResponsiveProvider>
    );
}
