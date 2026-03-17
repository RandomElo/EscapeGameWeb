import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import "../styles/SuiviPartie.css";
import { CircleAlert, Gamepad2, Megaphone, Mic, Play, Tag, Users, Volume2, X } from "lucide-react";
import Notifications from "../composants/Notifications";
import { useRequete } from "../fonctions/requete";

export default function SuiviPartie() {
    const { estAuth, role } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();

    const [listeNotifications, setListeNotifications] = useState<{ niveau: "succes" | "warn" | "erreur"; titre: string; description: string }[]>([]);

    const [partiesEnCours, setPartiesEnCours] = useState<boolean>(false);
    const [detailsParties, setDetailsParties] = useState<{ equipeNom: string; nbrMembres: number; scenarioNom: string; nbrMissions: number; dateDebut: Date }[]>();

    const [scenarios, setScenarios] = useState<{ id: number; nom: string; description: string }[]>([]);
    const [equipes, setEquipes] = useState<{ id: number; nom: string }[]>([]);

    const [lancementPartie, setLancementPartie] = useState<{ scenario: string; equipe: string }>({ scenario: "", equipe: "" });
    const [erreur, setErreur] = useState<string>("");

    useEffect(() => {
        if (!estAuth) {
            navigation("/connexion");
        } else if (role != "controleur") {
            navigation("/");
        } else {
            async function recuperation() {
                const reponse = await requete({ url: "/admins/parties/parties-en-cours" });
                console.log(reponse);
                if (!reponse.partiesEnCours) {
                    setEquipes(reponse.details.equipes);
                    setScenarios(reponse.details.scenarios);
                    setPartiesEnCours(false);
                } else {
                    setDetailsParties(reponse.details);
                    setPartiesEnCours(true);
                }
            }
            recuperation();
        }
    }, [estAuth, navigation]);
    // const [listeNotifications, setListeNotifications] = useState<{ niveau: "succes" | "warn" | "erreur"; titre: string; description: string }[]>([
    //     { niveau: "succes", titre: "Test", description: "Licorne" },
    //     { niveau: "warn", titre: "Test 2", description: "Licorne" },
    //     { niveau: "erreur", titre: "Test 2", description: "Licorne" },
    //     { niveau: "erreur", titre: "Test 2", description: "Licorne" },
    //     { niveau: "erreur", titre: "Test 2", description: "Licorne" },
    // ]);

    const missions = [
        {
            id: 1,
            title: "Mission 1",
            description: "Diapo + RFID",
            tags: ["Terminée"],
            etat: "Terminee",
        },
        {
            id: 2,
            title: "Mission 2",
            description: "Morse",
            tags: ["En cours", "1 coordonnée sur 4"],
            etat: "EnCours",
        },
        {
            id: 3,
            title: "Mission 3",
            description: "Map-monde + RFID",
            tags: ["En attente"],
            etat: "EnAttente",
        },
        {
            id: 4,
            title: "Mission 4",
            description: "Cablage mot",
            tags: ["Final"],
            etat: "EnAttente",
        },
    ];
    return (
        <main className="SuiviPartie">
            {partiesEnCours ? (
                <div className="gestionPartie">
                    {/* LEFT PANEL */}
                    <div className="scenarioLeft">
                        <div className="card cameraCard">
                            <h3>Aperçu caméra</h3>

                            <div className="cameraPreview">
                                <div className="fakeCamera">Caméra live</div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER PANEL */}
                    <div className="scenarioCenter">
                        <div className="timeline">
                            {missions.map((mission, index) => (
                                <div key={mission.id} className="timelineBlock">
                                    {/* Mission card */}
                                    <div className={"card missionCard mission" + mission.etat}>
                                        <div className="missionHeader">
                                            <h3>{mission.title}</h3>

                                            <div className="divBadges">
                                                {(mission.tags.includes("Terminée") ? ["Terminée"] : mission.tags.includes("En attente") ? ["En attente"] : mission.tags.filter((tag) => tag !== "En cours")).map((tag) => (
                                                    <span className={`badge ${mission.etat == "EnCours" ? "enCours" : ""}`} key={tag}>
                                                        {mission.etat == "EnCours" ? <CircleAlert size={14} /> : <Tag size={14} />}

                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="missionSecondeLigne">
                                            <p>{mission.description}</p>
                                            {mission.etat == "EnCours" && (
                                                <span className="aideAudio">
                                                    <Megaphone size={18} className="primaryButton" />
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Audio card */}
                                    {index !== missions.length - 1 && (
                                        <div className="audioCard">
                                            <Volume2 size={20} />
                                            <span>Audio indice</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="scenarioRight">
                        <div className="card audioControl">
                            <h3>Envoyer un message audio</h3>

                            <p className="textSecondary">Enregistrer et envoyer un message vocal aux joueurs.</p>

                            <button className="primaryButton">
                                <Mic size={18} />
                                Enregistrer un message
                            </button>

                            {/* TEST */}
                            <button onClick={() => setListeNotifications((prev) => [...prev, { niveau: "erreur", titre: "Test 2", description: "Licorne" }])}>Envoyer notif</button>
                            {/* FIN TEST */}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="aucunePartie card">
                    <div className="header">
                        <Gamepad2 size={22} />
                        <h2>Aucune partie en cours</h2>
                    </div>

                    <p className="description">Veuillez sélectionner un scénario et une équipe pour lancer une nouvelle partie.</p>

                    <div className="formulaire">
                        <div className="champ">
                            <label>Scénario :</label>
                            <div className="selectWrapper">
                                <Gamepad2 size={16} />

                                <select
                                    defaultValue={lancementPartie.scenario}
                                    onChange={(e) =>
                                        setLancementPartie((prev) => ({
                                            ...prev,
                                            scenario: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="" selected disabled>
                                        {scenarios.length > 0 ? "Sélectionner un scénario" : "⚠️ Merci de crée un scénario"}
                                    </option>
                                    {scenarios?.map((scenario, key) => (
                                        <option value={scenario.id} key={key}>
                                            {scenario.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="champ">
                            <label>Équipe :</label>
                            <div className="selectWrapper">
                                <Users size={16} />
                                <select
                                    defaultValue={lancementPartie.equipe}
                                    onChange={(e) =>
                                        setLancementPartie((prev) => ({
                                            ...prev,
                                            equipe: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="" selected disabled>
                                        {equipes.length > 0 ? "Sélectionner une équipe" : "⚠️ Aucune équipe enregistrée (les joueurs doivent en créé une)"}
                                    </option>
                                    {equipes?.map((equipe, key) => (
                                        <option value={equipe.id} key={key}>
                                            {equipe.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {erreur && <p id="pErreur">{erreur}.</p>}

                    <button
                        className="primaryButton lancerBouton"
                        onClick={async () => {
                            console.log(lancementPartie);
                            const reponse = await requete({ url: "/admins/parties/lancer", methode: "POST", corps: lancementPartie });
                            console.log(reponse);
                            if (reponse.partieLancer) {
                                setDetailsParties(reponse.details);
                                setPartiesEnCours(true);
                            } else {
                                setErreur(reponse.details);
                            }
                        }}
                        disabled={!lancementPartie.equipe || !lancementPartie.scenario}
                    >
                        <Play size={18} />
                        Lancer la partie
                    </button>
                </div>
            )}

            <Notifications liste={listeNotifications} setListe={setListeNotifications} />
        </main>
    );
}
