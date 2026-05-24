import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLoaderData, useNavigate } from "react-router-dom";

// import "../styles/SuiviPartie.css";
import Notifications from "../composants/Notifications";
import { useRequete } from "../fonctions/requete";
import CreationPartie from "../composants/CreationPartie";
import GestionPartie from "../composants/GestionPartie";
export type Deroule = {
    ordre: number;
    type: "mission" | "audio";
    nom: string;
    description?: string;
    topicMQTT?: string;
    tag?: string;
    etat: "EnCours" | "EnAttente" | "Terminée";
    audiosAide: { nomFichier: string; detail: string }[];
}[];

export default function SuiviPartie() {
    const { estAuth, role, chargement } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();
    const donneesLoader = useLoaderData();

    const [listeNotifications, setListeNotifications] = useState<{ niveau: "succes" | "warn" | "erreur"; titre: string; description: string }[]>([]);

    const [partiesEnCours, setPartiesEnCours] = useState<boolean>(false);
    const [detailsPartie, setDetailsPartie] = useState<{ equipeNom: string; nbrMembres: number; scenarioNom: string; nbrMissions: number; dateDebut: string }>();

    // Si pas de partie
    const [scenarios, setScenarios] = useState<{ id: number; nom: string; description: string }[]>([]);
    const [equipes, setEquipes] = useState<{ id: number; nom: string }[]>([]);

    // Si partie en cours
    const [deroule, setDeroule] = useState<Deroule>();

    const [lancementPartie, setLancementPartie] = useState<{ scenario: string; equipe: string }>({ scenario: "", equipe: "" });
    const [erreur, setErreur] = useState<string>("");
    const [chargementInfos, setChargementInfos] = useState<boolean>(false);

    useEffect(() => {
        if (!chargement) {
            if (!estAuth) {
                navigation("/connexion");
            } else if (role != "controleur") {
                navigation("/");
            } else {
                async function attributionDonnees() {
                    console.log(donneesLoader);
                    if (donneesLoader.partieEnCours) {
                        console.log(donneesLoader);
                        setDetailsPartie(donneesLoader.detailsPartie);
                        setDeroule(donneesLoader.deroule);
                        setPartiesEnCours(true);
                    } else {
                        console.log("EQUIPESS: " + donneesLoader.equipes);
                        console.log("SCENARIOS: " + donneesLoader.scenarios);
                        setEquipes(donneesLoader.equipes);
                        setScenarios(donneesLoader.scenarios);
                        setPartiesEnCours(false);
                    }
                }
                attributionDonnees();
            }
        }
    }, [estAuth, navigation, partiesEnCours, donneesLoader]);

    return (
        <>
            {partiesEnCours && deroule ? <GestionPartie deroule={deroule} detailsPartie={detailsPartie} setListeNotifications={setListeNotifications} setPartiesEnCours={setPartiesEnCours} /> : <CreationPartie lancementPartie={lancementPartie} setLancementPartie={setLancementPartie} scenarios={scenarios} equipes={equipes} erreur={erreur} setErreur={setErreur} setPartiesEnCours={setPartiesEnCours} setDetailsPartie={setDetailsPartie} chargementInfos={chargementInfos} />}

            <Notifications liste={listeNotifications} setListe={setListeNotifications} />
        </>
    );
}
