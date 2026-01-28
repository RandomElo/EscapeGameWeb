import "../styles/composants/Modal.css";
import { X } from "lucide-react";
import { type ReactNode } from "react";

interface Props {
    estOuvert: boolean;
    children?: ReactNode;
    fermeture?: () => void;
    taille?: number | null;
    empecherFermeture?: boolean;
}

export default function Modal({ estOuvert, fermeture, children, taille, empecherFermeture = false }: Props) {
    if (!estOuvert) return null;

    const fermer = () => {
        if (fermeture && !empecherFermeture) {
            fermeture();
        }
    };

    return (
        <div className="Modal" onClick={fermer}>
            <div className="modalContenu" onClick={(e) => e.stopPropagation()} style={{ width: taille ?? undefined }}>
                {!empecherFermeture && <X className="boutonFermer" width={30} height={30} onClick={fermeture} />}

                <div>{children}</div>
            </div>
        </div>
    );
}
