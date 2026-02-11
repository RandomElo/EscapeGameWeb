import { useEffect, useRef, useState } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { EllipsisVertical, Play, Square, Trash2 } from "lucide-react";
export default function InterfaceAdministration() {
    const { estAuth } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"ajouterMission" | "genererAudio" | "ajouterScenario" | "supprimerAudio" | "menuScenario" | "modifierNomScenario" | "modifierDescriptionScenario" | "supprimerScenario">();
    const [detailsModal, setDetailsModal] = useState<string>();

    const [erreur, setErreur] = useState<string>();
    // const [scenarios, setScenarios] = useState<>()
    const [missions, setMissions] = useState<{ id: number; nom: string; description: string; ipAdresse: string; formatReponse: string }[]>();
    const [scenarios, setScenarios] = useState<{ id: number; nom: string; description: string }[]>();
    const [tableauIP, setTableauIP] = useState<string[]>();
    const [messagesAudio, setMessagesAudio] = useState<{ nomFichier: string; detail: string }[]>();

    const [idAudioEnCours, setIdAudioEnCours] = useState<number | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    async function recuperationDonnees(reponse) {
        setScenarios(reponse.scenarios);
        setMissions(reponse.missions);
        setMessagesAudio(reponse.messagesAudio);

        // recuperation ip missions
        const tableauIP: string[] = [];
        for (const mission of reponse.missions) {
            if (!tableauIP.includes(mission.ipAdresse)) {
                tableauIP.push(mission.ipAdresse);
            }
        }
        console.log(tableauIP);
        setTableauIP(tableauIP);
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
                    <h2>Les missions</h2>
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("ajouterMission");
                            setAfficherModal(true);
                        }}
                    >
                        Ajouter une mission
                    </button>
                    <table>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Description</th>
                                <th>Adresse IP</th>
                                <th>Réponse</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions?.map((mission) => (
                                <tr>
                                    <td className="tdNom">{mission.nom}</td>
                                    <td className="tdDescription">{mission.description}</td>
                                    <td className="tdIpAdresse">{mission.ipAdresse}</td>
                                    <td className="tdReponse">{mission.formatReponse}</td>
                                    <td className="tdAction">
                                        <EllipsisVertical />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div id="divScenarios">
                    <h2>Les scénarios</h2>
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("ajouterScenario");
                            setAfficherModal(true);
                        }}
                    >
                        Ajouter scénario
                    </button>
                    <table>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Description</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {scenarios?.map((scenario) => (
                                <tr>
                                    <td className="tdNom">{scenario.nom}</td>
                                    <td className="tdDescription">{scenario.description}</td>
                                    <td
                                        className="tdAction"
                                        onClick={() => {
                                            setDetailsModal(scenario.id.toString());
                                            setContenuModal("menuScenario");
                                            setAfficherModal(true);
                                        }}
                                    >
                                        <EllipsisVertical />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div id="divMessagesAudio">
                    <h2>Les audios</h2>
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
                        <thead>
                            <tr>
                                <th>Texte de l'audio</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {messagesAudio?.map((audio, key) => (
                                <tr key={key}>
                                    <td className="tdTexte">{audio.detail}</td>
                                    <td
                                        className={`tdAction ${idAudioEnCours == key ? "tdStop" : "tdPlay"}`}
                                        onClick={async () => {
                                            if (idAudioEnCours == key && audioRef.current) {
                                                audioRef.current.pause();
                                                audioRef.current.currentTime = 0;
                                                setIdAudioEnCours(null);
                                                return;
                                            }

                                            if (audioRef.current) {
                                                audioRef.current.pause();
                                                audioRef.current.currentTime = 0;
                                            }

                                            setIdAudioEnCours(key);
                                            const reponse = await requete({ url: "/admins/audios/recuperation-lien", methode: "POST", corps: { nomFichier: audio.nomFichier } });

                                            const elementAudio = new Audio(reponse);
                                            audioRef.current = elementAudio;
                                            elementAudio.play();

                                            elementAudio.addEventListener("ended", () => {
                                                setIdAudioEnCours(null);
                                            });
                                        }}
                                    >
                                        {idAudioEnCours == key ? <Square /> : <Play />}
                                    </td>
                                    <td
                                        className="tdAction tdPoubelle"
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

                {/* Gestion des scénario */}

                {contenuModal == "menuScenario" && (
                    <div id="divModalMenuScenario">
                        <h2>Menu scénario</h2>
                        <div id="divOptions">
                            <a className="bouton" onClick={() => setContenuModal("modifierNomScenario")}>
                                Modifier le nom
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("modifierDescriptionScenario")}>
                                Modifier la description
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("supprimerScenario")}>
                                Supprimer le scénario
                            </a>
                        </div>
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
                {contenuModal == "modifierNomScenario" && (
                    <div id="divModalModifierNomScenario">
                        <h2>Modifier le nom du scénario</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const nom = document.querySelector<HTMLInputElement>("#inputNom")!.value;

                                const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/modification-nom`, methode: "PATCH", corps: { nom } });

                                recuperationDonnees(reponse);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" typeInput="text" placeholder="Nouveau nom" focus={true} />

                            <button type="submit" className="bouton">
                                Modifier
                            </button>
                        </form>
                    </div>
                )}
                {contenuModal == "modifierDescriptionScenario" && (
                    <div id="divModalModifierDescriptionScenario">
                        <h2>Modifier la description du scénario</h2>
                    </div>
                )}
                {/* {contenuModal == "" && <div id="divModal"></div>} */}
            </Modal>
        </>
    );
}
