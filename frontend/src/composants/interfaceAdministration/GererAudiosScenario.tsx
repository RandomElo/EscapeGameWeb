import { useEffect, useState } from "react";
import { useRequete } from "../../fonctions/requete";
import type { RecuperationDonnees } from "../../pages/InterfaceAdministration";

type Missions = {
    id: number;
    nom: string;
    description: string;
    ipAdresse: string;
    configuration: string;
    scenarios: { scenarioId: number; ordre: number; configuration: string }[];
}[];

type Props = {
    idScenario: string;
    missions: Missions;
    recuperationDonnees: (e: RecuperationDonnees) => void;
};

export default function GererAudiosScenario({ idScenario, missions, recuperationDonnees }: Props) {
    const requete = useRequete();

    const [chargementRequete, setChargmentRequete] = useState<boolean>(false);
    const [missionsTriees, setMissionTriees] = useState<Missions>([]);

    useEffect(() => {
        function tri() {
            setMissionTriees(missions.filter((mission) => !mission.scenarios.some((scenario) => scenario.scenarioId === Number(idScenario))));
        }
        tri();
    }, [missions, idScenario]);

    return (
        <div id="divModalGererAudiosScenario">
            <h1>Gérer les audios</h1>
            {missions.map((mission) => <p>{mission.nom}</p>)}
        </div>
    );
}
