import { CircleAlert, Tag } from "lucide-react";

type Props = {
    tags: string[] | undefined;
    etat: "EnCours" | "EnAttente" | "Terminée";
};
export default function GestionTags({ tags, etat }: Props) {
    const tagsToDisplay = (() => {
        if (!tags) return [];

        if (tags.includes("Terminée")) return ["Terminée"];
        if (tags.includes("EnAttente")) return ["EnAttente"];

        return tags.filter((tag) => tag !== "EnCours");
    })();
    return (
        <div className="divBadges">
            {tagsToDisplay.map((tag, key) => (
                <span className={`badge ${etat === "EnCours" ? "enCours" : ""}`} key={key}>
                    {etat === "EnCours" ? <CircleAlert size={14} /> : <Tag size={14} />}
                    {tag}
                </span>
            ))}
        </div>
    );
}
