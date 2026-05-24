type Props = {
    id: string;
    label: string;
    donnees?: { cle: string; valeur: string }[];
};
export default function Checkbox({ id, label, donnees }: Props) {
    return (
        <div className="Checkbox">
            <label htmlFor={id} className="labelComposants">
                {label}
            </label>
            <div className="listeSelection">
                {donnees?.map((element) => (
                    <div className="elementSelection">
                        <input type="checkbox" id={element.cle} />
                        <label htmlFor={element.cle}>{element.valeur}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}
