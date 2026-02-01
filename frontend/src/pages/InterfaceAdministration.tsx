import { useState } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
export default function InterfaceAdministration() {
    const requete = useRequete();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"ajouterMission">();
    // const [scenarios, setScenarios] = useState<>()
    // const [missions, setMission] = useState<>()
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
                                const adresseIp = document.querySelector<HTMLInputElement>("#inputAdresseIp")!.value;
                                
                                const reponse = await requete({ url: "/admins/missions/creation", methode: "POST", corps: { nom, description, adresseIp } });
                            }}
                        >
                            <ChampDonneesForm id="inputNom" typeInput="text" placeholder="Mission 1" label="Nom :" />
                            <ChampDonneesForm id="inputDescription" typeInput="textearea" label="Description :" />
                            <ChampDonneesForm id="inputAdresseIp" typeInput="text" placeholder="192.168.1.12" label="Adresse IP :" />

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
