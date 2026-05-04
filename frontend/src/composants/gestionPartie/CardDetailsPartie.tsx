import { CircleAlert, Power } from "lucide-react";
import { useRequete } from "../../fonctions/requete";
import type { DetailsPartie } from "../GestionPartie";
import { useRevalidator } from "react-router-dom";

type Props = {
    detailsPartie: DetailsPartie;
    setPartiesEnCours: React.Dispatch<React.SetStateAction<boolean>>;
    now: number;
};

export default function CardDetailsPartie({ detailsPartie, setPartiesEnCours, now }: Props) {
    const requete = useRequete();
    const { revalidate } = useRevalidator();
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

    return (
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
                            revalidate();

                            setPartiesEnCours(false);
                        }}
                    >
                        <Power />
                        Terminer la partie
                    </button>
                </div>
            )}
        </div>
    );
}
