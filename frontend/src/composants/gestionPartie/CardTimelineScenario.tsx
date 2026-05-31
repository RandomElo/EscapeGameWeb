import { Megaphone, Tag, Volume2 } from "lucide-react";
import type { Deroule } from "../../pages/SuiviPartie";

type Props = {
    deroule: Deroule;
    missionSuivante: number | undefined;
};

export default function CardTimelineScenario({ deroule,  missionSuivante }: Props) {
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
                                </div>
                                <div className="missionSecondeLigne">
                                    <p>{etape.description}</p>
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
