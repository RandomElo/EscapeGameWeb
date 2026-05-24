import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircleQuestionMark, CircleQuestionMarkIcon, EllipsisVertical, Eye, GripVertical, Lightbulb, Monitor, Music, Pencil, Play, Square, Trash2 } from "lucide-react";
import RetourArriere from "../composants/RetourArriere";
import Chargement from "../composants/Chargement";
import GererDerouler from "../composants/interfaceAdministration/GererDerouler";
import AfficherDiapositives from "../composants/interfaceAdministration/AfficherDiapositives";
import Select from "../composants/Select";
import Checkbox from "../composants/Checkbox";

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
    diaporamas: Diaporama[];
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

type Diaporama = {
    id: number;
    nom: string;
    images: number[];
};

export type ContenuModal = "ajouterMission" | "genererAudio" | "ajouterScenario" | "supprimerAudio" | "menuScenario" | "gererDeroulerScenario" | "modifierNomScenario" | "modifierDescriptionScenario" | "supprimerScenario" | "menuMission" | "supprimerMission" | "modifierNomMission" | "modifierDescriptionMission" | "ajouterMissionScenario" | "genererAudioQuiz" | "ajouterAudioScenario" | "ajouterAudiosAideScenario" | "audiosAideScenario" | "generationDevinettes" | "ajoutDiapo" | "gestionAudios" | "gestionQuizAudios" | "gestionDevinettes" | "gestionDiaporama" | "supprimerDiaporama" | "diaporama" | "supprimerQuiz" | "supprimerDevinette";

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
    const [diaporamas, setDiaporamas] = useState<Diaporama[]>();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    async function recuperationDonnees(reponse: RecuperationDonnees) {
        console.log(reponse);
        setScenarios(reponse.scenarios);
        setMissions(reponse.missions);
        setMessagesAudio(reponse.messagesAudio);
        setQuizAudio(reponse.quizAudio);
        setDevinettes(reponse.devinettes);
        setDiaporamas(reponse.diaporamas);
    }

    useEffect(() => {
        if (!chargement && !estAuth) {
            navigation("/connexion");
        } else {
            function appelFonction() {
                recuperationDonnees(donneesLoader);
            }
            appelFonction();
        }
    }, [estAuth, navigation, chargement]);

    return (
        <>
            <div className="InterfaceAdministration">
                <div className="entetePage">
                    <div>
                        <h1 className="titrePage">Administration</h1>
                        <p className="sousTitrePage">Configuration · Missions · Scénarios · Audios</p>
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
                            {/* En-tête */}
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Description</th>
                                    <th>Topic MQTT</th>
                                    <th></th>
                                </tr>
                            </thead>
                            {/* Corps */}
                            <tbody>
                                {missions?.map((mission, key) => (
                                    <tr key={key}>
                                        <td className="tdNom">{mission.nom}</td>
                                        <td className="tdDescription">{mission.description}</td>
                                        <td className="tdTopic">escape/mission/{mission.topicMQTT}</td>
                                        {/* Menu de configuration */}
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
                            <Music size={20} />
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
                            <CircleQuestionMark size={20} />
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
                            <Lightbulb size={20} />
                        </div>
                        <span className="nomOutil">Devinettes</span>
                        <span className="descriptionOutil">Devinettes pour la mission 4.</span>
                        <div className="piedCarte">
                            <span className="compteurOutil donneeDemoMuted">
                                {devinettes?.length ? devinettes.length : "?"} générée{devinettes && devinettes.length > 1 ? "s" : ""}
                            </span>
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
                            <Monitor size={20} />
                        </div>
                        <span className="nomOutil">Diaporamas</span>
                        <span className="descriptionOutil">Diaporamas pour la mission 1.</span>
                        <div className="piedCarte">
                            <span className="compteurOutil donneeDemoMuted">
                                {diaporamas?.length ? diaporamas.length : diaporamas?.length == 0 ? "0" : "?"} diaporama{diaporamas && diaporamas.length > 1 ? "s" : ""}
                            </span>
                            <button
                                className="boutonAction"
                                onClick={() => {
                                    setContenuModal("gestionDiaporama");
                                    setAfficherModal(true);
                                }}
                            >
                                Gérer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {contenuModal == "gererDeroulerScenario" && detailsModal && missions && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} taille={700} titre="Dérouler du scénario" retourArriere={() => setContenuModal("menuScenario")}>
                    <GererDerouler scenario={scenarios.filter((scenario) => scenario.id == Number(detailsModal))[0]} setContenuModal={setContenuModal} setDetails2Modal={setDetails2Modal} setAfficherModal={setAfficherModal} recuperationDonnees={recuperationDonnees} />
                </Modal>
            )}

            {contenuModal == "ajouterMission" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Ajouter une mission"
                    onSubmit={async (e) => {
                        e?.preventDefault();
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

                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo">
                            {chargementRequete ? <Chargement variant="button" /> : "Ajouter"}
                        </button>
                    </div>
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
                        <div id="divBoutonAjouterAudios">
                            <button
                                className="boutonAction"
                                onClick={() => {
                                    setContenuModal("genererAudio");
                                    setAfficherModal(true);
                                }}
                            >
                                Générer des audios
                            </button>
                        </div>
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
                                    <th colSpan={2} className="thActions">
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
                        <div id="divBoutonAjouterAudios">
                            <button
                                className="boutonAction"
                                onClick={() => {
                                    setContenuModal("genererAudioQuiz");
                                }}
                            >
                                Générer des audios
                            </button>
                        </div>
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
                                    <th className="tdReponse">Réponse</th>
                                    <th colSpan={2} className="thActions">
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

                    <div id="divBoutonAjouterDevinettes">
                        <button
                            className="boutonAction"
                            onClick={() => {
                                setContenuModal("generationDevinettes");
                                setDetailsModal("");
                                setAfficherModal(true);
                            }}
                        >
                            Générer des devinettes
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "gestionDiaporama" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Les diaporamas">
                    <div id="divModalAjouterDiaporama">
                        <table className="tableau">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Nombre de diapositive</th>
                                    <th colSpan={2} className="thActions">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {diaporamas?.map((diapo, key) => (
                                    <tr key={key}>
                                        <td className="tdNom">{diapo.nom}</td>
                                        <td className="tdNombreDiapositive">{diapo.images.length}</td>
                                        <td
                                            className="tdAction tdAfficherDiapo"
                                            onClick={async () => {
                                                setDetailsModal(diapo.id.toString());
                                                setContenuModal("diaporama");
                                                setAfficherModal(true);
                                            }}
                                        >
                                            <Eye size={18} />
                                        </td>
                                        <td
                                            className="tdAction tdPoubelle"
                                            onClick={() => {
                                                setDetailsModal(diapo.nom);
                                                setContenuModal("supprimerDiaporama");
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
                    <div id="divBoutonAjouterDiaporamas">
                        <button
                            className="boutonAction"
                            onClick={() => {
                                setContenuModal("ajoutDiapo");
                                setAfficherModal(true);
                            }}
                        >
                            Ajouter un diaporama
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "diaporama" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre={`Diaporama : ${diaporamas?.filter((diaporama) => diaporama.id == Number(detailsModal))[0].nom}`} taille={700} retourArriere={() => setContenuModal("gestionDiaporama")}>
                    <AfficherDiapositives tableauId={diaporamas!.filter((diaporama) => diaporama.id == Number(detailsModal))[0].images} />
                </Modal>
            )}
            {contenuModal == "ajouterScenario" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Ajouter un scénario"
                    onSubmit={async (e) => {
                        e?.preventDefault();
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
                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo">
                            {chargementRequete ? <Chargement variant="button" /> : "Ajouter"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "menuMission" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Menu mission">
                    <div id="divModalMenuMission">
                        <div id="divOptions">
                            <a className="boutonAction" onClick={() => setContenuModal("modifierNomMission")}>
                                Modifier nom
                            </a>
                            <a className="boutonAction" onClick={() => setContenuModal("modifierDescriptionMission")}>
                                Modifier description
                            </a>
                            <a className="boutonAction" onClick={() => setContenuModal("supprimerMission")}>
                                Supprimer la mission
                            </a>
                        </div>
                    </div>
                </Modal>
            )}
            {contenuModal == "menuScenario" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Menu scénario">
                    <div id="divModalMenuScenario">
                        <div id="divOptions">
                            <a className="boutonAction" onClick={() => setContenuModal("gererDeroulerScenario")}>
                                Gérer le dérouler
                            </a>
                            <a className="boutonAction" onClick={() => setContenuModal("audiosAideScenario")}>
                                Audios d'aide
                            </a>
                            <a className="boutonAction" onClick={() => setContenuModal("modifierNomScenario")}>
                                Modifier le nom
                            </a>
                            <a className="boutonAction" onClick={() => setContenuModal("modifierDescriptionScenario")}>
                                Modifier la description
                            </a>
                            <a className="boutonAction" onClick={() => setContenuModal("supprimerScenario")}>
                                Supprimer le scénario
                            </a>
                        </div>
                    </div>
                </Modal>
            )}
            {(contenuModal == "modifierNomScenario" || contenuModal == "modifierNomMission") && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={`Modifier le nom ${contenuModal == "modifierNomScenario" ? "du scénario" : "de la mission"}`}
                    retourArriere={() => {
                        if (contenuModal == "modifierNomScenario") {
                            setContenuModal("menuScenario");
                        } else {
                            setContenuModal("menuMission");
                        }
                    }}
                    onSubmit={async (e) => {
                        e?.preventDefault();
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

                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo">
                            {chargementRequete ? <Chargement variant="button" /> : "Modifier"}
                        </button>
                    </div>
                </Modal>
            )}
            {(contenuModal == "modifierDescriptionScenario" || contenuModal == "modifierDescriptionMission") && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={`Modifier la description ${contenuModal == "modifierDescriptionScenario" ? "du scénario" : "de la mission"}`}
                    retourArriere={() => {
                        if (contenuModal == "modifierDescriptionScenario") {
                            setContenuModal("menuScenario");
                        } else {
                            setContenuModal("menuMission");
                        }
                    }}
                    onSubmit={async (e) => {
                        e?.preventDefault();
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
                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo">
                            {chargementRequete ? <Chargement variant="button" /> : "Modifier"}
                        </button>
                    </div>
                </Modal>
            )}
            {(contenuModal == "supprimerScenario" || contenuModal == "supprimerMission") && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={`Supprimer ${contenuModal == "supprimerScenario" ? "le scénario" : "la mission"}`}
                    retourArriere={() => {
                        if (contenuModal == "supprimerScenario") {
                            setContenuModal("menuScenario");
                        } else {
                            setContenuModal("menuMission");
                        }
                    }}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);
                        const reponse = await requete({ url: `/admins/${contenuModal == "supprimerScenario" ? "scenarios" : "missions"}/${detailsModal}/suppression`, methode: "DELETE" });
                        setTimeout(() => {
                            recuperationDonnees(reponse);
                            setChargementRequete(false);
                            setAfficherModal(false);
                        }, 1000);
                    }}
                >
                    <p>Êtes vous sur de vouloir supprimer {contenuModal == "supprimerScenario" ? "le scénario" : "la mission"} ?</p>
                    <div className="modalPied">
                        <button
                            className="boutonDiscret"
                            onClick={() => {
                                if (contenuModal == "supprimerScenario") {
                                    setContenuModal("menuScenario");
                                } else {
                                    setContenuModal("menuMission");
                                }
                            }}
                        >
                            Annuler
                        </button>
                        <button type="submit" className="boutonAction">
                            {chargementRequete ? <Chargement variant="button" /> : "Supprimer"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "audiosAideScenario" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Audios d'aide" retourArriere={() => setContenuModal("menuScenario")}>
                    <div id="divModalAudiosAideScenario">
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

                        <div className="modalPied">
                            <button className="boutonAction solo" onClick={() => setContenuModal("ajouterAudiosAideScenario")}>
                                Ajouter des audios d'aide
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {contenuModal == "ajouterAudiosAideScenario" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Ajouter des audios d'aide"
                    retourArriere={() => setContenuModal("audiosAideScenario")}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);

                        const missionId = document.querySelector<HTMLInputElement>("#selectMission")!.value;
                        const checkboxes = document.querySelectorAll<HTMLInputElement>(".Checkbox .listeSelection input[type='checkbox']:checked");
                        const fichiersSelectionnes = Array.from(checkboxes).map((checkbox) => checkbox.id + ".wav");
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
                    <Checkbox
                        id="checkboxAudio"
                        label="Sélectionner les audios"
                        donnees={messagesAudio?.map((audio) => ({
                            cle: audio.nomFichier.split(".wav")[0],
                            valeur: audio.detail,
                        }))}
                    />
                    <Select id="selectMission" label="Mission associée">
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
                    </Select>
                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo">
                            {chargementRequete ? <Chargement variant="button" /> : "Ajouter"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "genererAudio" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Générer un audio"
                    retourArriere={() => setContenuModal("gestionAudios")}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);

                        const texte = document.querySelector<HTMLInputElement>("#inputTexte")!.value;

                        const reponse = await requete({ url: "/admins/audios/generation", methode: "POST", corps: { texte } });
                        setTimeout(() => {
                            recuperationDonnees(reponse);
                            setChargementRequete(false);
                            setContenuModal("gestionAudios");
                        }, 1000);
                    }}
                >
                    <ChampDonneesForm id="inputTexte" label="Texte à générer :" typeInput="textearea" focus={true} />

                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo">
                            {chargementRequete ? <Chargement variant="button" /> : "Envoyer"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "genererAudioQuiz" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Générarion d'audios pour la boîte a quiz"
                    retourArriere={() => setContenuModal("gestionQuizAudios")}
                    onSubmit={async (e) => {
                        e?.preventDefault();
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
                    <p id="pGenerationAudioQuiz">Lorsque la génération est finie, les champs se vident et le loader disparait.</p>
                    <ChampDonneesForm id="inputTexte" label="Texte :" typeInput="textearea" />
                    <Select id="selectType">
                        <option value="" selected disabled>
                            --- Sélectionnez un type ---
                        </option>
                        <option value="bonneReponse">Bonne réponse</option>
                        <option value="mauvaiseReponse">Mauvaise réponse</option>
                        <option value="serieErreurs">Série de 7 erreurs</option>
                        <option value="finQuiz">Quiz réussi</option>
                        <option value="questionsJSON">Questions JSON</option>
                    </Select>

                    <div className="modalPied">
                        <button className="boutonAction solo">{chargementRequete ? <Chargement variant="button" /> : "Générer"}</button>
                    </div>
                </Modal>
            )}
            {contenuModal == "generationDevinettes" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Génération devinettes" retourArriere={() => setContenuModal("gestionDevinettes")}>
                    {detailsModal ? (
                        <p id="pResultatsGeneration">Résultats génération : {detailsModal}</p>
                    ) : (
                        <>
                            <p id="pFormat">Le format doit être : Devinette;Réponse</p>

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

                                <div className="modalPied">
                                    <button type="submit" className="boutonAction solo" disabled={chargementRequete}>
                                        {chargementRequete ? <Chargement variant="button" /> : "Générer"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </Modal>
            )}
            {contenuModal == "ajoutDiapo" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Enregistrement du diaporama" retourArriere={() => setContenuModal("gestionDiaporama")}>
                    <p id="pDetail">Il faut envoyer un fichier .zip qui contient uniquement des fichiers .png numéroté à partir de 1.</p>
                    <p>Le nom du fichier .zip sera le nom du diapo.</p>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setChargementRequete(true);

                            const formData = new FormData();
                            formData.append("zip", fichier!);

                            const reponse = await requete({ url: "/admins/missions/enregistrement-diapo", methode: "POST", corps: formData, formData: true });

                            setTimeout(() => {
                                recuperationDonnees(reponse);
                                setChargementRequete(false);
                                setContenuModal("gestionDiaporama");
                            }, 1000);
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
                        <div className="modalPied">
                            <button type="submit" className="boutonAction solo">
                                Envoyer
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {contenuModal == "ajouterMissionScenario" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Ajouter des missions au scénario"
                    retourArriere={() => setContenuModal("gererDeroulerScenario")}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);

                        const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/ajout-mission`, methode: "POST", corps: { liste: details2Modal } });

                        setTimeout(() => {
                            recuperationDonnees(reponse);
                            setChargementRequete(false);
                            setContenuModal("gererDeroulerScenario");
                        }, 1000);
                    }}
                >
                    <table className="tableau tableauAjouterMissionScenario">
                        <thead>
                            <tr>
                                <th className="tdAjouter">Ajouter</th>
                                <th>Nom</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions
                                ?.filter((mission) => !mission.scenarios.some((scenario) => scenario.scenarioId === Number(detailsModal)))
                                .map((mission, key) => (
                                    <tr key={key}>
                                        <td className="tdAjouter">
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
                    <div className="modalPied">
                        {details2Modal.length > 0 ? (
                            <button type="submit" className="boutonAction solo" disabled={chargementRequete}>
                                {chargementRequete ? <Chargement variant="button" /> : `Ajouter ${details2Modal.length} mission${details2Modal.length > 1 ? "s" : ""}`}
                            </button>
                        ) : (
                            <button className="boutonAction solo" disabled>
                                Ajouter 0 mission
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            {contenuModal == "ajouterAudioScenario" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Ajouter des audios au scénario"
                    retourArriere={() => setContenuModal("gererDeroulerScenario")}
                    onSubmit={async (e) => {
                        e?.preventDefault();
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
                    <table className="tableau tableauAjouterAudioScenario">
                        <thead>
                            <tr>
                                <th className="tdAjouter">Ajouter</th>
                                <th>Détail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messagesAudio?.map((audio, key) => (
                                <tr key={key}>
                                    <td className="tdAjouter">
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
                    <div className="modalPied">
                        {details2Modal.length > 0 ? (
                            <button type="submit" className="boutonAction solo" disabled={chargementRequete}>
                                {chargementRequete ? <Chargement variant="button" /> : `Ajouter ${details2Modal.length} audio${details2Modal.length > 1 ? "s" : ""}`}
                            </button>
                        ) : (
                            <button className="boutonAction solo" disabled>
                                Ajouter 0 audio
                            </button>
                        )}
                    </div>
                </Modal>
            )}
            {(contenuModal == "supprimerAudio" || contenuModal == "supprimerDiaporama" || contenuModal == "supprimerQuiz" || contenuModal == "supprimerDevinette") && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={`Supprimer un${(() => {
                        switch (contenuModal) {
                            case "supprimerAudio":
                                return " audio";

                            case "supprimerDiaporama":
                                return " diaporama";

                            case "supprimerQuiz":
                                return " audio du quiz";

                            case "supprimerDevinette":
                                return "e devinette";
                        }
                    })()}`}
                    retourArriere={() => {
                        switch (contenuModal) {
                            case "supprimerAudio":
                                setContenuModal("gestionAudios");
                                break;

                            case "supprimerDiaporama":
                                setContenuModal("gestionDiaporama");
                                break;

                            case "supprimerQuiz":
                                setContenuModal("gestionQuizAudios");
                                break;

                            case "supprimerDevinette":
                                setContenuModal("gestionDevinettes");
                                break;
                        }
                    }}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);
                        let url = "";
                        if (contenuModal == "supprimerAudio") {
                            url = "audios/suppression";
                        } else if (contenuModal == "supprimerDiaporama") {
                            url = "missions/suppression-diaporama";
                        } else if (contenuModal == "supprimerQuiz") {
                            url = "missions/suppression-quiz";
                        } else if (contenuModal == "supprimerDevinette") {
                            url = "missions/suppression-devinette";
                        }
                        const reponse = await requete({ url: "/admins/" + url, methode: "DELETE", corps: { nomFichier: detailsModal } });

                        setTimeout(() => {
                            recuperationDonnees(reponse);
                            setChargementRequete(false);
                            switch (contenuModal) {
                                case "supprimerAudio":
                                    setContenuModal("gestionAudios");
                                    break;

                                case "supprimerDiaporama":
                                    setContenuModal("gestionDiaporama");
                                    break;

                                case "supprimerQuiz":
                                    setContenuModal("gestionQuizAudios");
                                    break;

                                case "supprimerDevinette":
                                    setContenuModal("gestionDevinettes");
                                    break;
                            }
                        }, 1000);
                    }}
                >
                    <p style={{ textAlign: "center" }}>
                        Êtes-vous sur de vouloir supprimer l
                        {(() => {
                            switch (contenuModal) {
                                case "supprimerAudio":
                                    return "'audio";

                                case "supprimerDiaporama":
                                    return "e diaporama";

                                case "supprimerQuiz":
                                    return "'audio du quiz";

                                case "supprimerDevinette":
                                    return "a devinette";
                            }
                        })()}{" "}
                        ?
                    </p>
                    <div className="modalPied">
                        <button
                            className="boutonDiscret"
                            onClick={() => {
                                switch (contenuModal) {
                                    case "supprimerAudio":
                                        setContenuModal("gestionAudios");
                                        break;

                                    case "supprimerDiaporama":
                                        setContenuModal("gestionDiaporama");
                                        break;

                                    case "supprimerQuiz":
                                        setContenuModal("gestionQuizAudios");
                                        break;

                                    case "supprimerDevinette":
                                        setContenuModal("gestionDevinettes");
                                        break;
                                }
                            }}
                        >
                            Annuler
                        </button>
                        <button type="submit" className="boutonAction" disabled={chargementRequete}>
                            {chargementRequete ? <Chargement variant="button" /> : "Valider"}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
