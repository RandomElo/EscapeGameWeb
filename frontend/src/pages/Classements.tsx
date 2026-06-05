import { useLoaderData, useNavigate } from "react-router-dom";
import "../styles/Classements.css";
import { useEffect, useState } from "react";

export default function Classements() {
    const donneesLoader = useLoaderData();

    const [classementGeneral, setClassementGeneral] = useState<{ partieId: number; score: number; nomEquipe: string; nbrMembres: number }[]>([
        {
            partieId: 1,
            score: 1250,
            nomEquipe: "Les Devs",
            nbrMembres: 4,
        },
        {
            partieId: 2,
            score: 1180,
            nomEquipe: "Code Warriors",
            nbrMembres: 5,
        },
        {
            partieId: 3,
            score: 980,
            nomEquipe: "Bug Hunters",
            nbrMembres: 3,
        },
        {
            partieId: 4,
            score: 850,
            nomEquipe: "Les Scripts",
            nbrMembres: 6,
        },
    ]);
    const [classementsMissions, setClassementsMissions] = useState<{ missionId: number; score: number; nom: string; description: string; nomEquipe: string; nbrMembres: number }[]>([
        {
            missionId: 1,
            nom: "Scan RFID",
            description: "Scanner les badges dans le bon ordre",
            score: 250,
            nomEquipe: "Les Devs",
            nbrMembres: 4,
        },
        {
            missionId: 2,
            nom: "Décryptage",
            description: "Résoudre le message chiffré",
            score: 180,
            nomEquipe: "Code Warriors",
            nbrMembres: 5,
        },
        {
            missionId: 3,
            nom: "Réseau",
            description: "Configurer le switch",
            score: 320,
            nomEquipe: "Les Devs",
            nbrMembres: 4,
        },
        {
            missionId: 4,
            nom: "Base de données",
            description: "Retrouver les informations cachées",
            score: 150,
            nomEquipe: "Bug Hunters",
            nbrMembres: 3,
        },
        {
            missionId: 5,
            nom: "MQTT",
            description: "Faire communiquer les capteurs",
            score: 210,
            nomEquipe: "Les Scripts",
            nbrMembres: 6,
        },
    ]);

    type Mission = (typeof classementsMissions)[number];
    const meilleursParMission = Object.values(
        classementsMissions.reduce<Record<number, Mission>>((acc, mission) => {
            const current = acc[mission.missionId];

            if (!current || mission.score > current.score) {
                acc[mission.missionId] = mission;
            }

            return acc;
        }, {}),
    );

    useEffect(() => {
        function attributionsValeurs() {
            if (donneesLoader.classementGeneral.length > 0 && donneesLoader.classementsMissions.length > 0) {
                // setClassementGeneral(donneesLoader.classementGeneral);
                // setClassementsMissions(donneesLoader.classementsMissions);
            }
        }
        attributionsValeurs();
    }, [donneesLoader]);
    return (
        <div className="Classements">
            <div className="entetePage">
                <h1 className="titrePage">Classements</h1>
            </div>

            <div className="podium">
                {[...classementGeneral]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((equipe, key) => (
                        <div className="marchePodium" key={key}>
                            <div className="infoBullePodium">
                                <span className="nomEquipePodium">{equipe.nomEquipe}</span>
                                <span className="scorePodium">{equipe.score} pts</span>
                            </div>
                            <div className="marche">{key + 1}</div>
                        </div>
                    ))}
            </div>

            <div className="grilleClassements">
                <div className="carteClassement">
                    <div className="enteteCarte">
                        <span className="titreCarte">Classement général</span>
                        <span className="compteurEntrees">{classementGeneral.length} équipes</span>
                    </div>

                    {[...classementGeneral]
                        .sort((a, b) => b.score - a.score)
                        .map((enregistrement, key) => (
                            <div className="ligneClassement" key={key}>
                                <span className="rangClassement rang1">#{key + 1}</span>
                                <div className="infosLigneClassement">
                                    <span className="nomLigneClassement">{enregistrement.nomEquipe}</span>
                                    <span className="metaLigneClassement">{enregistrement.nbrMembres} membres</span>
                                    <div className="barreScore">
                                        <div className="remplissageScore"></div>
                                    </div>
                                </div>
                                <span className="scoreLigneClassement">{enregistrement.score}</span>
                            </div>
                        ))}
                </div>
                <div className="carteClassement">
                    <div className="enteteCarte">
                        <span className="titreCarte">Records par mission</span>
                        <span className="compteurEntrees">{meilleursParMission.length} missions</span>
                    </div>
                    {meilleursParMission.map((element, key) => (
                        <div className="ligneMission" key={key}>
                            <div className="infosMissionClassement">
                                <div className="nomMissionClassement">{element.nom}</div>
                                <div className="descMissionClassement">{element.description}</div>
                                <div className="equipeMissionClassement">
                                    {element.nomEquipe} · {element.nbrMembres} membres
                                </div>
                            </div>
                            <span className="scoreMissionClassement">{element.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
