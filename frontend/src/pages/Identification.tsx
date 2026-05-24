import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import "../styles/Identification.css";
import { useRequete } from "../fonctions/requete";
import Modal from "../composants/Modal";
import Chargement from "../composants/Chargement";

export default function Identification({ mode }: { mode: "connexion" | "inscription" }) {
    const { estAuth, verificationConnexion, chargement } = useAuth();
    const navigation = useNavigate();

    const requete = useRequete();
    const localisation = useLocation();

    const [rechercheParametres] = useSearchParams();

    const [erreur, setErreur] = useState<{ bloquante: boolean; detail: string } | null>();
    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [typeModal, setTypeModal] = useState<"configuration2FA" | "connexion2FA">();
    const [configuration2FA, setConfiguration2FA] = useState<{ qrCode: string; token2FA: string }>();
    const [connexion2FA, setConnexion2FA] = useState<boolean>(false);
    const [mail, setMail] = useState<string>();
    const [chargementRequete, setChargementRequete] = useState<boolean>(false);

    interface CorpsRequete {
        nom?: string;
        mail: string;
        mdp: string;
        token?: string;
        doubleAuthentification?: boolean;
    }

    // Si je suis déjà auth je retourne vers l'accueil
    useEffect(() => {
        if (estAuth) {
            navigation("/");
        }
    }, [estAuth, navigation]);

    // Si je change de mode d'auth alors je changer aussi
    useEffect(() => {
        setErreur(null);
    }, [localisation]);

    useEffect(() => {
        const recuperationToken = async () => {
            const t = rechercheParametres.get("token");
            if (t) {
                const reponse = await requete({ url: `/utilisateurs/details-token?token=${t}` });
                if (!reponse.trouver) {
                    return navigation("/" + mode);
                } else {
                    setMail(reponse.mail);
                }
            }
        };
        recuperationToken();
    }, [rechercheParametres]);

    return (
        <>
            {/* <main className="Identification">
                <h1 id="titre"> {mode.charAt(0).toUpperCase() + mode.slice(1)}</h1>
                <div className="ligneSeparation"></div>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setChargementRequete(true);

                        const corpsRequete: CorpsRequete = {
                            mail: document.querySelector<HTMLInputElement>("#champMail")!.value,
                            mdp: document.querySelector<HTMLInputElement>("#champMdp")!.value,
                        };
                        if (mode == "inscription") {
                            corpsRequete.nom = document.querySelector<HTMLInputElement>("#champNom")!.value;
                            corpsRequete.doubleAuthentification = document.querySelector<HTMLInputElement>("#checkbox2FA")?.checked;
                            // je doit verifier si je doit activer la 2FA
                        }
                        const reponse = await requete({ url: `/utilisateurs/${mode}`, methode: "POST", corps: corpsRequete });

                        if (reponse == "connexion2FA") {
                            setTypeModal("connexion2FA");
                            setAfficherModal(true);
                            setConnexion2FA(true);
                        } else if (reponse?.message == "Parametrage 2FA") {
                            const qrCode = await requete({ url: `/utilisateurs/generer-2fa`, methode: "POST", corps: { token: reponse.token2FA } });
                            setConfiguration2FA({ qrCode, token2FA: reponse.token2FA });
                            setTypeModal("configuration2FA");
                            setAfficherModal(true);
                        } else if (reponse.compte) {
                            await verificationConnexion();
                            if (!chargement) {
                                navigation("/");
                            }
                        } else {
                            setErreur({ bloquante: false, detail: reponse.detail });
                        }
                    }}
                >
                    <div id="divChamps">
                        {mode === "inscription" && (
                            <ChampDonneesForm
                                id="champNom"
                                label="Nom"
                                placeholder="Exemple"
                                onBlur={(e) => {
                                    const valeur = e.target.value.trim();
                                    console.log(valeur);
                                    const regexNom = /^[a-zA-Z0-9_-]+$/;

                                    if (valeur && !regexNom.test(valeur)) {
                                        setErreur({ bloquante: true, detail: "Pseudo invalide." });
                                    } else {
                                        setErreur(null);
                                    }
                                }}
                            />
                        )}

                        <ChampDonneesForm
                            id="champMail"
                            classe={mode == "inscription" && mail ? "inputMailDefini" : ""}
                            label="Adresse mail"
                            placeholder="exemple@mail.com"
                            onBlur={(e) => {
                                const valeur = e.target.value.trim();
                                const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                                if (valeur && !regexMail.test(valeur)) {
                                    setErreur({ bloquante: true, detail: "Adresse mail invalide." });
                                } else {
                                    setErreur(null);
                                }
                            }}
                            value={mode == "inscription" && mail ? mail : ""}
                            modificationDesactiver={!!(mode == "inscription" && mail)}
                        />

                        <ChampDonneesForm
                            id="champMdp"
                            label="Mot de passe"
                            typeInput="password"
                            placeholder="au moins 8 caractères"
                            onBlur={(e) => {
                                if (mode == "inscription") {
                                    const valeur = e.target.value.trim();
                                    const regexMdp = /^.{8,}$/;

                                    if (valeur && !regexMdp.test(valeur)) {
                                        // setErreur({ bloquante: true, detail: "Mot de passe trop court ." });
                                    } else {
                                        setErreur(null);
                                    }
                                }
                            }}
                        />
                    </div>
                    {mode === "inscription" && (
                        <div id="divActiver2FA">
                            <input type="checkbox" id="checkbox2FA" />

                            <label htmlFor="checkbox2FA">Activer la 2FA</label>
                        </div>
                    )}

                    {erreur && (
                        <div id="divErreurFormulaire">
                            <TriangleAlert />
                            <p id="pErreur">{erreur.detail}</p>
                        </div>
                    )}

                    <button type="submit" disabled={erreur?.bloquante || chargementRequete} className="bouton">
                        {chargementRequete ? <Chargement variant="button" /> : mode === "connexion" ? "Se connecter" : "S'inscrire"}
                    </button>
                </form>
                <div id="divChangementModeAuthentification">
                    <div className="ligneSeparation"></div>
                    {mode === "inscription" ? (
                        <>
                            <p>Vous avez déjà un compte ?</p>
                            <NavLink to="/connexion">Connectez- vous</NavLink>
                        </>
                    ) : (
                        <>
                            <p>Vous n'avez pas de compte ?</p>
                            <NavLink to="/inscription">Inscrivez vous</NavLink>
                        </>
                    )}
                </div>
            </main> */}
            <div className="Identification">
                <div className="carteIdentification">
                    <div className="enteteIdentification">
                        <h1 className="titreIdentification">{mode.charAt(0).toUpperCase() + mode.slice(1)}</h1>
                    </div>
                    <form
                        className="formulaireIdentification"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setChargementRequete(true);

                            const corpsRequete: CorpsRequete = {
                                mail: document.querySelector<HTMLInputElement>("#champMail")!.value,
                                mdp: document.querySelector<HTMLInputElement>("#champMdp")!.value,
                            };
                            if (mode == "inscription") {
                                corpsRequete.nom = document.querySelector<HTMLInputElement>("#champNom")!.value;
                                corpsRequete.doubleAuthentification = document.querySelector<HTMLInputElement>("#checkbox2FA")?.checked;
                            }
                            const reponse = await requete({ url: `/utilisateurs/${mode}`, methode: "POST", corps: corpsRequete });

                            if (reponse == "connexion2FA") {
                                setTypeModal("connexion2FA");
                                setAfficherModal(true);
                                setConnexion2FA(true);
                            } else if (reponse?.message == "Parametrage 2FA") {
                                const qrCode = await requete({ url: `/utilisateurs/generer-2fa`, methode: "POST", corps: { token: reponse.token2FA } });
                                setConfiguration2FA({ qrCode, token2FA: reponse.token2FA });
                                setTypeModal("configuration2FA");
                                setAfficherModal(true);
                            } else if (reponse.compte) {
                                await verificationConnexion();
                                if (!chargement) {
                                    navigation("/");
                                }
                            } else {
                                setErreur({ bloquante: false, detail: reponse.detail });
                            }
                        }}
                    >
                        {mode == "inscription" && (
                            <ChampDonneesForm
                                id="champNom"
                                label="Nom"
                                placeholder="Louis Armand"
                                onBlur={(e) => {
                                    const valeur = e.target.value.trim();
                                    const regexNom = /^[a-zA-Z0-9_-]{6,}$/;
                                    if (valeur && !regexNom.test(valeur)) {
                                        setErreur({ bloquante: true, detail: "Le pseudo doit contenir au moins 6 caractères et uniquement des lettres, chiffres, _ ou -." });
                                    } else {
                                        setErreur(null);
                                    }
                                }}
                            />
                        )}
                        <ChampDonneesForm
                            id="champMail"
                            label="Adresse mail"
                            placeholder="louis.armand@sncf.com"
                            onBlur={(e) => {
                                const valeur = e.target.value.trim();
                                const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                                if (valeur && !regexMail.test(valeur)) {
                                    setErreur({ bloquante: true, detail: "Adresse mail invalide." });
                                } else {
                                    setErreur(null);
                                }
                            }}
                        />
                        <ChampDonneesForm
                            id="champMdp"
                            label="Mot de passe"
                            typeInput="password"
                            placeholder={mode == "inscription" ? "au moins 8 caractères" : ""}
                            onBlur={(e) => {
                                if (mode == "inscription") {
                                    const valeur = e.target.value.trim();
                                    const regexMdp = /^.{8,}$/;

                                    if (valeur && !regexMdp.test(valeur)) {
                                        setErreur({ bloquante: true, detail: "Le mot de passe doit contenir au moins 8 caractères." });
                                    } else {
                                        setErreur(null);
                                    }
                                }
                            }}
                        />

                        {mode == "inscription" && (
                            <div className="ligne2FA">
                                <input type="checkbox" id="checkbox2FA" />
                                <label htmlFor="checkbox2FA">Activer la double authentification (2FA)</label>
                            </div>
                        )}
                        {erreur && (
                            <div className="blocErreur">
                                <TriangleAlert size={18} />
                                <span>{erreur.detail}</span>
                            </div>
                        )}
                        <button type="submit" disabled={erreur?.bloquante || chargementRequete} className="boutonAction boutonSoumettre">
                            {chargementRequete ? <Chargement variant="button" /> : mode === "connexion" ? "Se connecter" : "S'inscrire"}
                        </button>
                        <div className="changementMode">
                            {mode == "connexion" ? (
                                <>
                                    <p>Vous n'avez pas de compte ?</p>
                                    <NavLink to="/inscription" className="lienChangementMode">
                                        Inscrivez-vous
                                    </NavLink>
                                </>
                            ) : (
                                <>
                                    <p>Vous avez déjà un compte ?</p>
                                    <NavLink to="/connexion" className="lienChangementMode">
                                        Connectez-vous
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            {typeModal == "configuration2FA" && configuration2FA && (
                <Modal estOuvert={afficherModal} empecherFermeture={true} titre="Configuration 2FA">
                    <div className="modalConfiguration2FA">
                        <p id="pEtape1">1. QR Code à scanner sur votre application OTP</p>
                        <img src={configuration2FA.qrCode} />
                        <p id="pEtape2">2. Saisir le code afficher sur l'application</p>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const code = document.querySelector<HTMLInputElement>("#champ2FA")!.value;
                                const reponse = await requete({
                                    url: "/utilisateurs/verifier-2fa",
                                    methode: "POST",
                                    corps: { code, token: configuration2FA.token2FA },
                                });
                                if (reponse.compte) {
                                    setConfiguration2FA(undefined); // cache le QR code
                                    await verificationConnexion();
                                    if (!chargement) {
                                        navigation("/"); // navigation finale
                                    }
                                } else {
                                    setErreur({ bloquante: false, detail: reponse.detail });
                                }
                            }}
                        >
                            <ChampDonneesForm id="champ2FA" placeholder="Code 2FA" typeInput="text" focus={true} />
                            <div className="modalPied">
                                <button type="submit" className="boutonAction solo">
                                    Valider 2FA
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
            {typeModal == "connexion2FA" && connexion2FA && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Connexion 2FA"
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);
                        const corpsRequete: CorpsRequete = {
                            mail: document.querySelector<HTMLInputElement>("#champMail")!.value,
                            mdp: document.querySelector<HTMLInputElement>("#champMdp")!.value,
                            token: document.querySelector<HTMLInputElement>("#champ2FA")!.value,
                        };

                        const reponse = await requete({ url: `/utilisateurs/connexion`, methode: "POST", corps: corpsRequete });
                        if (reponse == "2FA") {
                            setConnexion2FA(true);
                        } else if (reponse.compte) {
                            await verificationConnexion();
                            setChargementRequete(false);
                            if (!chargement) {
                                navigation("/"); // navigation finale
                            }
                        } else {
                            setErreur({ bloquante: false, detail: reponse.detail });
                        }
                    }}
                >
                    <ChampDonneesForm id="champ2FA" placeholder="Code 2FA" typeInput="text" focus={true} />

                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo" disabled={chargement}>
                            {chargement ? <Chargement variant="button" /> : "Connexion"}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
