import { useState } from "react";
import RetourArriere from "../RetourArriere";
import type { ContenuModal, DerouleItem, RecuperationDonnees } from "../../pages/InterfaceAdministration";
import ChampDonneesForm from "../ChampDonneesForm";
import Chargement from "../Chargement";
import { useRequete } from "../../fonctions/requete";
import { Trash2 } from "lucide-react";

type Scenario = {
    id: number;
    nom: string;
    deroule: DerouleItem[];
};

type Props = {
    scenario: Scenario;
    setContenuModal: React.Dispatch<React.SetStateAction<ContenuModal | undefined>>;
    setDetails2Modal: React.Dispatch<React.SetStateAction<number[]>>;
    setAfficherModal: React.Dispatch<React.SetStateAction<boolean>>;
    recuperationDonnees: (e: RecuperationDonnees) => void;
};

export default function GererDeroulerMissions({ scenario, setContenuModal, setDetails2Modal, setAfficherModal, recuperationDonnees }: Props) {
    const requete = useRequete();

    const [deroule, setDeroule] = useState<DerouleItem[]>(scenario.deroule);

    const [modification, setModification] = useState(false);
    const [chargementRequete, setChargementRequete] = useState(false);

    const changerOrdre = (index: number, nouvelIndex: number) => {
        setDeroule((prev) => {
            const liste = [...prev];

            const [item] = liste.splice(index, 1);
            liste.splice(nouvelIndex, 0, item);

            return liste.map((el, i) => ({
                ...el,
                ordre: i,
            }));
        });

        setModification(true);
    };

    const modifierConfiguration = (index: number, valeur: string) => {
        setDeroule((prev) => prev.map((el, i) => (i === index ? { ...el, configuration: valeur } : el)));
        setModification(true);
    };

    return (
        <div id="divModalListeMissionScenario">
            <RetourArriere clique={() => setContenuModal("menuScenario")} />

            <h1>Dérouler du scénario</h1>

            <div id="divListeMission">
                <table>
                    <thead>
                        <tr>
                            <th>Ordre</th>
                            <th>Nom</th>
                            <th>Détails</th>
                            <th>Supprimer</th>
                        </tr>
                    </thead>

                    <tbody>
                        {deroule.map((el, index) => (
                            <tr key={index}>
                                <td>
                                    <select value={el.ordre} onChange={(e) => changerOrdre(index, Number(e.target.value))}>
                                        {deroule.map((_, i) => (
                                            <option key={i} value={i}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td>{el.type === "mission" ? el.mission?.nom : "Audio"}</td>

                                <td>{el.type == "mission" ? <ChampDonneesForm typeInput="texteOnChange" id="inputConfiguration" value={el.configuration} onChange={(valeur) => modifierConfiguration(index, valeur)} /> : el.fichierDetail}</td>
                                <td className="tdSupprimer">
                                    <Trash2 />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modification && (
                <button
                    className="bouton"
                    onClick={async () => {
                        setChargementRequete(true);

                        console.log(deroule);

                        const donnees = deroule.map((etape) => ({ type: etape.type, id: etape.type == "mission" ? etape.mission?.id : etape.fichierId }));
                        console.log(donnees);

                        const reponse = await requete({
                            url: `/admins/scenarios/${scenario.id}/modification-deroule`,
                            methode: "PATCH",
                            corps: { donnees },
                        });

                        setTimeout(() => {
                            recuperationDonnees(reponse);
                            setChargementRequete(false);
                            setAfficherModal(false);
                        }, 1000);
                    }}
                >
                    {chargementRequete ? <Chargement variant="button" /> : "Enregistrer les modifications"}
                </button>
            )}

            <div id="divAjouterElement">
                <button
                    className="bouton"
                    onClick={() => {
                        setDetails2Modal([]);
                        setContenuModal("ajouterMissionScenario");
                    }}
                >
                    Ajouter une mission
                </button>

                <button
                    className="bouton"
                    onClick={() => {
                        setDetails2Modal([]);
                        setContenuModal("ajouterAudioScenario");
                    }}
                >
                    Ajouter un audio
                </button>
            </div>
        </div>
    );
}
