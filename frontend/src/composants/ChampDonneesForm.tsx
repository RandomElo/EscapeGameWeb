import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import "../styles/composants/ChampDonneesForm.css";

export default function ChampDonneesForm({ id, classe, label, typeInput = "text", placeholder, onBlur, min, value, pas = 1, modificationDesactiver = false, focus = false }: { id: string; classe?: string; label?: string; placeholder?: string; typeInput?: "text" | "password" | "number" | "date"; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; min?: string; value?: string; pas?: number; modificationDesactiver?: boolean; focus?: boolean }) {
    const [afficherMdp, setAfficherMdp] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (focus) {
            inputRef.current?.focus();
        }
    }, [focus]);

    return (
        <div id={"div" + id} className="ChampDonneesForm">
            {label && <label htmlFor={id}>{label}</label>}

            {typeInput === "password" && (
                <div id="divInputMdp">
                    <input type={afficherMdp ? "texte" : "password"} id={id} className={`input${classe ? ` ${classe}` : ""}`} placeholder={placeholder} onBlur={onBlur} required defaultValue={value} ref={inputRef} />
                    {afficherMdp ? <EyeOff color="#bfbfbf" onClick={() => setAfficherMdp(false)} /> : <Eye color="#bfbfbf" onClick={() => setAfficherMdp(true)} />}
                </div>
            )}
            {typeInput == "number" && <input type="number" id={id} className={`input${classe ? ` ${classe}` : ""}`} placeholder={placeholder} onBlur={onBlur} required min={1} step={pas} defaultValue={value} ref={inputRef} />}

            {typeInput == "date" && <input type="date" id={id} className={`input${classe ? ` ${classe}` : ""}`} required min={min} max={new Date().toISOString().split("T")[0]} defaultValue={value} ref={inputRef} />}

            {typeInput == "text" && <input type="text" id={id} className={`input${classe ? ` ${classe}` : ""}`} placeholder={placeholder} onBlur={onBlur} required defaultValue={value} disabled={modificationDesactiver} ref={inputRef} />}
        </div>
    );
}
