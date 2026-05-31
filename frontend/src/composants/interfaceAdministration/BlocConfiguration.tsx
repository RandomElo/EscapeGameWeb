import { ClipboardCopy } from "lucide-react";
import { useMemo, useState } from "react";

export default function BlocConfiguration({ contenu }: { contenu: object }) {
    const [copie, setCopie] = useState<boolean>(false);
    const texte = useMemo(() => JSON.stringify(contenu), [contenu]);

    const copier = async () => {
        await navigator.clipboard.writeText(texte);

        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    return (
        <div className="blocCode">
            <div className="blocCode">
                <div className="barreBlocCode">
                    <button className={`boutonCopier ${copie ? "copie" : ""}`} onClick={() => copier()}>
                        <ClipboardCopy size={18} />
                        Copier
                    </button>
                </div>
                <div className="contenuBlocCode">{JSON.stringify(contenu)}</div>
            </div>
        </div>
    );
}
