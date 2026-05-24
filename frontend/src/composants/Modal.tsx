import "../styles/composants/Modal.css";
import { ChevronLeft, X } from "lucide-react";
import { type ReactNode } from "react";
import ChampDonneesForm from "./ChampDonneesForm";

interface Props {
    children?: ReactNode;
    estOuvert: boolean;
    fermeture?: () => void;
    titre: string;
    taille?: number | null;
    empecherFermeture?: boolean;
    retourArriere?: () => void;
    onSubmit?: (e?: React.SubmitEvent<HTMLFormElement>) => void;
    boutonAnnuler?: () => void;
}

export default function Modal({ estOuvert, fermeture, children, taille, empecherFermeture = false, retourArriere, titre, boutonAnnuler, onSubmit }: Props) {
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
                        <span className="boutonRetourArriere" onClick={retourArriere}>
                            <ChevronLeft size={30} />
                        </span>
                    )}
                    <span className="modalTitre">{titre}</span>
                    {!empecherFermeture && (
                        <span className="boutonFermer" onClick={fermeture}>
                            <X size={30} />
                        </span>
                    )}
                </div>
                <div className="modalCorps">{onSubmit ? <form onSubmit={onSubmit}>{children}</form> : children}</div>
                {boutonAnnuler && (
                    <div className="modalPied">
                        {boutonAnnuler && (
                            <button className="boutonDiscret" onClick={boutonAnnuler}>
                                Annuler
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
