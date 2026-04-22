import { Mic } from "lucide-react";

export default function CardLancementAudioVolee() {
    return (
        <div className="card audioControl">
            <h3>Envoyer un message audio</h3>

            <p className="textSecondary">Enregistrer et envoyer un message vocal aux joueurs.</p>

            <button className="primaryButton">
                <Mic size={18} />
                Enregistrer un message
            </button>
        </div>
    );
}
