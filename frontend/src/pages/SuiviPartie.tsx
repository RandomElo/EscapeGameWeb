import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import "../styles/SuiviPartie.css";
import { Megaphone, Mic, Tag, Volume2 } from "lucide-react";

export default function SuiviPartie() {
    const { estAuth, role } = useAuth();
    const navigation = useNavigate();

    useEffect(() => {
        if (!estAuth) {
            navigation("/connexion");
        } else if (role != "controleur") {
            navigation("/connexion");
        }
    }, [estAuth, navigation]);
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
            <div className="scenarioPage">
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
                                                <span className="badge" key={tag}>
                                                    <Tag size={14} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="missionSecondeLigne">
                                        <p>{mission.description}</p>
                                        {mission.etat != "Terminee" && (
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
                    </div>
                </div>
            </div>
        </main>
    );
}
