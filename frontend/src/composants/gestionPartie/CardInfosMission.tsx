import { ChevronDown, ChevronUp, Maximize2, Megaphone, Minimize2, Minus, Speaker } from "lucide-react";
import { useState } from "react";
import type { Deroule } from "../../pages/SuiviPartie";
import ChampDonneesForm from "../ChampDonneesForm";

type Props = {
    deroule: Deroule;
    setContenuModal: React.Dispatch<React.SetStateAction<"audioAide" | "lancementAudioVolee" | undefined>>;
    setAfficherModal: React.Dispatch<React.SetStateAction<boolean>>;
    etapeEnCours: number;
    eventMission: string;
};

export default function CardInfosMission({ deroule, etapeEnCours, setContenuModal, setAfficherModal, eventMission }: Props) {
    const [agrandie, setAgrandie] = useState(false);

    const missionEnCours = deroule.find((e) => e.type === "mission" && e.ordre === etapeEnCours - 1);

    if (!missionEnCours) return null;

    return (
        <>
            {/* CARD NORMALE */}
            <div className="cardInfosMission coinsHud" onClick={() => setAgrandie((prev) => !prev)}>
                <div className={`enteteCardMission ${!agrandie && "miniature"}`}>
                    <span className="titreCardMission">Mission en cours</span>
                    <div className="options">
                        <button className="boutonAgrandir">{agrandie ? <ChevronDown size={13} /> : <ChevronUp size={13} />}</button>
                    </div>
                </div>
                {agrandie && (
                    <>
                        <div className="nomMissionEnCours">{missionEnCours.nom}</div>

                        <div className="descriptionMission">{missionEnCours.description}</div>

                        <div className="lignesInfosMission">
                            <div className="ligneInfo etat">
                                <span className="etiquetteInfo">État</span>
                                {eventMission && (
                                    <div className="ligneTagsMission">
                                        <span className="tagMission amber">{eventMission}</span>
                                    </div>
                                )}
                            </div>
                            <div className="ligneInfo">
                                <span className="etiquetteInfo">Ordre</span>
                                <span className="valeurInfo">{missionEnCours.ordre + 1}</span>
                            </div>
                            <div className="ligneInfo">
                                <span className="etiquetteInfo">Topic MQTT</span>
                                <span className="valeurInfo topicMqtt">escape/mission/{missionEnCours.topicMQTT}</span>
                            </div>
                        </div>
                        <div className="lancementAudioAide">
                            <button
                                className="primaryButton"
                                onClick={() => {
                                    setContenuModal("lancementAudioVolee");
                                    setAfficherModal(true);
                                }}
                            >
                                <Megaphone size={18} />
                                Lancer audio d'aide
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
