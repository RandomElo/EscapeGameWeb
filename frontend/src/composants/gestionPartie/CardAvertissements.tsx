export default function CardAvertissements({ missionsDeconnectee }: { missionsDeconnectee: string[] }) {
    return (
        missionsDeconnectee.length > 0 && (
            <div className="card avertissementsCard">
                <h3>Avertissements</h3>
                <div>
                    {missionsDeconnectee.map((mission) => (
                        <p>
                            ⚠️ <span className="gras">{mission}</span> est déconnecté
                        </p>
                    ))}
                </div>
            </div>
        )
    );
}
