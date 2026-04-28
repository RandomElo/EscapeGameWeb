import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { EllipsisVertical, GripVertical, Play, Square, Trash2 } from "lucide-react";
import RetourArriere from "../composants/RetourArriere";
import Chargement from "../composants/Chargement";
import GererDerouler from "../composants/interfaceAdministration/GererDerouler";

type Mission = {
    id: number;
    nom: string;
    description: string;
    ipAdresse: string;
    configuration: string;
};

type MissionScenario = {
    scenarioId: number;
    ordre: number;
    configuration: string;
};

type MissionComplete = Mission & {
    scenarios: MissionScenario[];
};

export type DerouleItem = {
    ordre: number;
    type: "mission" | "audio";
    configuration: string;
    mission?: Mission;
    fichierId?: number;
    fichierDetail?: string;
    audiosAide?: { nomFichier: string; detail: string }[];
};

type Scenario = {
    id: number;
    nom: string;
    description: string;
    deroule: DerouleItem[];
};

type MessageAudio = {
    id: number;
    nomFichier: string;
    detail: string;
};

export type RecuperationDonnees = {
    missions: MissionComplete[];
    scenarios: Scenario[];
    messagesAudio: MessageAudio[];
};

export type ContenuModal = "ajouterMission" | "genererAudio" | "ajouterScenario" | "supprimerAudio" | "menuScenario" | "gererDeroulerScenario" | "modifierNomScenario" | "modifierDescriptionScenario" | "supprimerScenario" | "menuMission" | "supprimerMission" | "modifierNomMission" | "modifierDescriptionMission" | "ajouterMissionScenario" | "genererAudioQuiz" | "ajouterAudioScenario" | "ajouterAudiosAideScenario" | "audiosAideScenario";

export default function InterfaceAdministration() {
    const { estAuth, chargement } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();
    const donneesLoader = useLoaderData();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<ContenuModal>();
    const [detailsModal, setDetailsModal] = useState<string>();
    const [details2Modal, setDetails2Modal] = useState<number[]>([]);

    const [erreur, setErreur] = useState<string>();

    const [missions, setMissions] = useState<MissionComplete[]>();

    const [scenarios, setScenarios] = useState<Scenario[]>([]);

    const [messagesAudio, setMessagesAudio] = useState<MessageAudio[]>();

    const [idAudioEnCours, setIdAudioEnCours] = useState<number | null>(null);
    const [chargementRequete, setChargementRequete] = useState<boolean>(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    async function recuperationDonnees(reponse: RecuperationDonnees) {
        console.log(reponse);
        setScenarios(reponse.scenarios);
        setMissions(reponse.missions);
        setMessagesAudio(reponse.messagesAudio);
    }

    useEffect(() => {
        if (!chargement && !estAuth) {
            navigation("/connexion");
        } else {
            function appelFonction() {
                console.log(donneesLoader);
                recuperationDonnees(donneesLoader);
            }
            appelFonction();
        }
    }, [estAuth, navigation, chargement]);

    return (
        <>
            <main className="InterfaceAdministration">
                <h1 id="titre">Interface d'administration</h1>

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
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions?.map((mission, key) => (
                                <tr key={key}>
                                    <td className="tdNom">{mission.nom}</td>
                                    <td className="tdDescription">{mission.description}</td>
                                    <td
                                        className="tdAction"
                                        onClick={() => {
                                            setDetailsModal(mission.id.toString());
                                            setContenuModal("menuMission");
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
                            {scenarios?.map((scenario, key) => (
                                <tr key={key}>
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

                <div id="divMessagesQuiz">
                    <h2>Audios boîtes à quiz</h2>
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("genererAudioQuiz");
                            setAfficherModal(true);
                        }}
                    >
                        Générer des audios
                    </button>
                </div>
            </main>
            <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)}>
                {contenuModal == "ajouterMission" && (
                    <div id="modalAjouterMission">
                        <h1>Ajouter une mission</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const nom = document.querySelector<HTMLInputElement>("#inputNom")!.value;
                                const description = document.querySelector<HTMLInputElement>("#inputDescription")!.value;

                                const reponse = await requete({ url: "/admins/missions/creation", methode: "POST", corps: { nom, description } });
                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    // setAfficherModal(false);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" typeInput="text" placeholder="Mission 1" label="Nom :" focus={true} />
                            <ChampDonneesForm id="inputDescription" typeInput="textearea" label="Description :" />

                            {erreur && <p id="pErreur">{erreur}</p>}

                            <button type="submit" className="bouton">
                                {chargementRequete ? <Chargement variant="button" /> : "Ajouter"}
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
                                setChargementRequete(true);

                                const texte = document.querySelector<HTMLInputElement>("#inputTexte")!.value;

                                const missionId = document.querySelector<HTMLInputElement>("#selectMission")!.value;

                                const scenarioId = document.querySelector<HTMLInputElement>("#selectScenario")!.value;

                                const reponse = await requete({ url: "/admins/audios/generation", methode: "POST", corps: { texte, missionId, scenarioId } });
                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);
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
                                {chargementRequete ? <Chargement variant="button" /> : "Envoyer"}
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
                                setChargementRequete(true);

                                const reponse = await requete({ url: "/admins/audios/suppression", methode: "DELETE", corps: { nomFichier: detailsModal } });

                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);
                            }}
                        >
                            <p>Êtes-vous sur de vouloir supprimer l'audio ?</p>
                            <div id="divBoutons">
                                <button className="bouton" onClick={() => setAfficherModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="bouton supprimer">
                                    {chargementRequete ? <Chargement variant="button" /> : "Supprimer"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {contenuModal == "genererAudioQuiz" && (
                    <div id="divModalGenererAudioQuiz">
                        <h2>Générer audios quiz</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const valeur = document.querySelector<HTMLInputElement>("#inputTexte")!.value;
                                const type = document.querySelector<HTMLInputElement>("#selectScenario")!.value;
                                console.log({ valeur, type });
                                await requete({ url: "/admins/audios/generation-quiz", methode: "POST", corps: { valeur, type } });
                                setTimeout(() => {
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);

                                setAfficherModal(false);
                            }}
                        >
                            <ChampDonneesForm id="inputTexte" label="Texte :" typeInput="textearea" />

                            <select id="selectScenario" required>
                                <option value="" selected disabled>
                                    --- Sélectionnez un type ---
                                </option>
                                <option value="bonneReponse">Bonne réponse</option>
                                <option value="mauvaiseReponse">Mauvaise réponse</option>
                                <option value="serieErreurs">Série de 7 erreurs</option>
                                <option value="finQuiz">Quiz réussi</option>
                                <option value="questionsJSON">Questions JSON</option>
                            </select>

                            <button className="bouton">{chargementRequete ? <Chargement variant="button" /> : "Générer"}</button>
                        </form>
                    </div>
                )}
                {/* Gestion des scénario */}

                {contenuModal == "menuScenario" && (
                    <div id="divModalMenuScenario">
                        <h2>Menu scénario</h2>
                        <div id="divOptions">
                            <a className="bouton" onClick={() => setContenuModal("gererDeroulerScenario")}>
                                Gérer le dérouler (missions + audios)
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("audiosAideScenario")}>
                                Audios d'aide
                            </a>
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
                                setChargementRequete(true);

                                const nom = document.querySelector<HTMLInputElement>("#inputNom")!.value;
                                const description = document.querySelector<HTMLInputElement>("#inputDescription")!.value;

                                const reponse = await requete({ url: "/admins/scenarios/creation", methode: "POST", corps: { nom, description } });

                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 500);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" label="Nom :" typeInput="text" placeholder="Scénario alarme" focus={true} />
                            <ChampDonneesForm id="inputDescription" label="Description :" typeInput="textearea" />
                            <button type="submit" className="bouton">
                                {chargementRequete ? <Chargement variant="button" /> : "Ajouter"}
                            </button>
                        </form>
                    </div>
                )}

                {contenuModal == "ajouterMissionScenario" && (
                    <div id="divModalAjouterMissionScenario">
                        <h1>Ajouter des mission au scénario</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/ajout-mission`, methode: "POST", corps: { liste: details2Modal } });
                                console.log(reponse);
                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setContenuModal("gererDeroulerScenario");
                                }, 1000);
                            }}
                        >
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ajouter</th>
                                        <th>Nom</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {missions
                                        ?.filter((mission) => !mission.scenarios.some((scenario) => scenario.scenarioId === Number(detailsModal)))
                                        .map((mission, key) => (
                                            <tr key={key}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => {
                                                            if (!details2Modal.includes(mission.id)) {
                                                                setDetails2Modal((prev) => [...prev, mission.id]);
                                                            } else {
                                                                setDetails2Modal(details2Modal.filter((id) => id !== mission.id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td>{mission.nom}</td>
                                                <td>{mission.description}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {details2Modal.length > 0 ? (
                                <button type="submit" className="bouton">
                                    {chargementRequete ? <Chargement variant="button" /> : `Ajouter ${details2Modal.length} mission${details2Modal.length > 1 ? "s" : ""}`}
                                </button>
                            ) : (
                                <button className="bouton" disabled>
                                    Ajouter 0 mission
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {contenuModal == "ajouterAudioScenario" && (
                    <div id="divModalAjouterAudioScenario">
                        <RetourArriere clique={() => setContenuModal("gererDeroulerScenario")} />

                        <h1>Ajouter des audios au scénario</h1>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/ajout-audio`, methode: "POST", corps: { liste: details2Modal } });
                                console.log(reponse);
                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setContenuModal("gererDeroulerScenario");
                                }, 1000);
                            }}
                        >
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ajouter</th>
                                        <th>Détail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messagesAudio?.map((audio, key) => (
                                        <tr key={key}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    onChange={() => {
                                                        if (!details2Modal.includes(audio.id)) {
                                                            setDetails2Modal((prev) => [...prev, audio.id]);
                                                        } else {
                                                            setDetails2Modal(details2Modal.filter((id) => id !== audio.id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td>{audio.detail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {details2Modal.length > 0 ? (
                                <button type="submit" className="bouton">
                                    {chargementRequete ? <Chargement variant="button" /> : `Ajouter ${details2Modal.length} audio${details2Modal.length > 1 ? "s" : ""}`}
                                </button>
                            ) : (
                                <button className="bouton" disabled>
                                    Ajouter 0 audio
                                </button>
                            )}
                        </form>
                    </div>
                )}
                {contenuModal == "audiosAideScenario" && (
                    <div id="divModalAudiosAideScenario">
                        <RetourArriere clique={() => setContenuModal("menuScenario")} />

                        <h1>Audios d'aide</h1>
                        <table>
                            <tbody>
                                {scenarios
                                    .filter((scenario) => scenario.id == Number(detailsModal))[0]
                                    .deroule.filter((etape) => etape.audiosAide && etape.audiosAide.length > 0)
                                    .map((etape) => (
                                        <>
                                            <tr>
                                                <td colSpan={2} className="tdNomMission">
                                                    {etape.mission?.nom} :
                                                </td>
                                            </tr>
                                            {etape.audiosAide?.map((audio, key) => (
                                                <tr key={key}>
                                                    <td>{audio.detail}</td>
                                                    <td
                                                        onClick={async () => {
                                                            setChargementRequete(true);

                                                            const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/supprimer-audio-aide`, methode: "DELETE", corps: { nomFichier: audio.nomFichier } });

                                                            setTimeout(() => {
                                                                recuperationDonnees(reponse);
                                                                setChargementRequete(false);
                                                            }, 1000);
                                                        }}
                                                    >
                                                        {chargementRequete ? <Chargement variant="button" /> : <Trash2 />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                            </tbody>
                        </table>
                        <div id="divBouton">
                            <button className="bouton" onClick={() => setContenuModal("ajouterAudiosAideScenario")}>
                                Ajouter des audios d'aide
                            </button>
                        </div>
                    </div>
                )}
                {contenuModal == "ajouterAudiosAideScenario" && (
                    <div id="divModalAjouterAudiosAideScenario">
                        <RetourArriere clique={() => setContenuModal("audiosAideScenario")} />
                        <h1>Ajouter des audios d'aide</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const missionId = document.querySelector<HTMLInputElement>("#selectMission")!.value;
                                const checkboxes = document.querySelectorAll<HTMLInputElement>("#divAudios input[type='checkbox']:checked");
                                const fichiersSelectionnes = Array.from(checkboxes).map((checkbox) => checkbox.id);
                                console.log(fichiersSelectionnes);

                                const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/ajouter-audios-aide`, methode: "POST", corps: { fichiers: fichiersSelectionnes, missionId } });

                                // lancer la requete

                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setContenuModal("audiosAideScenario");
                                }, 1000);
                            }}
                        >
                            <div id="divAudios">
                                <table>
                                    <tbody>
                                        {messagesAudio?.map((audio, key) => (
                                            <tr className="element" key={key}>
                                                <td>
                                                    <input type="checkbox" id={audio.nomFichier} />
                                                </td>
                                                <td>
                                                    <label htmlFor={audio.nomFichier}>{audio.detail}</label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <select id="selectMission" required>
                                <option value="" selected disabled>
                                    --- Sélectionnez une mission ---
                                </option>
                                {scenarios
                                    .filter((scenario) => scenario.id == Number(detailsModal))[0]
                                    .deroule.filter((etape) => etape.type == "mission")
                                    .map((element, key) => (
                                        <option value={element.mission?.id} key={key}>
                                            {element.mission?.nom} - {element.mission?.description}
                                        </option>
                                    ))}
                            </select>
                            <button type="submit" className="bouton">
                                {chargementRequete ? <Chargement variant="button" /> : "Générer"}
                            </button>
                        </form>
                    </div>
                )}

                {(contenuModal == "modifierNomScenario" || contenuModal == "modifierNomMission") && (
                    <div id={contenuModal == "modifierNomScenario" ? "divModalModifierNomScenario" : "divModalModifierNomMission"}>
                        <RetourArriere
                            clique={() => {
                                if (contenuModal == "modifierNomScenario") {
                                    setContenuModal("menuScenario");
                                } else {
                                    setContenuModal("menuMission");
                                }
                            }}
                        />

                        <h2>Modifier le nom {contenuModal == "modifierNomScenario" ? "du scénario" : "de la mission"}</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const nom = document.querySelector<HTMLInputElement>("#inputNom")!.value;

                                const reponse = await requete({
                                    url: `/admins/${contenuModal == "modifierNomScenario" ? "scenarios" : "missions"}/${detailsModal}/modification-nom`,
                                    methode: "PATCH",
                                    corps: { nom },
                                });

                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" typeInput="text" value={contenuModal == "modifierNomScenario" ? scenarios?.filter((scenario) => scenario.id == Number(detailsModal))[0].nom : missions?.filter((scenario) => scenario.id == Number(detailsModal))[0].nom} focus={true} />

                            <button type="submit" className="bouton">
                                {chargementRequete ? <Chargement variant="button" /> : "Modifier"}
                            </button>
                        </form>
                    </div>
                )}

                {(contenuModal == "modifierDescriptionScenario" || contenuModal == "modifierDescriptionMission") && (
                    <div id={contenuModal == "modifierDescriptionScenario" ? "divModalModifierDescriptionScenario" : "divModalModifierDescriptionMission"}>
                        <RetourArriere
                            clique={() => {
                                if (contenuModal == "modifierDescriptionScenario") {
                                    setContenuModal("menuScenario");
                                } else {
                                    setContenuModal("menuMission");
                                }
                            }}
                        />

                        <h2>Modifier la description {contenuModal == "modifierDescriptionScenario" ? "du scénario" : "de la mission"}</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const description = document.querySelector<HTMLInputElement>("#inputDescription")!.value;

                                const reponse = await requete({ url: `/admins/${contenuModal == "modifierDescriptionScenario" ? "scenarios" : "missions"}/${detailsModal}/modification-description`, methode: "PATCH", corps: { description } });

                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);

                                setAfficherModal(false);
                            }}
                        >
                            <ChampDonneesForm id="inputDescription" typeInput="textearea" label={"Nouvelle description :"} value={contenuModal == "modifierDescriptionScenario" ? scenarios?.filter((scenario) => scenario.id == Number(detailsModal))[0].description : missions?.filter((scenario) => scenario.id == Number(detailsModal))[0].description} focus={true} />

                            <button type="submit" className="bouton">
                                {chargementRequete ? <Chargement variant="button" /> : "Modifier"}
                            </button>
                        </form>
                    </div>
                )}

                {(contenuModal == "supprimerScenario" || contenuModal == "supprimerMission") && (
                    <div id={contenuModal == "supprimerScenario" ? "divModalSupprimerScenario" : "divModalSupprimerMission"}>
                        <RetourArriere
                            clique={() => {
                                if (contenuModal == "supprimerScenario") {
                                    setContenuModal("menuScenario");
                                } else {
                                    setContenuModal("menuMission");
                                }
                            }}
                        />
                        <h2>Supprimer {contenuModal == "supprimerScenario" ? "le scénario" : "la mission"}</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                            }}
                        >
                            <p>Êtes vous sur de vouloir supprimer {contenuModal == "supprimerScenario" ? "le scénario" : "la mission"}</p>

                            <div id="divChoix">
                                <button
                                    className="bouton"
                                    onClick={() => {
                                        setAfficherModal(false);
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="bouton boutonSupprimer"
                                    onClick={async () => {
                                        setChargementRequete(true);

                                        const reponse = await requete({ url: `/admins/${contenuModal == "supprimerScenario" ? "scenarios" : "missions"}/${detailsModal}/suppression`, methode: "DELETE" });
                                        setTimeout(() => {
                                            recuperationDonnees(reponse);
                                            setChargementRequete(false);
                                            setAfficherModal(false);
                                        }, 1000);
                                    }}
                                >
                                    {chargementRequete ? <Chargement variant="button" /> : "Confirmer"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Gestion des missions */}
                {contenuModal == "menuMission" && (
                    <div id="divModalMenuMission">
                        <h2>Menu mission</h2>
                        <div id="divOptions">
                            <a className="bouton" onClick={() => setContenuModal("modifierNomMission")}>
                                Modifier nom
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("modifierDescriptionMission")}>
                                Modifier description
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("supprimerMission")}>
                                Supprimer la mission
                            </a>
                        </div>
                    </div>
                )}
            </Modal>

            {contenuModal == "gererDeroulerScenario" && detailsModal && missions && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} taille={500}>
                    <GererDerouler scenario={scenarios.filter((scenario) => scenario.id == Number(detailsModal))[0]} setContenuModal={setContenuModal} setDetails2Modal={setDetails2Modal} setAfficherModal={setAfficherModal} recuperationDonnees={recuperationDonnees} />
                </Modal>
            )}
        </>
    );
}
