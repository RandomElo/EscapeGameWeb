import { useEffect, useState } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export default function InterfaceAdministration() {
    const { estAuth } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"ajouterMission">();
    const [erreur, setErreur] = useState<string>();
    // const [scenarios, setScenarios] = useState<>()
    const [missions, setMissions] = useState<{ nom: string; description: string; idAdresse: string }[]>();

    useEffect(() => {
        if (!estAuth) {
            navigation("/connexion");
        } else {
            async function recuperationMissions() {
                const reponse = await requete({ url: "/admins/missions/liste" });
                setMissions(reponse);
            }
            recuperationMissions();
        }
    }, [estAuth, navigation]);

    return (
        <>
            <main className="InterfaceAdministration">
                <h1 id="titre">Interface d'administration</h1>
                {/* Pour les pings */}
                <div id="divCommunicationMissions"></div>
                <div id="divMissions">
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("ajouterMission");
                            setAfficherModal(true);
                        }}
                    >
                        Ajouter une mission
                    </button>
                </div>
                <div id="divScenarios"></div>
            </main>
            <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)}>
                {contenuModal == "ajouterMission" && (
                    <div id="modalAjouterMission">
                        <h1>Ajouter une mission</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const nom = document.querySelector<HTMLInputElement>("#inputNom")!.value;
                                const description = document.querySelector<HTMLInputElement>("#inputDescription")!.value;
                                const ipAdresse = document.querySelector<HTMLInputElement>("#inputAdresseIp")!.value;
                                const reponseInput = document.querySelector<HTMLInputElement>("#inputReponse")!.value;

                                const reponse = await requete({ url: "/admins/missions/creation", methode: "POST", corps: { nom, description, ipAdresse, reponse: reponseInput } });
                                setMissions(reponse);
                                console.log(reponse);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" typeInput="text" placeholder="Mission 1" label="Nom :" />
                            <ChampDonneesForm id="inputDescription" typeInput="textearea" label="Description :" />
                            <ChampDonneesForm
                                id="inputAdresseIp"
                                typeInput="text"
                                placeholder="192.168.1.12"
                                label="Adresse IP :"
                                onBlur={(e) => {
                                    const valeur = e.target.value.trim();
                                    const regexIP = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

                                    if (valeur && !regexIP.test(valeur)) {
                                        setErreur("Adresse IP invalide.");
                                    } else {
                                        setErreur("");
                                    }
                                }}
                            />
                            <ChampDonneesForm id="inputReponse" typeInput="textearea" label="Réponse :" />

                            {erreur && <p id="pErreur">{erreur}</p>}

                            <button type="submit" className="bouton">
                                Ajouter
                            </button>
                        </form>
                    </div>
                )}
            </Modal>
        </>
    );
}
