import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import "../styles/composants/ChampDonneesForm.css";

type PropsChampDonneesForm = {
    id: string;
    classe?: string;
    label?: string;
    placeholder?: string;
    typeInput?: "text" | "password" | "number" | "date" | "textarea";
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onChange?: (valeur: string) => void; // <-- renvoie directement la valeur
    min?: string;
    value?: string;
    pas?: number;
    modificationDesactiver?: boolean;
    focus?: boolean;
};

export default function ChampDonneesForm({ id, classe, label, typeInput = "text", placeholder, onBlur, onChange, min, value, pas = 1, modificationDesactiver = false, focus = false }: PropsChampDonneesForm) {
    const [afficherMdp, setAfficherMdp] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        if (focus) {
            inputRef.current?.focus();
        }
    }, [focus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange && onChange(e.target.value); // renvoie la valeur directement
    };

    return (
        <div id={"div" + id} className="ChampDonneesForm">
            {label && <label htmlFor={id}>{label}</label>}

            {typeInput === "password" && (
                <div id="divInputMdp">
                    <input type={afficherMdp ? "text" : "password"} id={id} className={`input${classe ? ` ${classe}` : ""}`} placeholder={placeholder} onBlur={onBlur} onChange={handleChange} value={value || ""} ref={inputRef} disabled={modificationDesactiver} />
                    {afficherMdp ? <EyeOff color="#bfbfbf" onClick={() => setAfficherMdp(false)} /> : <Eye color="#bfbfbf" onClick={() => setAfficherMdp(true)} />}
                </div>
            )}

            {typeInput === "number" && <input type="number" id={id} className={`input${classe ? ` ${classe}` : ""}`} placeholder={placeholder} onBlur={onBlur} onChange={handleChange} value={value || ""} min={min || "1"} step={pas} ref={inputRef} disabled={modificationDesactiver} />}

            {typeInput === "date" && <input type="date" id={id} className={`input${classe ? ` ${classe}` : ""}`} onBlur={onBlur} onChange={handleChange} value={value || ""} min={min} max={new Date().toISOString().split("T")[0]} ref={inputRef} disabled={modificationDesactiver} />}

            {typeInput === "text" && <input type="text" id={id} className={`input${classe ? ` ${classe}` : ""}`} placeholder={placeholder} onBlur={onBlur} onChange={handleChange} value={value || ""} ref={inputRef} disabled={modificationDesactiver} />}

            {typeInput === "textarea" && <textarea id={id} className={`textarea input${classe ? ` ${classe}` : ""}`} placeholder={placeholder} onBlur={onBlur} onChange={handleChange} value={value || ""} ref={inputRef} disabled={modificationDesactiver} />}
        </div>
    );
}
