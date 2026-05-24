import { useEffect, useState } from "react";
import { useDiapositives } from "../../fonctions/useDiapositives";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AfficherDiapositives({ tableauId }: { tableauId: number[] }) {
    const { urls, chargement } = useDiapositives(tableauId);
    const [imageEnCours, setImageEnCours] = useState(1);

    useEffect(() => {
        console.log(urls);
        console.log(urls[imageEnCours]);
        console.log(tableauId.length);
    }, [urls]);

    useEffect(() => {
        console.log(imageEnCours);
    }, []);
    return (
        <div id="divModalDiapositives">
            {chargement ? (
                <p>Chargement</p>
            ) : (
                <>
                    <div id="divDiaporama">
                        <div className={`divConteneurIcone iconeGauche ${imageEnCours==1 ? "desactiver" : "activer"}`}>
                            <ChevronLeft size={40} onClick={() => setImageEnCours((prev) => (prev > 1 ? prev - 1 : prev))} />
                        </div>
                        <img src={urls[imageEnCours]} alt={`Image n°${imageEnCours}`} />
                        <div className={`divConteneurIcone iconeDroite ${imageEnCours == tableauId.length ? "desactiver" : "activer"}`}>
                            <ChevronRight size={40} onClick={() => setImageEnCours((prev) => (prev < tableauId.length ? prev + 1 : prev))} />
                        </div>
                    </div>
                    <p id="pCompteur">
                        {imageEnCours} / {tableauId.length}
                    </p>
                </>
            )}
        </div>
    );
}
