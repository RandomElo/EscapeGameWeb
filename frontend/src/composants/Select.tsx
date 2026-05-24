import type { ReactNode } from "react";

type Props = {
    id?: string;
    classe?: string;
    label?: string;
    children: ReactNode;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => void;
    value?: number;
};
export default function Select({ id, classe, label, children, onChange, value }: Props) {
    return (
        <div className="Select">
            {label && (
                <label htmlFor={id} className="labelComposants">
                    {label}
                </label>
            )}

            <select className={`selecteur ${classe}`} required id={id && id} onChange={onChange && onChange} value={value && value}>
                {children}
            </select>
        </div>
    );
}
