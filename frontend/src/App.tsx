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
