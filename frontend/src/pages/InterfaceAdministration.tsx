import { useEffect, useState } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Play, Trash2 } from "lucide-react";
export default function InterfaceAdministration() {
    const { estAuth } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"ajouterMission" | "genererAudio" | "ajouterScenario" | "supprimerAudio">();
    const [detailsModal, setDetailsModal] = useState<string>();

    const [erreur, setErreur] = useState<string>();
    // const [scenarios, setScenarios] = useState<>()
    const [missions, setMissions] = useState<{ id: number; nom: string; description: string; idAdresse: string }[]>();
    const [scenarios, setScenarios] = useState<{ id: number; nom: string; description: string }[]>();
    const [tableauIP, setTableauIP] = useState<string[]>();
    const [messagesAudio, setMessagesAudio] = useState<{ nomFichier: string; detail: string }[]>();

    async function recuperationDonnees(reponse) {
        setScenarios(reponse.scenarios);
        setMissions(reponse.missions);
        setMessagesAudio(reponse.messagesAudio);
    }

    useEffect(() => {
        if (!estAuth) {
            navigation("/connexion");
        } else {
            async function recuperation() {
                const reponse = await requete({ url: "/admins/scenarios/configuration-complete" });

                recuperationDonnees(reponse);
            }
            recuperation();
        }
    }, [estAuth, navigation]);

    return (
        <>
            <main className="InterfaceAdministration">
                <h1 id="titre">Interface d'administration</h1>
                {/* Pour les pings */}
                <div id="divCommunicationMissions">
                    {tableauIP?.map((ip) => (
                        <div className="divVerificationCommunication">
                            <p id="pEtat">Connecté</p>
                            <p id="pIP">{ip}</p>
                        </div>
                    ))}
                </div>
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
                <div id="divScenarios">
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("ajouterScenario");
                            setAfficherModal(true);
                        }}
                    >
                        Ajouter scénario
                    </button>
                </div>
                <div id="divMessagesAudio">
                    <h1>Les audios</h1>
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("genererAudio");
                            setAfficherModal(true);
                        }}
                    >
                        Générer audio
                    </button>
                    <table>
                        <tbody>
                            {messagesAudio?.map((audio, key) => (
                                <tr key={key}>
                                    <td>{audio.nomFichier}</td>
                                    <td
                                        onClick={async () => {
                                            const reponse = await requete({ url: "/admins/audios/recuperation-lien", methode: "POST", corps: { nomFichier: audio.nomFichier } });

                                            const elementAudio = new Audio(reponse);
                                            elementAudio.play();
                                        }}
                                    >
                                        <Play />
                                    </td>
                                    <td
                                        onClick={() => {
                                            setDetailsModal(audio.nomFichier);
                                            setContenuModal("supprimerAudio");
                                            setAfficherModal(true);
                                        }}
                                    >
                                        <Trash2 />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                                console.log(reponse);
                                recuperationDonnees(reponse);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" typeInput="text" placeholder="Mission 1" label="Nom :" focus={true} />
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
                {contenuModal == "ajouterScenario" && (
                    <div id="divModalAjouterScenario">
                        <h1>Ajouter scénario</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const nom = document.querySelector<HTMLInputElement>("#inputNom")!.value;
                                const description = document.querySelector<HTMLInputElement>("#inputDescription")!.value;

                                const reponse = await requete({ url: "/admins/scenarios/creation", methode: "POST", corps: { nom, description } });
                                recuperationDonnees(reponse);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" label="Nom :" typeInput="text" placeholder="Scénario alarme" focus={true} />
                            <ChampDonneesForm id="inputDescription" label="Description :" typeInput="textearea" />
                            <button type="submit" className="bouton">
                                Ajouter
                            </button>
                        </form>
                    </div>
                )}
                {contenuModal == "genererAudio" && (
                    <div id="divModalGenererAudio">
                        <h1>Génération de l'audio</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const texte = document.querySelector<HTMLInputElement>("#inputTexte")!.value;

                                const missionId = document.querySelector<HTMLInputElement>("#selectMission")!.value;

                                const scenarioId = document.querySelector<HTMLInputElement>("#selectScenario")!.value;

                                const reponse = await requete({ url: "/admins/audios/generation", methode: "POST", corps: { texte, missionId, scenarioId } });
                                recuperationDonnees(reponse);
                            }}
                        >
                            <ChampDonneesForm id="inputTexte" label="Texte à générer :" typeInput="textearea" focus={true} />

                            <label htmlFor="selectMission">Mission :</label>
                            <select id="selectMission" required>
                                <option value="" selected disabled>
                                    --- Sélectionnez une mission ---
                                </option>
                                {missions?.map((mission, key) => (
                                    <option value={mission.id} key={key}>
                                        {mission.nom}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="selectScenario">Scénario :</label>
                            <select id="selectScenario" required>
                                <option value="" selected disabled>
                                    --- Sélectionnez un scénario ---
                                </option>
                                {scenarios?.map((scenarios, key) => (
                                    <option value={scenarios.id} key={key}>
                                        {scenarios.nom}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="bouton">
                                Envoyer
                            </button>
                        </form>
                    </div>
                )}
                {contenuModal == "supprimerAudio" && (
                    <div id="divModalSupprimerAudio">
                        <h1>Supprimer audio</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const reponse = await requete({ url: "/admins/audios/suppression", methode: "DELETE", corps: { nomFichier: detailsModal } });

                                recuperationDonnees(reponse);
                            }}
                        >
                            <p>Êtes-vous sur de vouloir supprimer l'audio ?</p>
                            <div id="divBoutons">
                                <button className="bouton" onClick={() => setAfficherModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="bouton supprimer">
                                    Supprimer
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </>
    );
}
