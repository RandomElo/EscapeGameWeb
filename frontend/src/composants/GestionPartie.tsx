import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { useRequete } from "../fonctions/requete";
import type { Deroule } from "../pages/SuiviPartie";
import Modal from "./Modal";
import Chargement from "./Chargement";
import { useResponsive } from "../contexts/ResponsiveContext";
import CardAvertissements from "./gestionPartie/CardAvertissements";
import CardCamera from "./gestionPartie/Camera";
import CardDetailsPartie from "./gestionPartie/CardDetailsPartie";
import CardLancementAudioVolee from "./gestionPartie/CardLancementAudioVolee";
import CardTimelineScenario from "./gestionPartie/CardTimelineScenario";
import ChampDonneesForm from "./ChampDonneesForm";

import "../styles/composants/GestionPartie.css";
import CardTerminalMqtt from "./gestionPartie/CardTerminalMqtt";
import CardInfosMission from "./gestionPartie/CardInfosMission";

export type DetailsPartie = { equipeNom: string; nbrMembres: number; scenarioNom: string; nbrMissions: number; dateDebut: string; nbrEtapes: number } | undefined;

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
    setDeroule: React.Dispatch<React.SetStateAction<Deroule>>;
};

export type MessageMQTT = {
    topic: string;
    payload: string;
    horodatage: string;
    type?: "ok" | "erreur" | "info" | "";
};
export default function GestionPartie({ deroule, detailsPartie, setListeNotifications, setPartiesEnCours, setDeroule }: Props) {
    const type = import.meta.env.VITE_TYPE_ENV;
    const [now, setNow] = useState<number>(() => Date.now());
    const [messages, setMessages] = useState<MessageMQTT[]>([]);
    const [status, setStatus] = useState<"Connecté" | "Déconnecté">("Déconnecté");
    const [etapeEnCours, setEtapeEnCours] = useState<number>(1);
    const [missionSuivante, setMissionSuivante] = useState<number>();
    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"audioAide" | "lancementAudioVolee">();
    const [eventMission, setEventMission] = useState<string>("");
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
        function calculMissions() {
            if (deroule.filter((etape) => etape.ordre > etapeEnCours && etape.type == "mission")[0]) {
                const missionSuivante = deroule.filter((etape) => etape.ordre > etapeEnCours && etape.type == "mission")[0].ordre;
                setMissionSuivante(missionSuivante);
            } else {
                setMissionSuivante(undefined);
            }
        }

        calculMissions();
    }, [etapeEnCours]);

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
            if (msg !== '{"state": "success"}') {
                setMessages((prev) => [...prev, { topic, payload: msg, horodatage: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }]);
            }

            // Gestion des messages
            const regexConnected = topic.match(/^escape\/mission\/(\d+)\/status$/);
            if (regexConnected) {
                const missionId = regexConnected[1];
                const mission = `Mission ${missionId}`;
                if (msg !== "online") {
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
                } else {
                    console.log("dehors");
                }

                return;
            }

            if (topic == "escape/web/step") {
                const donnees = JSON.parse(payload.toString());
                setEtapeEnCours(Number(donnees.etape));
            }

            // Gestion des messages
            const regexEvent = topic.match(/^escape\/mission\/(\d+)\/event$/);
            if (regexEvent) {
                const missionId = regexEvent[1];
                const missionEnCours = deroule.find((e) => e.type === "mission" && e.ordre === etapeEnCours - 1);
                console.log("===============================================");
                console.log(payload.toString().trim());

                console.log(payload.toString().trim() == '{"state": "success"}');

                if (missionId == missionEnCours?.topicMQTT) {
                    setEventMission(payload.toString().trim());
                }
            }
        });

        client.on("error", (err) => {
            console.error("MQTT error:", err);

            setListeNotifications((prev) => [...prev, { niveau: "erreur", titre: "MQTT", description: "MQTT error:" + err.name }]);

            // setStatus("Erreur");
        });

        client.on("reconnect", () => {
            setListeNotifications((prev) => [...prev, { niveau: "warn", titre: "MQTT", description: "Reconnexion en cours" }]);

            // setStatus("Reconnexion...");
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
            <div className="GestionPartie">
                {estMobile ? (
                    <>
                        <CardDetailsPartie detailsPartie={detailsPartie} setPartiesEnCours={setPartiesEnCours} now={now} etapeEnCours={etapeEnCours} />
                        <CardAvertissements missionsDeconnectee={missionsDeconnectee} />
                        <CardTimelineScenario deroule={deroule} missionSuivante={missionSuivante} />
                        <CardLancementAudioVolee setContenuModal={setContenuModal} setAfficherModal={setAfficherModal} />
                        <CardCamera />
                        <CardTerminalMqtt messages={messages} estConnecte={status == "Connecté"} vider={() => setMessages([])} />
                        <CardInfosMission deroule={deroule} etapeEnCours={etapeEnCours} setContenuModal={setContenuModal} setAfficherModal={setAfficherModal} />
                    </>
                ) : (
                    <>
                        {/* LEFT PANEL */}
                        <div className="scenarioLeft">
                            <CardCamera />
                            <CardTerminalMqtt messages={messages} estConnecte={status == "Connecté"} vider={() => setMessages([])} />
                            <CardAvertissements missionsDeconnectee={missionsDeconnectee} />
                        </div>

                        {/* CENTER PANEL */}
                        <CardTimelineScenario deroule={deroule} missionSuivante={missionSuivante} />
                        {/* RIGHT PANEL */}
                        <div className="scenarioRight">
                            <CardDetailsPartie detailsPartie={detailsPartie} setPartiesEnCours={setPartiesEnCours} now={now} etapeEnCours={etapeEnCours} />
                            <CardLancementAudioVolee setContenuModal={setContenuModal} setAfficherModal={setAfficherModal} />
                        </div>
                        <CardInfosMission deroule={deroule} etapeEnCours={etapeEnCours} setContenuModal={setContenuModal} setAfficherModal={setAfficherModal} eventMission={eventMission} />
                    </>
                )}
            </div>
            {contenuModal == "audioAide" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Lancer des audios d'aide">
                    <table className="tableau">
                        <tbody>
                            {deroule
                                .filter((etape) => etape.ordre == Number(detailModal))[0]
                                .audiosAide.map((audio, key) => (
                                    <tr key={key}>
                                        <td className="tdDetailFichier">{audio.detail}</td>
                                        <td className="tdAction">
                                            <button className="boutonAction">Lancer</button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </Modal>
            )}
            {contenuModal == "lancementAudioVolee" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Génération et lancemen d'audio"
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

                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo" disabled={chargementRequete}>
                            {chargementRequete ? <Chargement variant="button" /> : "Générer et lancer"}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
