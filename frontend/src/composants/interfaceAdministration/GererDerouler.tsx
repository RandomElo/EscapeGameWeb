import { useState } from "react";
import type { ContenuModal, DerouleItem, RecuperationDonnees } from "../../pages/InterfaceAdministration";
import ChampDonneesForm from "../ChampDonneesForm";
import Chargement from "../Chargement";
import { useRequete } from "../../fonctions/requete";
import { MessageCircleQuestionMark, Trash2 } from "lucide-react";
import Select from "../Select";

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

    const [deroule, setDeroule] = useState<DerouleItem[]>(
        scenario.deroule.map((el) => ({
            ...el,
            configurationTexte: el.configuration || "{}",
            configuration: el.configuration ? JSON.parse(el.configuration) : {},
        })),
    );
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
        setDeroule((prev) =>
            prev.map((el, i) => {
                if (i !== index) return el;

                try {
                    return {
                        ...el,
                        configurationTexte: valeur,
                        configuration: JSON.parse(valeur),
                    };
                } catch {
                    return {
                        ...el,
                        configurationTexte: valeur,
                    };
                }
            }),
        );

        setModification(true);
    };

    return (
        <div id="divModalListeMissionScenario">
            <div id="divListeMission">
                <table>
                    <thead>
                        <tr>
                            <th className="tdOrdre">Ordre</th>
                            <th>Nom</th>
                            <th className="tdDetails thDetails">
                                Détails <MessageCircleQuestionMark size={21}  onClick={() => {
                                    setContenuModal("aideConfiguration")
                                }}/>
                            </th>
                            <th className="thSupprimer">Supprimer</th>
                        </tr>
                    </thead>

                    <tbody>
                        {deroule.map((el, index) => (
                            <tr key={index}>
                                <td className="tdOrdre">
                                    <Select classe="selectOrdre" onChange={(e) => changerOrdre(index, Number(e.target.value))} value={el.ordre}>
                                        {deroule.map((_, i) => (
                                            <option key={i} value={i}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </Select>
                                </td>

                                <td>{el.type === "mission" ? el.mission?.nom : "Audio"}</td>

                                <td className="tdDetails">{el.type == "mission" ? <ChampDonneesForm typeInput="texteOnChange" id="inputConfiguration" value={el.configurationTexte} onChange={(valeur) => modifierConfiguration(index, valeur)} /> : el.fichierDetail}</td>

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
                    className="boutonEnregistrerModification boutonAction"
                    onClick={async () => {
                        setChargementRequete(true);
                        console.log(deroule);
                        const donnees = deroule.map((etape) => ({
                            type: etape.type,
                            id: etape.type == "mission" ? etape.mission?.id : etape.fichierId,
                            configuration: etape.type == "mission" ? (typeof etape.configuration === "string" ? etape.configuration : JSON.stringify(etape.configuration)) : "",
                        }));

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
                    className="boutonAction"
                    onClick={() => {
                        setDetails2Modal([]);
                        setContenuModal("ajouterMissionScenario");
                    }}
                >
                    Ajouter une mission
                </button>

                <button
                    className="boutonAction"
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
