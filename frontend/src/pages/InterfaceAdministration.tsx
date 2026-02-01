import { useState } from "react";
import { useRequete } from "../fonctions/requete";

export default function InterfaceAdministration() {
    const requete = useRequete();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    // const [scenarios, setScenarios] = useState<>()
    // const [missions, setMission] = useState<>()
    return (
        <>
            <main className="InterfaceAdministration">
                <h1 id="titre">Interface d'administration</h1>
                {/* Pour les pings */}
                <div id="divCommunicationMissions"></div>
                <div id="divMissions">
                    <button className="bouton">Crée une mission</button>
                </div>
                <div id="divScenarios"></div>
            </main>
        </>
    );
}
