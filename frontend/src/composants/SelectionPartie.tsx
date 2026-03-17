import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Partie = {
    equipeNom: string;
    nbrMembres: number;
    scenarioNom: string;
    nbrMissions: number;
    dateDebut: Date;
    id: string;
};

export default function SelectionPartie({ parties }: { parties: Partie[] }) {
    const navigate = useNavigate();

    function formaterDate(date: Date) {
        return new Date(date).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className="selectionPartie">
            <h2>Choisir une partie</h2>

            <div className="listeParties">
                {parties.map((partie) => (
                    <div key={partie.id} className="cartePartie" onClick={() => navigate(`/suivi-partie/${partie.id}`)}>
                        <div className="header">
                            <span className="equipe">{partie.equipeNom}</span>
                            <span className="date">{formaterDate(partie.dateDebut)}</span>
                        </div>

                        <div className="infos">
                            <div className="bloc">
                                <span className="label">Scénario</span>
                                <span className="valeur">{partie.scenarioNom}</span>
                            </div>

                            <div className="bloc">
                                <span className="label">Équipe</span>
                                <span className="valeur">
                                    {partie.nbrMembres} membre{partie.nbrMembres > 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="bloc">
                                <span className="label">Missions</span>
                                <span className="valeur">{partie.nbrMissions}</span>
                            </div>
                        </div>
                        <button className="primaryButton">
                            <Play size={18} />
                            Sélectionner cette partie
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
