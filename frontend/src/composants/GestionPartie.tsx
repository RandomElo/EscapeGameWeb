import { CircleAlert, Megaphone, Mic, Power, Tag, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { useRequete } from "../fonctions/requete";
import type { Deroule } from "../pages/SuiviPartie";
import GestionTags from "./gestionPartie/GestionTags";
import Modal from "./Modal";
import Camera from "./Camera";

type Props = {
    deroule: Deroule;

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

export default function GestionPartie({ deroule, detailsPartie, setListeNotifications, setPartiesEnCours }: Props) {
    const type = import.meta.env.VITE_TYPE_ENV;
    const [now, setNow] = useState(Date.now());
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState("Déconnecté");
    const [missionEnCours, setMissionEnCours] = useState<number>();
    const [missionSuivante, setMissionSuivante] = useState<number>();
    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"audioAide">();
    const [detailModal, setDetailModal] = useState<string>("");
    const [missionsDeconnectee, setMissionsDeconnectee] = useState<string[]>([]);

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
        const ordreMissionEnCours = deroule.filter((etape) => etape.etat == "EnCours")[0].ordre;
        const missionSuivante = deroule.filter((etape) => etape.ordre > ordreMissionEnCours && etape.type == "mission")[0].ordre;

        setMissionEnCours(ordreMissionEnCours);
        setMissionSuivante(missionSuivante);
    }, [deroule]);
    
    useEffect(() => {
        if (type !== "reel") return;
        const client = mqtt.connect(config.mqtt.host, {
            username: config.mqtt.username,
            password: config.mqtt.password,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        client.on("connect", () => {
            setStatus("Connecté");
            console.log("MQTT connecté");

            setListeNotifications((prev) => [...prev, { niveau: "succes", titre: "MQTT", description: "Connecté" }]);

            client.subscribe(`${config.mqtt.baseTopic}/#`, (err) => {
                if (err) console.error("Erreur d'abonnement :", err);
            });
        });

        client.on("message", (topic, payload) => {
            const msg = payload.toString();
            console.log("Message reçu :", topic, msg);

            setMessages((prev) => [...prev, { topic, msg }]);

            // Gestion des messagesconst match = topic.match(/^escape\/mission\/(\d+)\/status$/);
            const regexConnected = topic.match(/^escape\/mission\/(\d+)\/status$/);
            if (regexConnected) {
                const missionId = regexConnected[1];
                const mission = `Mission ${missionId}`;
                if (msg === "online") {
                    setListeNotifications((prev) => [...prev, { niveau: "succes", titre: mission, description: "Connecté" }]);
                } else {
                    setListeNotifications((prev) => [...prev, { niveau: "warn", titre: mission, description: "Déconnecté" }]);
                    if (!missionsDeconnectee.includes(mission)) {
                        setMissionsDeconnectee((prev) => [...prev, mission]);
                    }
                    console.log("eloi");
                }

                return; // important → éviter traitement global
            }
        });

        client.on("error", (err) => {
            console.error("MQTT error:", err);
            setStatus("Erreur");
        });

        client.on("reconnect", () => {
            setListeNotifications((prev) => [...prev, { niveau: "warn", titre: "MQTT", description: "Reconnexion en cours" }]);

            setStatus("Reconnexion...");
        });

        client.on("close", () => {
            setListeNotifications((prev) => [...prev, { niveau: "warn", titre: "MQTT", description: "Déconnecté" }]);

            setStatus("Déconnecté");
        });

        // ✅ cleanup CORRECT
        return () => {
            console.log("MQTT cleanup");
            client.end(true);
        };
    }, [type]);

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
        <>
            <div className="gestionPartie">
                {/* LEFT PANEL */}
                <div className="scenarioLeft">
                    <div className="card cameraCard">
                        <h3>Aperçu caméra</h3>
                        <div className="cameraPreview">
                            <Camera />
                        </div>
                    </div>
                    <div className="card avertissementsCard">
                        <h3>Avertissements</h3>
                        <div>
                            {missionsDeconnectee.map((mission) => (
                                <p>
                                    ⚠️ <span className="gras">{mission}</span> est déconnecté
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CENTER PANEL */}
                <div className="scenarioCenter">
                    <div className="timeline">
                        {deroule.map((etape, index) => (
                            <div key={index} className="timelineBlock">
                                {/* Mission card */}
                                {etape.type == "mission" && (
                                    <div className={"card missionCard mission" + etape.etat}>
                                        <div className="missionHeader">
                                            <h3>{etape.nom}</h3>
                                            <GestionTags tags={etape.tags} etat={etape.etat} />
                                        </div>
                                        <div className="missionSecondeLigne">
                                            <p>{etape.description}</p>
                                            {etape.etat == "EnCours" && (
                                                <span
                                                    className="aideAudio"
                                                    onClick={() => {
                                                        setContenuModal("audioAide");
                                                        setDetailModal(etape.ordre.toString());
                                                        setAfficherModal(true);
                                                    }}
                                                >
                                                    <Megaphone size={18} className="primaryButton" />
                                                </span>
                                            )}
                                        </div>
                                        {etape.ordre == missionSuivante && (
                                            <div id="divSkipMission">
                                                <button className="primaryButton">Passer à cette mission</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {etape.type == "audio" && (
                                    <div className="audioCard">
                                        <Volume2 size={20} />
                                        <span>{etape.nom}</span>
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
                                        const reponse2 = await requete({ url: "/admins/parties/avorter-partie", methode: "PATCH" });
                                        console.log(reponse2);
                                        setPartiesEnCours(false);
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
            <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)}>
                {contenuModal == "audioAide" && (
                    <div id="divModalAudioAide">
                        <h1>Lancer des audios d'aide</h1>
                        <table>
                            <tbody>
                                {deroule
                                    .filter((etape) => etape.ordre == Number(detailModal))[0]
                                    .audiosAide.map((audio, key) => (
                                        <tr key={key}>
                                            <td className="tdDetailFichier">{audio.detail}</td>
                                            <td className="tdAction">
                                                <button className="bouton">Lancer</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
        </>
    );
}
