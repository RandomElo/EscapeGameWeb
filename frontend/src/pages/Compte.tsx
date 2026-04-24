import { useLoaderData, useNavigate } from "react-router-dom";
import "../styles/Compte.css";
import { useEffect, useState } from "react";
import { useRequete } from "../fonctions/requete";
import { useAuth } from "../contexts/AuthContext";
import Chargement from "../composants/Chargement";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { TriangleAlert } from "lucide-react";
export default function Compte() {
    const donneesLoader = useLoaderData();
    const requete = useRequete();
    const naviation = useNavigate();
    const { estAuth, chargement, deconnexion } = useAuth();

    const [donnees, setDonnees] = useState<{ nom: string; mail: string; doubleAuthentificationActive: boolean; nbrParties?: number }>();
    const [chargementRequete, setChargementRequete] = useState<boolean>(false);
    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"modifierMail">();
    const [erreur, setErreur] = useState<string>();

    // mettre en place le chargement de deconnexion + verification auth
    useEffect(() => {
        setDonnees(donneesLoader);
    }, [donneesLoader]);

    return (
        <>
            <div className="Compte">
                <h1 id="titre">Mon compte</h1>
                <div className="mesInfos">
                    <p>
                        <span className="gras">Nom : </span>
                        {donnees?.nom}
                    </p>
                    <p>
                        <span className="gras">Mail : </span>
                        {donnees?.mail}
                    </p>
                    <p>
                        <span className="gras">2FA : </span>
                        {donnees?.doubleAuthentificationActive ? "active" : "inactive"}
                    </p>

                    {donnees?.nbrParties && (
                        <p>
                            <span className="gras">Nombres de parties jouées :</span>
                            {donnees?.nbrParties}
                        </p>
                    )}
                </div>

                <div className="divActions">
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("modifierMail");
                            setAfficherModal(true);
                        }}
                    >
                        Changer d'adresse mail
                    </button>
                    <button className="bouton">Changer de mot de passe</button>
                    {!donnees?.doubleAuthentificationActive && <button className="bouton">Activer la 2FA</button>}
                    <button
                        className="bouton rouge"
                        onClick={async () => {
                            setChargementRequete(true);
                            await requete({ url: "/utilisateurs/deconnexion", methode: "DELETE" });
                            setTimeout(() => {
                                deconnexion();
                                setChargementRequete(false);
                                naviation("/connexion");
                            }, 1000);
                        }}
                    >
                        {chargementRequete ? <Chargement variant="button" /> : "Déconnexion"}
                    </button>
                </div>
            </div>
            <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)}>
                {contenuModal == "modifierMail" && (
                    <div id="divModalModifierMail">
                        <h1>Changer d'adresse mail</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);
                                const mail = document.querySelector<HTMLInputElement>("#inputMail")!.value.trim();
                                const reponse = await requete({ url: "/utilisateurs/modifier-mail", methode: "PUT", corps: { mail } });
                                console.log(reponse);
                            }}
                        >
                            <ChampDonneesForm
                                id="inputMail"
                                label="Nouvelle adresse mail :"
                                typeInput="text"
                                focus={true}
                                placeholder="exemple@gmail.com"
                                onBlur={(e) => {
                                    console.log("je suis la");
                                    const valeur = e.target.value.trim();
                                    const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                                    if (valeur && !regexMail.test(valeur)) {
                                        setErreur("Pseudo invalide.");
                                    } else {
                                        setErreur("");
                                    }
                                }}
                            />
                            {erreur && (
                                <div id="divErreurFormulaire">
                                    <TriangleAlert />
                                    <p id="pErreur">{erreur}</p>
                                </div>
                            )}
                            <button type="submit" className="bouton">
                                Enregistrer
                            </button>
                        </form>
                    </div>
                )}
            </Modal>
        </>
    );
}
