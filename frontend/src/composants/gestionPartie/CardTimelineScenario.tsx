import { Megaphone, Volume2 } from "lucide-react";
import GestionTags from "./GestionTags";
import type { Deroule } from "../../pages/SuiviPartie";

type Props = {
    deroule: Deroule;
    setContenuModal: React.Dispatch<React.SetStateAction<"audioAide" | "lancementAudioVolee" | undefined>>;
    setDetailModal: React.Dispatch<React.SetStateAction<string>>;
    setAfficherModal: React.Dispatch<React.SetStateAction<boolean>>;
    missionSuivante: number | undefined;
};

export default function CardTimelineScenario({ deroule, setContenuModal, setDetailModal, setAfficherModal, missionSuivante }: Props) {
    return (
        <div className="scenarioCenter">
            <div className="timeline">
                {deroule.map((etape, index) => (
                    <div key={index} className="timelineBlock">
                        {/* Mission card */}
                        {etape.type == "mission" && (
                            <div className={"card missionCard mission" + etape.etat}>
                                <div className="missionHeader">
                                    <h3>{etape.nom}</h3>
                                    <GestionTags tags={etape.tags} etat={etape.etat} />
                                </div>
                                <div className="missionSecondeLigne">
                                    <p>{etape.description}</p>
                                    {etape.etat == "EnCours" && (
                                        <span
                                            className="aideAudio"
                                            onClick={() => {
                                                setContenuModal("audioAide");
                                                setDetailModal(etape.ordre.toString());
                                                setAfficherModal(true);
                                            }}
                                        >
                                            <Megaphone size={18} className="primaryButton" />
                                        </span>
                                    )}
                                </div>
                                {etape.ordre == missionSuivante && (
                                    <div id="divSkipMission">
                                        <button className="primaryButton">Passer à cette mission</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {etape.type == "audio" && (
                            <div className="audioCard">
                                <Volume2 size={20} />
                                <span>{etape.nom}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
