import { useEffect, useRef } from "react";
import type { MessageMQTT } from "../GestionPartie";

type Props = {
    messages: MessageMQTT[];
    estConnecte: boolean;
    vider: () => void;
};

export default function CardTerminalMqtt({ messages, estConnecte, vider }: Props) {
    const refTerminal = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (refTerminal.current) {
            refTerminal.current.scrollTop = refTerminal.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="cardTerminalMqtt">
            <div className="enteteTerminal">
                <span className="titreTerminal">MQTT Live</span>
                <span className={`indicateurConnexion ${!estConnecte ? "horsLigne" : ""}`}>
                    <span className={`pointConnexion`} />
                    {estConnecte ? "Connecté" : "Déconnecté"}
                </span>
            </div>
            <div className="corpsTerminal" ref={refTerminal}>
                {messages.map((msg, i) => (
                    <div key={i} className="ligneMqtt">
                        <span className="horodatage">{msg.horodatage}</span>
                        <div className="contenuMqtt">
                            <span className="topicMqtt">{msg.topic}</span>
                            <span className={`payloadMqtt ${msg.type ?? ""}`}>{msg.payload}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="piedTerminal">
                <span className="compteurMessages">{messages.length} messages</span>
                <button className="boutonViderTerminal" onClick={vider}>
                    Vider
                </button>
            </div>
        </div>
    );
}
