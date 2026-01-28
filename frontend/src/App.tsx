import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErreurRoute from "./pages/ErreurRoute";
import ErreurElement from "./pages/ErreurElement";
import Accueil from "./pages/Accueil";
import Generale from "./composants/Generale";
import { ErreurProvider } from "./contexts/ErreurContext";
import { AuthProvider } from "./contexts/AuthContext";
import Identification from "./pages/Identification";
import "./styles/Generale.css";
import Equipe from "./pages/Equipe";

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
                path: "*",
                element: <ErreurRoute />,
            },
        ],
    },
]);

export default function App() {
    return (
        <ErreurProvider>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </ErreurProvider>
    );
}
