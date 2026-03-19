interface LoaderProps {
    variant: "page" | "button";
    /** Texte affiché sous le loader en mode page */
    label?: string;
}

export default function Chargement({ variant, label = "Chargement en cours ..." }: LoaderProps) {
    return (
        <div className="Chargement">
            {variant == "page" ? (
                <div className="loader-page-overlay" role="status" aria-label="Chargement">
                    <div className="loader-page-inner">
                        <div className="loader-ring loader-ring--page">
                            <span />
                        </div>
                        {label && <p className="loader-page-label">{label}</p>}
                    </div>
                </div>
            ) : (
                <span className="loader-ring loader-ring--button" role="status" aria-label="Chargement">
                    <span />
                </span>
            )}
        </div>
    );
}
