import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { EllipsisVertical, GripVertical, Pencil, Play, Square, Trash2 } from "lucide-react";
import RetourArriere from "../composants/RetourArriere";
import Chargement from "../composants/Chargement";
import GererDerouler from "../composants/interfaceAdministration/GererDerouler";

type Mission = {
    id: number;
    nom: string;
    description: string;
    topicMQTT: string;
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
    quizAudio: QuizAudio[];
    devinettes: Devinette[];
};

type QuizAudio = {
    question: string;
    type: "clavier" | "bouton";
    reponse: string;
    difficulte: "facile" | "difficile";
    nomFichier: string;
};

type Devinette = {
    devinette: string;
    reponse: string;
    nomFichier: string;
};

export type ContenuModal = "ajouterMission" | "genererAudio" | "ajouterScenario" | "supprimerAudio" | "menuScenario" | "gererDeroulerScenario" | "modifierNomScenario" | "modifierDescriptionScenario" | "supprimerScenario" | "menuMission" | "supprimerMission" | "modifierNomMission" | "modifierDescriptionMission" | "ajouterMissionScenario" | "genererAudioQuiz" | "ajouterAudioScenario" | "ajouterAudiosAideScenario" | "audiosAideScenario" | "generationDevinettes" | "ajoutDiapo" | "gestionAudios" | "gestionQuizAudios" | "gestionDevinettes";

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
    const [fichier, setFichier] = useState<File>();

    const [quizAudio, setQuizAudio] = useState<QuizAudio[]>();
    const [devinettes, setDevinettes] = useState<Devinette[]>();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    async function recuperationDonnees(reponse: RecuperationDonnees) {
        console.log(reponse);
        setScenarios(reponse.scenarios);
        setMissions(reponse.missions);
        setMessagesAudio(reponse.messagesAudio);
        setQuizAudio(reponse.quizAudio);
        setDevinettes(reponse.devinettes);
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
                                <th>Topic MQTT</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions?.map((mission, key) => (
                                <tr key={key}>
                                    <td className="tdNom">{mission.nom}</td>
                                    <td className="tdDescription">{mission.description}</td>
                                    <td className="tdTopic">{mission.topicMQTT}</td>
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

                <div id="divDevinettes">
                    <h2>Génération devinettes</h2>
                    <button
                        className="bouton"
                        onClick={() => {
                            setDetailsModal("");
                            setContenuModal("generationDevinettes");
                            setAfficherModal(true);
                        }}
                    >
                        Générer des devinettes
                    </button>
                </div>

                <div id="divPhotosDiapo">
                    <h2>Gestion diaporama</h2>
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("ajoutDiapo");
                            setAfficherModal(true);
                        }}
                    >
                        Ajouter un diaporama
                    </button>
                </div>
            </main>
            <div className="InterfaceAdministration">
                <div className="entetePage">
                    <div>
                        <h1 className="titrePage">Administration</h1>
                        <p className="sousTitrePage">Configuration · Missions · Scénarios · Outils</p>
                    </div>
                </div>

                <div className="grilleTableaux">
                    <div className="carteInterface coinsHud">
                        <div className="enteteCarte">
                            <span className="titreCarte">Missions</span>
                            <div className="detailsCarte">
                                <span className="compteurBadge">
                                    {missions ? missions?.length : "0"} mission{missions && missions?.length > 1 && "s"}
                                </span>
                                <button
                                    className="boutonAction"
                                    onClick={() => {
                                        setContenuModal("ajouterMission");
                                        setAfficherModal(true);
                                    }}
                                >
                                    + Ajouter
                                </button>
                            </div>
                        </div>
                        <table className="tableau">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Description</th>
                                    <th>Topic MQTT</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {missions?.map((mission, key) => (
                                    <tr key={key}>
                                        <td className="tdNom">{mission.nom}</td>
                                        <td className="tdDescription">{mission.description}</td>
                                        <td className="tdTopic">escape/mission/{mission.topicMQTT}</td>
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

                    <div className="carteInterface coinsHud">
                        <div className="enteteCarte">
                            <span className="titreCarte">Scénarios</span>
                            <div className="detailsCarte">
                                <span className="compteurBadge">
                                    {scenarios.length} scénario{scenarios.length > 1 && "s"}
                                </span>
                                <button
                                    className="boutonAction"
                                    onClick={() => {
                                        setContenuModal("ajouterScenario");
                                        setAfficherModal(true);
                                    }}
                                >
                                    + Ajouter
                                </button>
                            </div>
                        </div>
                        <table className="tableau">
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
                </div>

                <p className="titreSectionOutils">Outils de configuration</p>
                <div className="grilleOutils">
                    <div className="carteOutil coinsHud">
                        <div className="iconeOutil">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M9 18V5l12-2v13" />
                                <circle cx="6" cy="18" r="3" />
                                <circle cx="18" cy="16" r="3" />
                            </svg>
                        </div>
                        <span className="nomOutil">Audios</span>
                        <span className="descriptionOutil">Messages audio générés localement.</span>
                        <div className="piedCarte">
                            <span className="compteurOutil">
                                {messagesAudio ? messagesAudio?.length : "0"} fichier{messagesAudio && messagesAudio?.length > 1 && "s"}
                            </span>

                            <button
                                className="boutonAction"
                                onClick={() => {
                                    setContenuModal("gestionAudios");
                                    setAfficherModal(true);
                                }}
                            >
                                Gérer
                            </button>
                        </div>
                    </div>

                    <div className="carteOutil coinsHud">
                        <div className="iconeOutil">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <span className="nomOutil">Quiz</span>
                        <span className="descriptionOutil">Audios pour la boîte à quiz.</span>
                        <div className="piedCarte">
                            <span className="compteurOutil donneeDemoMuted">
                                {quizAudio ? quizAudio?.length : "0"} fichier{quizAudio && quizAudio?.length > 1 && "s"}
                            </span>
                            <button
                                className="boutonAction"
                                onClick={() => {
                                    setContenuModal("gestionQuizAudios");
                                    setAfficherModal(true);
                                }}
                            >
                                Gérer
                            </button>
                        </div>
                    </div>

                    <div className="carteOutil coinsHud">
                        <div className="iconeOutil">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="nomOutil">Devinettes</span>
                        <span className="descriptionOutil">Génération automatique des énigmes texte.</span>
                        <div className="piedCarte">
                            <span className="compteurOutil donneeDemoMuted">— générées</span>
                            <button
                                className="boutonAction"
                                onClick={() => {
                                    setContenuModal("gestionDevinettes");
                                    setAfficherModal(true);
                                }}
                            >
                                Gérer
                            </button>
                        </div>
                    </div>

                    <div className="carteOutil coinsHud">
                        <div className="iconeOutil">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="2" y="3" width="20" height="14" rx="2" />
                                <path d="M8 21h8M12 17v4" />
                            </svg>
                        </div>
                        <span className="nomOutil">Diaporama</span>
                        <span className="descriptionOutil">Photos et slides affichés en salle pendant la partie.</span>
                        <div className="piedCarte">
                            <span className="compteurOutil donneeDemoMuted">— slides</span>
                            <button className="boutonAction">Gérer</button>
                        </div>
                    </div>
                </div>
            </div>
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
                                const topicMQTT = document.querySelector<HTMLInputElement>("#inputTopic")!.value;

                                const reponse = await requete({ url: "/admins/missions/creation", methode: "POST", corps: { nom, description, topicMQTT } });
                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="inputNom" typeInput="text" placeholder="Mission 1" label="Nom :" focus={true} />
                            <ChampDonneesForm id="inputDescription" typeInput="textearea" label="Description :" />
                            <ChampDonneesForm id="inputTopic" typeInput="text" label="Topic MQTT :" placeholder="1" />

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
                                const type = document.querySelector<HTMLInputElement>("#selectType")!.value;
                                console.log({ valeur, type });
                                await requete({ url: "/admins/audios/generation-quiz", methode: "POST", corps: { valeur, type } });
                                setTimeout(() => {
                                    document.querySelector<HTMLInputElement>("#inputTexte")!.value = "";
                                    document.querySelector<HTMLInputElement>("#selectType")!.value = "";
                                    setChargementRequete(false);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="inputTexte" label="Texte :" typeInput="textearea" />

                            <select id="selectType" required>
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

                {contenuModal == "generationDevinettes" && (
                    <div id="divModalGenerationDevinettes">
                        <h2>Génération devinettes</h2>
                        {detailsModal ? (
                            <p id="pResultatsGeneration">Résultats génération : {detailsModal}</p>
                        ) : (
                            <>
                                <p id="pFormat">⚠️ Format : Devinette;Réponse</p>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        setChargementRequete(true);

                                        const devinettes = document.querySelector<HTMLInputElement>("#inputDevinettes")!.value;
                                        const reponse = await requete({ url: "/admins/audios/generation-devinette", methode: "POST", corps: { devinettes } });

                                        setTimeout(() => {
                                            setDetailsModal(`${reponse.succes} succès et ${reponse.erreurs.length} erreurs`);
                                            setChargementRequete(false);

                                            setTimeout(() => {
                                                setAfficherModal(false);
                                            }, 2000);
                                        }, 1000);
                                    }}
                                >
                                    <ChampDonneesForm id="inputDevinettes" typeInput="textearea" label="Devinettes à générer :" />

                                    <button type="submit" className="bouton" disabled={chargementRequete}>
                                        {chargementRequete ? <Chargement variant="button" /> : "Générer"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}

                {contenuModal == "ajoutDiapo" && (
                    <div id="divAjoutDiapo">
                        <h2>Enregistrement d'un diaporama</h2>
                        <p id="pDetail">Il faut envoyer un fichier .zip qui contient uniquement des fichiers .png numéroté à partir de 1.</p>
                        <p>Le nom du fichier .zip sera le nom du diapo.</p>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData();
                                formData.append("zip", fichier!);

                                const reponse = await requete({ url: "/admins/missions/enregistrement-diapo", methode: "POST", corps: formData, formData: true });
                            }}
                        >
                            <input
                                type="file"
                                accept=".zip"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setFichier(e.target.files[0]);
                                    }
                                }}
                                required
                            />

                            <button type="submit" className="bouton">
                                Envoyer
                            </button>
                        </form>
                    </div>
                )}
            </Modal>

            {contenuModal == "gererDeroulerScenario" && detailsModal && missions && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} taille={500}>
                    <GererDerouler scenario={scenarios.filter((scenario) => scenario.id == Number(detailsModal))[0]} setContenuModal={setContenuModal} setDetails2Modal={setDetails2Modal} setAfficherModal={setAfficherModal} recuperationDonnees={recuperationDonnees} />
                </Modal>
            )}

            {contenuModal == "gestionAudios" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Les audios">
                    <div id="divModalGestionAudios">
                        <table className="tableau">
                            <thead>
                                <tr>
                                    <th>Texte de l'audio</th>
                                    <th colSpan={2} className="thActions">
                                        Actions
                                    </th>
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
                                            {idAudioEnCours == key ? <Square size={18} /> : <Play size={18} />}
                                        </td>
                                        <td
                                            className="tdAction tdPoubelle"
                                            onClick={() => {
                                                setDetailsModal(audio.nomFichier);
                                                setContenuModal("supprimerAudio");
                                                setAfficherModal(true);
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}

            {contenuModal == "gestionQuizAudios" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Les audios du quiz" taille={800}>
                    <div id="divModalGestionQuizAudios">
                        <table className="tableau">
                            <thead>
                                <tr>
                                    <th>Texte de l'audio</th>
                                    <th>Type</th>
                                    <th>Réponse</th>
                                    <th colSpan={3} className="thActions">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizAudio?.map((audio, key) => (
                                    <tr key={key}>
                                        <td className="tdTexte">{audio.question}</td>
                                        <td>{audio.type.charAt(0).toUpperCase() + audio.type.slice(1)}</td>
                                        <td className="tdReponse">{audio.reponse == "true" || audio.reponse == "false" ? (audio.reponse == "true" ? "Vrai" : "Faux") : audio.reponse}</td>
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
                                            {idAudioEnCours == key ? <Square size={18} /> : <Play size={18} />}
                                        </td>
                                        <td className="tdAction tdModfier">
                                            <Pencil size={18} />
                                        </td>
                                        <td
                                            className="tdAction tdPoubelle"
                                            onClick={() => {
                                                setDetailsModal(audio.nomFichier);
                                                setContenuModal("supprimerAudio");
                                                setAfficherModal(true);
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
            {contenuModal == "gestionDevinettes" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Les devinettes" taille={700}>
                    <div id="divModalGestionDevinette">
                        <table className="tableau">
                            <thead>
                                <tr>
                                    <th>Texte de l'audio</th>
                                    <th>Réponse</th>
                                    <th colSpan={3} className="thActions">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {devinettes?.map((audio, key) => (
                                    <tr key={key}>
                                        <td className="tdTexte">{audio.devinette}</td>
                                        <td className="tdReponse">{audio.reponse}</td>
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
                                            {idAudioEnCours == key ? <Square size={18} /> : <Play size={18} />}
                                        </td>
                                        <td className="tdAction tdModfier">
                                            <Pencil size={18} />
                                        </td>
                                        <td
                                            className="tdAction tdPoubelle"
                                            onClick={() => {
                                                setDetailsModal(audio.nomFichier);
                                                setContenuModal("supprimerAudio");
                                                setAfficherModal(true);
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
        </>
    );
}
