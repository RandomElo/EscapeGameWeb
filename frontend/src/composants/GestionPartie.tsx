import { CircleAlert, Megaphone, Mic, Power, Tag, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { useRequete } from "../fonctions/requete";

type Props = {
    missions: { id: number; nom: string; description: string; tags: string[]; etat: string }[];

    detailsPartie: { equipeNom: string; nbrMembres: number; scenarioNom: string; nbrMissions: number; dateDebut: string } | undefined;
    setListeNotifications: React.Dispatch<
        React.SetStateAction<
            {
                niveau: "succes" | "warn" | "erreur";
                titre: string;
                description: string;
            }[]
        >
    >;
    setPartiesEnCours: React.Dispatch<React.SetStateAction<boolean>>;
};

function formatDureeDepuis(dateDebut: string, now: number): string {
    const debut = new Date(dateDebut).getTime();
    const diffMs = now - debut;

    const minutes = Math.floor(diffMs / 60000);
    const heures = Math.floor(minutes / 60);

    if (heures === 0) {
        return `${minutes} min`;
    }

    const resteMinutes = minutes % 60;
    return `${heures}h${resteMinutes.toString().padStart(2, "0")}`;
}

export default function GestionPartie({ missions, detailsPartie, setListeNotifications, setPartiesEnCours }: Props) {
    const [now, setNow] = useState(Date.now());
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState("Déconnecté");
    const requete = useRequete();

    const config = {
        mqtt: {
            host: import.meta.env.VITE_WS_MQTT_HOST,
            username: import.meta.env.VITE_WS_MQTT_USERNAME,
            password: import.meta.env.VITE_WS_MQTT_MDP,
            baseTopic: "escape",
        },
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Connexion au broker MQTT via WebSocket
        const client = mqtt.connect(config.mqtt.host, {
            username: config.mqtt.username,
            password: config.mqtt.password,
            clean: true, // connexion propre
            connectTimeout: 4000, // timeout connexion
            reconnectPeriod: 1000, // reconnexion auto si perdu
        });

        // Quand la connexion est établie
        client.on("connect", () => {
            setStatus("Connecté");
            console.log("MQTT connecté");

            // S'abonner au topic principal
            client.subscribe(`${config.mqtt.baseTopic}/#`, (err) => {
                if (err) console.error("Erreur d'abonnement :", err);
            });
        });

        // Quand un message est reçu
        client.on("message", (topic, payload) => {
            const msg = payload.toString();
            console.log("Message reçu :", topic, msg);
            setMessages((prev) => [...prev, { topic, msg }]);
        });

        client.on("error", (err) => {
            console.error("MQTT error:", err);
            setStatus("Erreur");
        });

        client.on("reconnect", () => {
            setStatus("Reconnexion...");
        });

        client.on("close", () => {
            setStatus("Déconnecté");
        });

        // Cleanup à la fermeture du composant
        return () => {
            client.end(true);
        };
    }, []);

    const envoyerMessage = (topicSuffix, message) => {
        const client = mqtt.connect(config.mqtt.host, {
            username: config.mqtt.username,
            password: config.mqtt.password,
        });
        const topic = `${config.mqtt.baseTopic}/${topicSuffix}`;
        client.publish(topic, message, { qos: 0 }, (err) => {
            if (err) console.error("Erreur envoi message:", err);
            client.end();
        });
    };

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
                                    <h3>{mission.nom}</h3>

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
                    {detailsPartie && (
                        <div className="detailsGrid">
                            <div className="premiereLigne">
                                <div className="bloc">
                                    <span className="label">Équipe</span>
                                    <span className="valeur">{detailsPartie.equipeNom}</span>
                                    <span className="meta">
                                        {detailsPartie?.nbrMembres} membre{detailsPartie.nbrMembres > 1 ? "s" : ""}
                                    </span>
                                </div>

                                <div className="bloc scenario">
                                    <span className="label">Scénario</span>
                                    <span className="valeur">{detailsPartie.scenarioNom}</span>
                                    <span className="meta">
                                        {detailsPartie?.nbrMissions} mission{detailsPartie.nbrMissions > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="bloc duree">
                                <span className="label">Durée</span>
                                <span className="valeur">{formatDureeDepuis(detailsPartie.dateDebut, now)}</span>
                            </div>

                            <button
                                className="primaryButton boutonTerminerPartie"
                                onClick={async () => {
                                    await requete({ url: "/admins/parties/avorter-partie", methode: "PATCH" });
                                    setPartiesEnCours(false)
                                }}
                            >
                                <Power />
                                Terminer la partie
                            </button>
                        </div>
                    )}
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
                    <button onClick={() => envoyerMessage("test", "Hello MQTT")}>Envoyer "Hello MQTT"</button>

                    {/* FIN TEST */}
                </div>
            </div>
        </div>
    );
}
