import { Mic, SendHorizonal } from "lucide-react";

type Props = {
    setContenuModal: React.Dispatch<React.SetStateAction<"audioAide" | "lancementAudioVolee" | undefined>>;
    setAfficherModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CardLancementAudioVolee({ setContenuModal, setAfficherModal }: Props) {
    return (
        <div className="card audioControl">
            <h3>Envoyer un message audio</h3>

            <p className="textSecondary">Enregistrer et envoyer un message vocal aux joueurs.</p>

            <button
                className="primaryButton"
                onClick={() => {
                    setContenuModal("lancementAudioVolee");
                    setAfficherModal(true);
                }}
            >
                <SendHorizonal size={18} />
                Envoyer un message
            </button>
        </div>
    );
}
