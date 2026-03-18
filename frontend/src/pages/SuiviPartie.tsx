import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import "../styles/SuiviPartie.css";
import Notifications from "../composants/Notifications";
import { useRequete } from "../fonctions/requete";
import CreationPartie from "../composants/CreationPartie";
import GestionPartie from "../composants/GestionPartie";

export default function SuiviPartie() {
    const { estAuth, role } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();

    const [listeNotifications, setListeNotifications] = useState<{ niveau: "succes" | "warn" | "erreur"; titre: string; description: string }[]>([]);

    const [partiesEnCours, setPartiesEnCours] = useState<boolean>(false);
    const [detailsPartie, setDetailsPartie] = useState<{ equipeNom: string; nbrMembres: number; scenarioNom: string; nbrMissions: number; dateDebut: string }>();

    const [scenarios, setScenarios] = useState<{ id: number; nom: string; description: string }[]>([]);

    const [missions, setMissions] = useState<{ id: number; nom: string; description: string; tags: string[]; etat: string }[]>([]);

    const [equipes, setEquipes] = useState<{ id: number; nom: string }[]>([]);

    const [lancementPartie, setLancementPartie] = useState<{ scenario: string; equipe: string }>({ scenario: "", equipe: "" });
    const [erreur, setErreur] = useState<string>("");

    useEffect(() => {
        if (!estAuth) {
            navigation("/connexion");
        } else if (role != "controleur") {
            navigation("/");
        } else {
            async function recuperation() {
                const reponse = await requete({ url: "/admins/parties/partie-en-cours" });
                console.log(reponse);
                if (!reponse.partieEnCours) {
                    setEquipes(reponse.details.equipes);
                    setScenarios(reponse.details.scenarios);
                    setPartiesEnCours(false);
                } else {
                    setDetailsPartie(reponse.details);
                    setMissions(reponse.details.missions);
                    setPartiesEnCours(true);
                }
            }
            recuperation();
        }
    }, [estAuth, navigation]);
    // const [listeNotifications, setListeNotifications] = useState<{ niveau: "succes" | "warn" | "erreur"; titre: string; description: string }[]>([
    //     { niveau: "succes", titre: "Test", description: "Licorne" },
    //     { niveau: "warn", titre: "Test 2", description: "Licorne" },
    //     { niveau: "erreur", titre: "Test 2", description: "Licorne" },
    //     { niveau: "erreur", titre: "Test 2", description: "Licorne" },
    //     { niveau: "erreur", titre: "Test 2", description: "Licorne" },
    // ]);

    // const missions = [
    //     {
    //         id: 1,
    //         title: "Mission 1",
    //         description: "Diapo + RFID",
    //         tags: ["Terminée"],
    //         etat: "Terminee",
    //     },
    //     {
    //         id: 2,
    //         title: "Mission 2",
    //         description: "Morse",
    //         tags: ["En cours", "1 coordonnée sur 4"],
    //         etat: "EnCours",
    //     },
    //     {
    //         id: 3,
    //         title: "Mission 3",
    //         description: "Map-monde + RFID",
    //         tags: ["En attente"],
    //         etat: "EnAttente",
    //     },
    //     {
    //         id: 4,
    //         title: "Mission 4",
    //         description: "Cablage mot",
    //         tags: ["Final"],
    //         etat: "EnAttente",
    //     },
    // ];
    return (
        <main className="SuiviPartie">
            {partiesEnCours ? <GestionPartie missions={missions} detailsPartie={detailsPartie} setListeNotifications={setListeNotifications} /> : <CreationPartie lancementPartie={lancementPartie} setLancementPartie={setLancementPartie} scenarios={scenarios} equipes={equipes} erreur={erreur} setErreur={setErreur} setPartiesEnCours={setPartiesEnCours} setDetailsPartie={setDetailsPartie} />}

            <Notifications liste={listeNotifications} setListe={setListeNotifications} />
        </main>
    );
}
{
    /* <GestionPartie missions={missions} detailsParties={detailsParties} setListeNotifications={setListeNotifications} /> */
}
