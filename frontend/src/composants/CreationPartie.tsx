import { Gamepad2, Play, Users } from "lucide-react";
import { useRequete } from "../fonctions/requete";
import Chargement from "./Chargement";
import { useRevalidator } from "react-router-dom";
import "../styles/composants/CreationPartie.css";
import Select from "./Select";
type Props = {
    lancementPartie: {
        scenario: string;
        equipe: string;
    };
    setLancementPartie: React.Dispatch<
        React.SetStateAction<{
            scenario: string;
            equipe: string;
        }>
    >;

    scenarios: {
        id: number;
        nom: string;
        description: string;
    }[];

    equipes: {
        id: number;
        nom: string;
    }[];

    erreur: string;
    setErreur: React.Dispatch<React.SetStateAction<string>>;

    setPartiesEnCours: React.Dispatch<React.SetStateAction<boolean>>;

    setDetailsPartie: React.Dispatch<
        React.SetStateAction<
            | {
                  equipeNom: string;
                  nbrMembres: number;
                  scenarioNom: string;
                  nbrMissions: number;
                  dateDebut: string;
              }
            | undefined
        >
    >;
    chargementInfos: boolean;
};

export default function CreationPartie({ lancementPartie, setLancementPartie, scenarios, equipes, erreur, setErreur, setPartiesEnCours, setDetailsPartie, chargementInfos }: Props) {
    const requete = useRequete();
    const { revalidate } = useRevalidator();
    return (
        <div className="aucunePartie card">
            <div className="header">
                <h1>Aucune partie en cours</h1>
            </div>

            <p className="description">Veuillez sélectionner un scénario et une équipe pour lancer une nouvelle partie.</p>

            <div className="formulaire">
                <Select
                    id="selectScenario"
                    labelJSX={
                        <>
                            <Gamepad2 size={16} /> Scénario
                        </>
                    }
                    onChange={(e) =>
                        setLancementPartie((prev) => ({
                            ...prev,
                            scenario: e.target.value,
                        }))
                    }
                >
                    <option value="" selected disabled>
                        {scenarios.length > 0 ? "Sélectionner un scénario" : "⚠️ Merci de crée un scénario"}
                    </option>
                    {scenarios?.map((scenario, key) => (
                        <option value={scenario.id} key={key}>
                            {scenario.nom}
                        </option>
                    ))}
                </Select>

                <Select
                    id="selectEquipe"
                    labelJSX={
                        <>
                            <Gamepad2 size={16} /> Équipe
                        </>
                    }
                    onChange={(e) =>
                        setLancementPartie((prev) => ({
                            ...prev,
                            equipe: e.target.value,
                        }))
                    }
                >
                    <option value="" selected disabled>
                        {equipes.length > 0 ? "Sélectionner une équipe" : "⚠️ Aucune équipe enregistrée (les joueurs doivent en créé une)"}
                    </option>
                    {equipes?.map((equipe, key) => (
                        <option value={equipe.id} key={key}>
                            {equipe.nom}
                        </option>
                    ))}
                </Select>
            </div>

            {erreur && <p id="pErreur">{erreur}.</p>}
            <div className="lancementPartie">
                <button
                    className="boutonAction"
                    onClick={async () => {
                        console.log(lancementPartie);
                        const reponse = await requete({ url: "/admins/parties/lancer", methode: "POST", corps: lancementPartie });
                        revalidate();

                        if (reponse.partieLancer) {
                            setDetailsPartie(reponse.details);
                            setPartiesEnCours(true);
                        } else {
                            setErreur(reponse.details);
                        }
                    }}
                    disabled={!lancementPartie.equipe || !lancementPartie.scenario}
                >
                    <Play size={18} />
                    Lancer la partie
                </button>
            </div>
        </div>
    );
}
