import { Megaphone, X } from "lucide-react";
import "../styles/composants/Notifications.css";
import { useEffect } from "react";

type Notification = {
    niveau: "succes" | "warn" | "erreur";
    titre: string;
    description: string;
};

interface Props {
    liste: Notification[];
    setListe: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export default function Notifications({ liste, setListe }: Props) {
    useEffect(() => {
        if (liste.length === 0) return;

        const timers = liste.map(
            (_, index) =>
                setTimeout(() => {
                    setListe((prev) => prev.filter((_, i) => i !== index));
                }, 5000), // 5 secondes
        );

        return () => timers.forEach(clearTimeout);
    }, [liste, setListe]);

    return (
        <div className="Notifications">
            {liste.map((notif, key) => (
                <div className={`divNotif ${notif.niveau}`} key={key} style={{ top: key !== 0 ? 24 + key * (70 + 16) : "24" + "px" }}>
                    <div className="croix" onClick={() => setListe(liste.filter((_, index) => index !== key))}>
                        <X size={20} />
                    </div>
                    <div className="icone">
                        <Megaphone size={20} />
                    </div>
                    <div className="contenu">
                        <span className="titre">{notif.titre}</span>
                        <span className="description">{notif.description}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
