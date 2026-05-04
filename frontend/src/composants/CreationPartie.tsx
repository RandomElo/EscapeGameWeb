import { Gamepad2, Play, Users } from "lucide-react";
import { useRequete } from "../fonctions/requete";
import Chargement from "./Chargement";
import { useRevalidator } from "react-router-dom";

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
                <Gamepad2 size={22} />
                <h2>Aucune partie en cours</h2>
            </div>

            <p className="description">Veuillez sélectionner un scénario et une équipe pour lancer une nouvelle partie.</p>

            <div className="formulaire">
                <div className="champ">
                    <label>Scénario :</label>
                    {chargementInfos ? (
                        <div className="divChargement">
                            <Chargement variant="button" />
                        </div>
                    ) : (
                        <div className="selectWrapper">
                            <Gamepad2 size={16} />

                            <select
                                defaultValue={lancementPartie.scenario}
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
                            </select>
                        </div>
                    )}
                </div>

                <div className="champ">
                    <label>Équipe :</label>
                    {chargementInfos ? (
                        <div className="divChargement">
                            <Chargement variant="button" />
                        </div>
                    ) : (
                        <div className="selectWrapper">
                            <Users size={16} />
                            <select
                                defaultValue={lancementPartie.equipe}
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
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {erreur && <p id="pErreur">{erreur}.</p>}

            <button
                className="primaryButton lancerBouton"
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
    );
}
