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

    useEffect(() => {
        if (!estAuth) {
            navigation("/connexion");
        } else if (role != "controleur") {
            navigation("/");
        } else {
            async function recuperation() {
                const reponse = await requete({ url: "/admins/scenarios/configuration-complete" });
                console.log(reponse);
            }
            recuperation();
        }
    }, [estAuth, navigation]);
    const [scenario, setScenario] = useState("");
    const [equipe, setEquipe] = useState("");
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
        <div className="cardAucunePartie card">
            <div className="header">
                <Gamepad2 size={22} />
                <h2>Aucune partie en cours</h2>
            </div>

            <p className="description">Veuillez sélectionner un scénario et une équipe pour lancer une nouvelle partie.</p>

            <div className="formulaire">
                <div className="champ">
                    <label>Scénario</label>
                    <div className="selectWrapper">
                        <Gamepad2 size={16} />
                        <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
                            <option value="">Sélectionner un scénario</option>
                            <option value="scenario1">Mission Atlantique</option>
                            <option value="scenario2">Trésor du capitaine</option>
                        </select>
                    </div>
                </div>

                <div className="champ">
                    <label>Équipe</label>
                    <div className="selectWrapper">
                        <Users size={16} />
                        <select value={equipe} onChange={(e) => setEquipe(e.target.value)}>
                            <option value="">Sélectionner une équipe</option>
                            <option value="equipe1">Équipe Alpha</option>
                            <option value="equipe2">Équipe Beta</option>
                        </select>
                    </div>
                </div>
            </div>

            <button className="primaryButton lancerBouton" onClick={() => {
                console.log("lancer partie")
            }} disabled={!scenario || !equipe}>
                <Play size={18} />
                Lancer la partie
            </button>
        </div>
    );
    return (
        <main className="SuiviPartie">
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
            <Notifications liste={listeNotifications} setListe={setListeNotifications} />
        </main>
    );
}
