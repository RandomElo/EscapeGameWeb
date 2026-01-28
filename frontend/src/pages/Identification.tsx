import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import "../styles/Identification.css";
import { useRequete } from "../fonctions/requete";
import Modal from "../composants/Modal";

export default function Identification({ mode }: { mode: "connexion" | "inscription" }) {
    const { estAuth, verificationConnexion, chargement } = useAuth();
    const navigation = useNavigate();

    const requete = useRequete();
    const localisation = useLocation();

    const [erreur, setErreur] = useState<{ bloquante: boolean; detail: string } | null>();
    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [typeModal, setTypeModal] = useState<"configuration2FA" | "connexion2FA">();
    const [configuration2FA, setConfiguration2FA] = useState<{ qrCode: string; token2FA: string }>();
    const [connexion2FA, setConnexion2FA] = useState<boolean>(false);

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

    return (
        <>
            <main className="Identification">
                <h1 id="titre"> {mode.charAt(0).toUpperCase() + mode.slice(1)}</h1>
                <div className="ligneSeparation"></div>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();

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

                    <button type="submit" disabled={erreur?.bloquante} className="bouton">
                        {mode === "connexion" ? "Se connecter" : "S'inscrire"}
                    </button>
                </form>
                <div id="divChangementModeAuthentification">
                    <div className="ligneSeparation"></div>
                    {mode === "inscription" ? (
                        <>
                            <p>Vous avez déjà un compte ?</p>
                            <NavLink to="/connexion">Connectez vous</NavLink>
                        </>
                    ) : (
                        <>
                            <p>Vous n'avez pas de compte ?</p>
                            <NavLink to="/inscription">Inscrivez vous</NavLink>
                        </>
                    )}
                </div>
            </main>

            {typeModal == "configuration2FA" && configuration2FA && (
                <Modal estOuvert={afficherModal} empecherFermeture={true}>
                    <div className="configuration2FA">
                        <h2>Configuration 2FA</h2>
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
                            <button type="submit" className="bouton">
                                Valider 2FA
                            </button>
                        </form>
                    </div>
                </Modal>
            )}
            {typeModal == "connexion2FA" && connexion2FA && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)}>
                    <div className="connexion2FA">
                        <h2>Connexion 2FA</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
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
                                    if (!chargement) {
                                        navigation("/"); // navigation finale
                                    }
                                } else {
                                    setErreur({ bloquante: false, detail: reponse.detail });
                                }
                            }}
                        >
                            <ChampDonneesForm id="champ2FA" placeholder="Code 2FA" typeInput="text" focus={true} />

                            <button type="submit" className="bouton">
                                Connexion
                            </button>
                        </form>
                    </div>
                </Modal>
            )}
        </>
    );
}
