import { CircleAlert, Megaphone, Mic, Power, Tag, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { useRequete } from "../fonctions/requete";
import type { Deroule } from "../pages/SuiviPartie";
import GestionTags from "./gestionPartie/GestionTags";
import Modal from "./Modal";
import Chargement from "./Chargement";
import { useResponsive } from "../contexts/ResponsiveContext";
import CardAvertissements from "./gestionPartie/CardAvertissements";
import CardCamera from "./gestionPartie/Camera";
import CardDetailsPartie from "./gestionPartie/CardDetailsPartie";
import CardLancementAudioVolee from "./gestionPartie/CardLancementAudioVolee";
import CardTimelineScenario from "./gestionPartie/CardTimelineScenario";
import ChampDonneesForm from "./ChampDonneesForm";
export type DetailsPartie = { equipeNom: string; nbrMembres: number; scenarioNom: string; nbrMissions: number; dateDebut: string } | undefined;
type Props = {
    deroule: Deroule;

    detailsPartie: DetailsPartie;
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

export default function GestionPartie({ deroule, detailsPartie, setListeNotifications, setPartiesEnCours }: Props) {
    const type = import.meta.env.VITE_TYPE_ENV;
    const [now, setNow] = useState<number>(() => Date.now());
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState("Déconnecté");
    const [missionEnCours, setMissionEnCours] = useState<number>();
    const [missionSuivante, setMissionSuivante] = useState<number>();
    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"audioAide" | "lancementAudioVolee">();

    const [detailModal, setDetailModal] = useState<string>("");
    const [missionsDeconnectee, setMissionsDeconnectee] = useState<string[]>([]);
    const [chargementRequete, setChargementRequete] = useState<boolean>(false);

    const requete = useRequete();
    const { estMobile } = useResponsive();

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
        console.log("Mission en cours : " + ordreMissionEnCours);
        console.log(deroule);
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
            let msg = payload.toString().trim();
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
                }

                return; // important → éviter traitement global
            }

            const regexChangementMission = topic.match(/^escape\/mission\/(\d+)\/state$/);
            if (regexChangementMission) {
                msg = JSON.parse(payload.toString());

                const missionId = regexChangementMission[1];

                if (msg == "start") {
                    console.log(`Mission ${missionId} démarrée`);
                    console.log(deroule.filter((mission) => mission.topicMQTT == missionId)[0].ordre);
                    setMissionSuivante(deroule.filter((mission) => mission.topicMQTT == missionId)[0].ordre + 1);
                    // Exemple
                    setListeNotifications((prev) => [
                        ...prev,
                        {
                            niveau: "succes",
                            titre: `Mission ${missionId}`,
                            description: "Démarrée",
                        },
                    ]);
                } else console.log("dehors");

                return;
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
                {estMobile ? (
                    <>
                        <CardDetailsPartie detailsPartie={detailsPartie} setPartiesEnCours={setPartiesEnCours} now={now} />
                        <CardAvertissements missionsDeconnectee={missionsDeconnectee} />
                        <CardTimelineScenario deroule={deroule} setContenuModal={setContenuModal} setDetailModal={setDetailModal} setAfficherModal={setAfficherModal} missionSuivante={missionSuivante} />
                        <CardCamera />
                        <CardLancementAudioVolee setContenuModal={setContenuModal} setAfficherModal={setAfficherModal} />
                    </>
                ) : (
                    <>
                        {/* LEFT PANEL */}
                        <div className="scenarioLeft">
                            <CardCamera />
                            <CardAvertissements missionsDeconnectee={missionsDeconnectee} />
                        </div>

                        {/* CENTER PANEL */}
                        <CardTimelineScenario deroule={deroule} setContenuModal={setContenuModal} setDetailModal={setDetailModal} setAfficherModal={setAfficherModal} missionSuivante={missionSuivante} />
                        {/* RIGHT PANEL */}
                        <div className="scenarioRight">
                            <CardDetailsPartie detailsPartie={detailsPartie} setPartiesEnCours={setPartiesEnCours} now={now} />
                            <CardLancementAudioVolee setContenuModal={setContenuModal} setAfficherModal={setAfficherModal} />
                        </div>
                    </>
                )}
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
                {contenuModal == "lancementAudioVolee" && (
                    <div id="divModalLancementAudioVolee">
                        <h1>Lancement audio</h1>
                        
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete(true);
                                const texte = document.querySelector<HTMLInputElement>("#inputTexte")!.value;

                                const reponse = await requete({ url: "/admins/audio/generer-et-lancer", methode: "POST", corps: { texte } });
                                setTimeout(() => {
                                    setChargementRequete(false);
                                    setDetailModal("✅ Audio lancer avec succès");
                                    setTimeout(() => {
                                        setAfficherModal(false);
                                    }, 2000);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="inputTexte" typeInput="text" placeholder="Pour avancer vous devez ..." label="Texte à envoyer :" />

                            <button type="submit" className="bouton" disabled={chargementRequete}>
                                {chargementRequete ? <Chargement variant="button" /> : "Générer et lancer"}
                            </button>
                        </form>
                    </div>
                )}
            </Modal>
        </>
    );
}
