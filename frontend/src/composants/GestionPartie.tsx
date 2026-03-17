import { CircleAlert, Megaphone, Mic, Tag, Volume2 } from "lucide-react";

type Props = {
    missions: { id: number; title: string; description: string; tags: string[]; etat: string }[];
    detailsParties: { equipeNom: string; nbrMembres: number; scenarioNom: string; nbrMissions: number; dateDebut: Date }[];
    setListeNotifications: React.Dispatch<
        React.SetStateAction<
            {
                niveau: "succes" | "warn" | "erreur";
                titre: string;
                description: string;
            }[]
        >
    >;
};

export default function GestionPartie({ missions, detailsParties, setListeNotifications }: Props) {
    return (
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
                <div className="card cardDetailsPartie">
                    <div className="cardHeader">
                        <h3>Détails de la partie</h3>
                        <span className="badge badge-info">
                            <CircleAlert size={14} />
                            Étape 1 / 5
                        </span>
                    </div>

                    <div className="detailsGrid">
                        <div className="bloc">
                            <span className="label">Équipe</span>
                            <span className="valeur">{detailsParties[0].equipeNom}</span>
                            <span className="meta">
                                {detailsParties[0].nbrMembres} membre{detailsParties[0].nbrMembres > 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="bloc scenario">
                            <span className="label">Scénario</span>
                            <span className="valeur">{detailsParties[0].scenarioNom}</span>
                            <span className="meta">
                                {detailsParties[0].nbrMissions} mission{detailsParties[0].nbrMissions > 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>

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
    );
}
