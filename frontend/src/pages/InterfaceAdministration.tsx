import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRequete } from "../fonctions/requete";
import "../styles/InterfaceAdministration.css";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { EllipsisVertical, GripVertical, Play, Square, Trash2 } from "lucide-react";
import RetourArriere from "../composants/RetourArriere";
import Chargement from "../composants/Chargement";
import GererAudiosScenario from "../composants/interfaceAdministration/GererAudiosScenario";

export type RecuperationDonnees = {
    scenarios: { id: number; nom: string; description: string }[];
    missions: {
        id: number;
        nom: string;
        description: string;
        ipAdresse: string;
        configuration: string;
        scenarios: {
            scenarioId: number;
            ordre: number;
            configuration: string;
        }[];
    }[];
    messagesAudio: { nomFichier: string; detail: string }[];
};

export default function InterfaceAdministration() {
    const { estAuth } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"ajouterMission" | "genererAudio" | "ajouterScenario" | "supprimerAudio" | "menuScenario" | "gererMissionsScenario" | "modifierNomScenario" | "modifierDescriptionScenario" | "supprimerScenario" | "menuMission" | "modifierAdresseIPMission" | "supprimerMission" | "modifierNomMission" | "modifierDescriptionMission" | "modifierConfigurationMission" | "ajouterMissionScenario" | "genererAudioQuiz" | "gererAudiosScenario">();
    const [detailsModal, setDetailsModal] = useState<string>();
    const [details2Modal, setDetails2Modal] = useState<number[]>([]);
    const [erreur, setErreur] = useState<string>();
    const [missions, setMissions] = useState<{ id: number; nom: string; description: string; ipAdresse: string; configuration: string; scenarios: { scenarioId: number; ordre: number; configuration: string }[] }[]>();
    const [scenarios, setScenarios] = useState<{ id: number; nom: string; description: string }[]>();
    const [tableauIP, setTableauIP] = useState<string[]>();
    const [messagesAudio, setMessagesAudio] = useState<{ nomFichier: string; detail: string }[]>();

    const [idAudioEnCours, setIdAudioEnCours] = useState<number | null>(null);
    const [chargementRequete, setChargementRequete] = useState<boolean>(false);
    // useState pour la gestion des missions pour un scénario
    const [missionsTriees, setMissionsTriees] = useState<any[]>([]);
    const [modificationMissionsScenarios, setModificationmissionsScenarios] = useState<boolean>(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    async function recuperationDonnees(reponse: RecuperationDonnees) {
        console.log(reponse);
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

    useEffect(() => {
        if (contenuModal === "gererMissionsScenario") {
            const scenarioId = Number(detailsModal);

            const liste =
                missions
                    ?.filter((mission) => mission.scenarios.some((scenario) => scenario.scenarioId === scenarioId))
                    .sort((a, b) => {
                        const ordreA = a.scenarios.find((s) => s.scenarioId === scenarioId)?.ordre ?? 0;
                        const ordreB = b.scenarios.find((s) => s.scenarioId === scenarioId)?.ordre ?? 0;
                        return ordreA - ordreB;
                    }) || [];

            setMissionsTriees(liste);
        }
    }, [contenuModal, detailsModal, missions]);

    return (
        <>
            <main className="InterfaceAdministration">
                <h1 id="titre">Interface d'administration</h1>
                {/* Pour les pings */}
                <div id="divCommunicationMissions">
                    {tableauIP?.map((ip, key) => (
                        <div className="divVerificationCommunication" key={key}>
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
                                <th>Configuration</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions?.map((mission, key) => (
                                <tr key={key}>
                                    <td className="tdNom">{mission.nom}</td>
                                    <td className="tdDescription">{mission.description}</td>
                                    <td className="tdIpAdresse">{mission.ipAdresse}</td>
                                    <td className="tdReponse">{mission.configuration}</td>
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
                                const ipAdresse = document.querySelector<HTMLInputElement>("#inputAdresseIp")!.value;
                                const reponseInput = document.querySelector<HTMLInputElement>("#inputReponse")!.value;

                                const reponse = await requete({ url: "/admins/missions/creation", methode: "POST", corps: { nom, description, ipAdresse, reponse: reponseInput } });
                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    // setAfficherModal(false);
                                }, 1000);
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
                            <a className="bouton" onClick={() => setContenuModal("gererMissionsScenario")}>
                                Gérer les missions
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("gererAudiosScenario")}>
                                Gérer les audios
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
                                }, 1000);
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
                {contenuModal == "gererMissionsScenario" &&
                    (() => {
                        const scenarioId = Number(detailsModal);

                        const changerOrdre = (missionId: number, nouvelOrdre: number, scenarioId: number) => {
                            setMissionsTriees((prev) => {
                                const liste = [...prev];

                                const indexActuel = liste.findIndex((m) => m.id === missionId);
                                if (indexActuel === -1) return prev;

                                const [mission] = liste.splice(indexActuel, 1);
                                liste.splice(nouvelOrdre, 0, mission);

                                const nouvelleListe = liste.map((mission, i) => ({
                                    ...mission,
                                    scenarios: mission.scenarios.map((s) => (s.scenarioId === scenarioId ? { ...s, ordre: i } : s)),
                                }));

                                setModificationmissionsScenarios(true);

                                return nouvelleListe;
                            });
                        };

                        const modifierConfiguration = (missionId: number, scenarioId: number, valeur: string) => {
                            setMissionsTriees((prev) =>
                                prev.map((mission) => {
                                    if (mission.id !== missionId) return mission;

                                    return {
                                        ...mission,
                                        scenarios: mission.scenarios.map((s) => (s.scenarioId === scenarioId ? { ...s, configuration: valeur } : s)),
                                    };
                                }),
                            );

                            setModificationmissionsScenarios(true);
                        };

                        return (
                            <div id="divModalListeMissionScenario">
                                <RetourArriere clique={() => setContenuModal("menuScenario")} />

                                <h1>Les missions</h1>

                                <div id="divListeMission">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Ordre</th>
                                                <th>Nom</th>
                                                <th>Configuration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {missionsTriees?.map((mission) => {
                                                const scenario = mission.scenarios.find((s) => s.scenarioId === scenarioId);

                                                return (
                                                    <tr key={mission.id}>
                                                        <td>
                                                            <select value={scenario?.ordre} onChange={(e) => changerOrdre(mission.id, Number(e.target.value), scenarioId)}>
                                                                {missionsTriees.map((_, index) => (
                                                                    <option key={index} value={index}>
                                                                        {index + 1}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td>{mission.nom}</td>

                                                        <td>
                                                            <ChampDonneesForm typeInput="texteOnChange" id="inputConfiguration" value={scenario?.configuration} onChange={(valeur) => modifierConfiguration(mission.id, scenarioId, valeur)} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {modificationMissionsScenarios && (
                                    <button
                                        className="bouton"
                                        onClick={async () => {
                                            setChargementRequete(true);

                                            const donnees = missionsTriees.map((mission) => {
                                                const scenario = mission.scenarios.find((s) => s.scenarioId === scenarioId);

                                                return {
                                                    missionId: mission.id,
                                                    scenarioId: scenarioId,
                                                    ordre: scenario?.ordre ?? 0,
                                                    configuration: scenario?.configuration ?? null,
                                                };
                                            });

                                            const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/modification-missions`, methode: "PATCH", corps: { donnees } });

                                            setTimeout(() => {
                                                recuperationDonnees(reponse);
                                                setChargementRequete(false);
                                                setAfficherModal(false);
                                            }, 1000);
                                        }}
                                    >
                                        {chargementRequete ? <Chargement variant="button" /> : "Enregistrer les modifications"}
                                    </button>
                                )}

                                <button
                                    className="bouton"
                                    onClick={() => {
                                        setDetails2Modal([]);
                                        setContenuModal("ajouterMissionScenario");
                                    }}
                                >
                                    Ajouter une mission
                                </button>
                            </div>
                        );
                    })()}
                {contenuModal == "gererAudiosScenario" && detailsModal && missions&& <GererAudiosScenario idScenario={detailsModal} missions={missions} recuperationDonnees={recuperationDonnees} />}

                {contenuModal == "ajouterMissionScenario" && (
                    <div id="divModalAjouterMissionScenario">
                        <h1>Ajouter des mission au scénario</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const reponse = await requete({ url: `/admins/scenarios/${detailsModal}/ajout-mission`, methode: "POST", corps: { listeMissions: details2Modal } });
                                console.log(reponse);
                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setContenuModal("gererMissionsScenario");
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
                                    {chargementRequete ? <Chargement variant="button" /> : `Ajouter ${details2Modal.length} mission${details2Modal.length > 1 && "s"}`}
                                </button>
                            ) : (
                                <button className="bouton" disabled>
                                    Ajouter 0 mission
                                </button>
                            )}
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
                            <a className="bouton" onClick={() => setContenuModal("modifierAdresseIPMission")}>
                                Modifier adresse IP
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("modifierConfigurationMission")}>
                                Modifier configuration
                            </a>
                            <a className="bouton" onClick={() => setContenuModal("supprimerMission")}>
                                Supprimer la mission
                            </a>
                        </div>
                    </div>
                )}
                {contenuModal == "modifierConfigurationMission" && (
                    <div id="divModalmodifierConfigurationMission">
                        <RetourArriere clique={() => setContenuModal("menuMission")} />

                        <h2>Modifier la configuration</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const configuration = document.querySelector<HTMLInputElement>("#inputConfiguration")!.value;

                                const reponse = await requete({ url: `/admins/missions/${detailsModal}/modification-configuration`, methode: "PATCH", corps: { configuration } });

                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="inputConfiguration" typeInput="textearea" value={missions?.filter((scenario) => scenario.id == Number(detailsModal))[0].configuration} focus={true} />

                            <button type="submit" className="bouton">
                                {chargementRequete ? <Chargement variant="button" /> : "Modifier"}
                            </button>
                        </form>
                    </div>
                )}
                {contenuModal == "modifierAdresseIPMission" && (
                    <div id="divModalmodifierAdresseIPMission">
                        <RetourArriere clique={() => setContenuModal("menuMission")} />

                        <h2>Modifier adresse IP</h2>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);

                                const adresseIp = document.querySelector<HTMLInputElement>("#inputAdresseIP")!.value;

                                const reponse = await requete({
                                    url: `/admins/missions/${detailsModal}/modification-adresse-ip`,
                                    methode: "PATCH",
                                    corps: { adresseIp },
                                });

                                setTimeout(() => {
                                    recuperationDonnees(reponse);
                                    setChargementRequete(false);
                                    setAfficherModal(false);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="inputAdresseIP" typeInput="text" value={missions?.filter((scenario) => scenario.id == Number(detailsModal))[0].ipAdresse} focus={true} />

                            <button type="submit" className="bouton">
                                {chargementRequete ? <Chargement variant="button" /> : "Modifier"}
                            </button>
                        </form>
                    </div>
                )}
            </Modal>
        </>
    );
}
