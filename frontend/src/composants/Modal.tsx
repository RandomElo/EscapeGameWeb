import "../styles/composants/Modal.css";
import { ChevronLeft, X } from "lucide-react";
import { type ReactNode } from "react";
import ChampDonneesForm from "./ChampDonneesForm";

interface Props {
    estOuvert: boolean;
    children?: ReactNode;
    fermeture?: () => void;
    taille?: number | null;
    empecherFermeture?: boolean;
    retourArriere?: () => void;
    titre: string;
    boutonValider?: () => void;
    boutonAnnuler?: () => void;
}

export default function Modal({ estOuvert, fermeture, children, taille, empecherFermeture = false, retourArriere, titre, boutonAnnuler, boutonValider }: Props) {
    if (!estOuvert) return null;

    const fermer = () => {
        if (fermeture && !empecherFermeture) {
            fermeture();
        }
    };

    return (
        <div
            className="Modal"
            onClick={fermer}
            onKeyDown={(e) => {
                if (e.code == "Escape") {
                    fermer();
                }
            }}
        >
            <div className="modalConteneur coinsHud" onClick={(e) => e.stopPropagation()} style={{ width: taille ?? undefined }}>
                <div className="modalEntete">
                    {retourArriere && (
                        <span className="boutonRetourArriere">
                            <ChevronLeft size={30} />
                        </span>
                    )}
                    <span className="modalTitre">{titre}</span>
                    <span className="boutonFermer" onClick={fermeture}>
                        <X size={30} />
                    </span>
                </div>
                <div className="modalCorps">{children}</div>
                {(boutonAnnuler || boutonValider) && (
                    <div className="modalPied">
                        {boutonAnnuler && (
                            <button className="boutonDiscret" onClick={boutonAnnuler}>
                                Annuler
                            </button>
                        )}

                        {boutonValider && (
                            <button className="boutonAction" onClick={boutonValider}>
                                Valider
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
