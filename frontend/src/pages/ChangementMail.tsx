import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useRequete } from "../fonctions/requete";

import "../styles/ChangementMail.css";

import Chargement from "../composants/Chargement";

export default function ChangementMail() {
    const [searchParams] = useSearchParams();
    const requete = useRequete();
    const navigation = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        async function envoiBdd() {
            await requete({ url: "/utilisateurs/token-changement-mail", methode: "PUT", corps: { token } });

            setTimeout(() => {
                navigation("/mon-compte");
            }, 3000);
        }
        envoiBdd();
    }, [token]);

    return (
        <main className="ChangementMail">
            <Chargement variant="page" />
        </main>
    );
}
