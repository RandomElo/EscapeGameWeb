import { useState } from "react";
import "../styles/InformationsLegales.css";
import { NavLink } from "react-router-dom";

export default function InformationsLegales() {
    const [elementAfficher, setElementAfficher] = useState<"mentionsLegales" | "cgu">("mentionsLegales");

    return (
        <div className="InformationsLegales">
            <div className="entetePage">
                <h1 className="titrePage">Informations Légales</h1>
                <p className="sousTitrePage">Mentions légales · Conditions générales d'utilisation</p>
            </div>

            <div className="onglets">
                <button className={`onglet ${elementAfficher == "mentionsLegales" && "actif"}`} onClick={() => setElementAfficher("mentionsLegales")}>
                    Mentions légales
                </button>
                <button className={`onglet ${elementAfficher == "cgu" && "actif"}`} onClick={() => setElementAfficher("cgu")}>
                    CGU
                </button>
            </div>
            {elementAfficher == "mentionsLegales" ? (
                <div id="contenuMl" className="sectionLegale">
                    <div className="blocLegal">
                        <span className="titreBlocLegal">Éditeur du site</span>
                        <div className="corpsBlocLegal">
                            <p>
                                Eloi Bontron — Site réalisé dans le cadre d'un <NavLink to={"/"}>projet de fin d'études</NavLink>.
                            </p>
                            <p className="pMail">eloi.random@gmail.com</p>
                        </div>
                    </div>
                    <hr className="separateurSection" />
                    <div className="blocLegal">
                        <span className="titreBlocLegal">Hébergement</span>
                        <div className="corpsBlocLegal">
                            <p>Auto-hébergé.</p>
                        </div>
                    </div>
                    <hr className="separateurSection" />
                    <div className="blocLegal">
                        <span className="titreBlocLegal">Propriété intellectuelle</span>
                        <div className="corpsBlocLegal">
                            <p>Le site et son contenu sont protégés. Toute reproduction est interdite.</p>
                        </div>
                    </div>
                    <hr className="separateurSection" />
                    <div className="blocLegal">
                        <span className="titreBlocLegal">Attributions</span>
                        <div className="corpsBlocLegal">
                            <ul className="listeLegale">
                                <li>
                                    <a href="https://github.com/facebook/react?tab=MIT-1-ov-file">React</a> (MIT License – Meta)
                                </li>
                                <li>
                                    <a href="https://github.com/expressjs/express?tab=MIT-1-ov-file">Express.js</a> (MIT License)
                                </li>
                                <li>
                                    <a href="https://lucide.dev/license">Lucide Icons</a> (MIT License)
                                </li>
                                <li>
                                    <a href="https://www.flaticon.com/free-icons/anchor" title="anchor icons">
                                        Anchor icons created by mavadee - Flaticon
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div id="contenuCgu" className="sectionLegale">
                    <div className="blocLegal">
                        <span className="titreBlocLegal">1 · Objet</span>
                        <div className="corpsBlocLegal">
                            <p>Le site permet la gestion et le suivi de parties d'escape game.</p>
                        </div>
                    </div>
                    <hr className="separateurSection" />
                    <div className="blocLegal">
                        <span className="titreBlocLegal">2 · Accès</span>
                        <div className="corpsBlocLegal">
                            <p>L'accès à certaines fonctionnalités nécessite un compte utilisateur.</p>
                        </div>
                    </div>
                    <hr className="separateurSection" />
                    <div className="blocLegal">
                        <span className="titreBlocLegal">3 · Responsabilités</span>
                        <div className="corpsBlocLegal">
                            <p>L'utilisateur est responsable des informations qu'il fournit.</p>
                        </div>
                    </div>
                    <hr className="separateurSection" />
                    <div className="blocLegal">
                        <span className="titreBlocLegal">4 · Données</span>
                        <div className="corpsBlocLegal">
                            <p>Les données sont utilisées uniquement dans le cadre du service.</p>
                        </div>
                    </div>
                    <hr className="separateurSection" />
                    <div className="blocLegal">
                        <span className="titreBlocLegal">5 · Modification</span>
                        <div className="corpsBlocLegal">
                            <p>Les CGU peuvent être modifiées à tout moment.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
