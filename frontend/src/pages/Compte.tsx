import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Compte.css";
import { useEffect, useState, type JSX } from "react";
import { useRequete } from "../fonctions/requete";
import { useAuth } from "../contexts/AuthContext";
import Chargement from "../composants/Chargement";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { TriangleAlert } from "lucide-react";
export default function Compte() {
    const donneesLoader = useLoaderData();
    const requete = useRequete();
    const navigation = useNavigate();
    const [searchParams] = useSearchParams();
    const { estAuth, chargement, deconnexion } = useAuth();

    const token = searchParams.get("token");
    const type = searchParams.get("type");

    const [donnees, setDonnees] = useState<{ nom: string; mail: string; doubleAuthentificationActive: boolean; nbrParties?: number }>();
    const [chargementRequete, setChargementRequete] = useState<"changerMail" | "notificationChangerMdp" | "deconnexion" | "modalNouveauMdp" | "qrCode2FA" | "verifier2FA" | null>(null);

    // --- MODAL ---
    const [afficherModal, setAfficherModal] = useState<boolean>(false); // Oui ou non j'affiche la modal
    const [contenuModal, setContenuModal] = useState<"modifierMail" | "nouveauMdp" | "activer2FA">(); // Défini le contenu de la modal
    const [detailsModal, setDetailsModal] = useState<{ type?: "normal" | "erreur" | "htmlErreur"; html?: JSX.Element; contenu?: string } | null>();
    const [details2Modal, setDetails2Modal] = useState<string>();
    const [erreur, setErreur] = useState<string>();

    useEffect(() => {
        if (!chargement && !estAuth) {
            navigation("/connexion");
        } else {
            function enregistrementDonnees() {
                setDonnees(donneesLoader);
            }
            async function gestionParametresRecherche() {
                if (!token || !type) return;
                if (type == "mdp") {
                    setContenuModal("nouveauMdp");
                    setAfficherModal(true);
                } else if (type == "mail") {
                    await requete({ url: "/utilisateurs/token-changement-mail", methode: "PUT", corps: { token } });
                }
            }
            enregistrementDonnees();
            gestionParametresRecherche();
        }
    }, [estAuth, navigation, chargement]);

    return (
        <>
            <div className="Compte">
                <h1 id="titre">Mon compte</h1>
                <div className="mesInfos">
                    <p>
                        <span className="gras">Nom : </span>
                        {donnees?.nom}
                    </p>
                    <p>
                        <span className="gras">Mail : </span>
                        {donnees?.mail}
                    </p>
                    <p>
                        <span className="gras">2FA : </span>
                        {donnees?.doubleAuthentificationActive ? "active" : "inactive"}
                    </p>

                    {donnees?.nbrParties && (
                        <p>
                            <span className="gras">Nombres de parties jouées :</span>
                            {donnees?.nbrParties}
                        </p>
                    )}
                </div>

                <div className="divActions">
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("modifierMail");
                            setDetailsModal(null);
                            setAfficherModal(true);
                        }}
                    >
                        Changer d'adresse mail
                    </button>

                    <button
                        className="bouton"
                        onClick={async () => {
                            setChargementRequete("notificationChangerMdp");
                            await requete({ url: "/utilisateurs/modifier-mdp", methode: "POST" });
                            setTimeout(() => {
                                setDetailsModal({ contenu: "✅ Vérifier votre boîte mail" });
                            }, 1000);
                        }}
                    >
                        {chargementRequete == "notificationChangerMdp" ? detailsModal?.contenu ? detailsModal?.contenu : <Chargement variant="button" /> : "Changer de mot de passe"}
                    </button>
                    {!donnees?.doubleAuthentificationActive && (
                        <button
                            className="bouton"
                            onClick={async () => {
                                setChargementRequete("qrCode2FA");
                                const reponse = await requete({ url: "/utilisateurs/qr-code-2fa", methode: "POST" });
                                setTimeout(() => {
                                    setDetails2Modal(reponse);
                                    setContenuModal("activer2FA");
                                    setChargementRequete(null);
                                    setAfficherModal(true);
                                }, 1000);
                            }}
                        >
                            {chargementRequete == "qrCode2FA" ? detailsModal?.contenu ? detailsModal?.contenu : <Chargement variant="button" /> : "Activer la 2FA"}
                        </button>
                    )}

                    <button
                        className="bouton rouge"
                        onClick={async () => {
                            setChargementRequete("deconnexion");
                            await requete({ url: "/utilisateurs/deconnexion", methode: "DELETE" });
                            setTimeout(() => {
                                deconnexion();
                                setChargementRequete(null);
                                navigation("/connexion");
                            }, 1000);
                        }}
                    >
                        {chargementRequete == "deconnexion" ? <Chargement variant="button" /> : "Déconnexion"}
                    </button>
                </div>
            </div>
            <Modal
                estOuvert={afficherModal}
                fermeture={() => {
                    setAfficherModal(false);
                    setDetailsModal(null);
                }}
            >
                {contenuModal == "modifierMail" && (
                    <div id="divModalModifierMail">
                        <h1>Changer d'adresse mail</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete("changerMail");
                                const mail = document.querySelector<HTMLInputElement>("#inputMail")!.value.trim();
                                await requete({ url: "/utilisateurs/modifier-mail", methode: "PUT", corps: { mail } });
                                setTimeout(() => {
                                    setDetailsModal({ contenu: "✅ Vérifier votre boîte mail" });
                                    setChargementRequete(null);
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm
                                id="inputMail"
                                label="Nouvelle adresse mail :"
                                typeInput="text"
                                focus={true}
                                placeholder="exemple@gmail.com"
                                onBlur={(e) => {
                                    const valeur = e.target.value.trim();
                                    const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                                    if (valeur && !regexMail.test(valeur)) {
                                        setErreur("Pseudo invalide.");
                                    } else {
                                        setErreur("");
                                    }
                                }}
                            />
                            {erreur && (
                                <div id="divErreurFormulaire">
                                    <TriangleAlert />
                                    <p id="pErreur">{erreur}</p>
                                </div>
                            )}
                            {detailsModal ? (
                                <button className="bouton" disabled>
                                    {detailsModal.contenu}
                                </button>
                            ) : (
                                <button type="submit" className="bouton">
                                    Enregistrer
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {contenuModal == "nouveauMdp" && (
                    <div id="divModalNouveauMdp">
                        <h2>Saisir le nouveau mot de passe</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete("modalNouveauMdp");
                                const mdp = document.querySelector<HTMLInputElement>("#nouveauMdp")!.value.trim();
                                const reponse = await requete({ url: "/utilisateurs/validation-modifier-mdp", methode: "PUT", corps: { token, mdp } });

                                setTimeout(() => {
                                    setChargementRequete(null);
                                    if (reponse.modifier) {
                                        setDetailsModal({ type: "normal", contenu: "✅ Mot de passe modifier avec succès" });
                                        setTimeout(() => {
                                            setDetailsModal(null);
                                            setAfficherModal(false);
                                            navigation("/mon-compte");
                                        }, 1000);
                                    } else {
                                        if (reponse.detail == "Erreur utilisateur") {
                                            setDetailsModal({
                                                type: "htmlErreur",
                                                html: (
                                                    <p id="pConnecterMauvaisUtilisateur">
                                                        Vous n'êtes pas connecter avec le bonne utilisateur. Cliquez{" "}
                                                        <a
                                                            onClick={async (e) => {
                                                                e.preventDefault();

                                                                await requete({ url: "/utilisateurs/deconnexion", methode: "DELETE" });
                                                                deconnexion();
                                                                navigation("/connexion");
                                                            }}
                                                            id="lienDeconnexion"
                                                        >
                                                            ici
                                                        </a>{" "}
                                                        pour vous déconnecter
                                                    </p>
                                                ),
                                            });
                                        } else {
                                            setDetailsModal({ type: "erreur", contenu: reponse.detail });
                                        }
                                    }
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="nouveauMdp" typeInput="password" />

                            {detailsModal && (
                                <div id="divDetailsModal">
                                    {detailsModal.type === "normal" && <p id="pMdpChanger">{detailsModal.contenu}</p>}

                                    {detailsModal.type === "erreur" && (
                                        <div id="divErreurFormulaire">
                                            <TriangleAlert />
                                            <p id="pErreur">{detailsModal.contenu}</p>
                                        </div>
                                    )}

                                    {detailsModal.type === "htmlErreur" && detailsModal.html}
                                </div>
                            )}

                            {(!detailsModal || detailsModal.type !== "normal") && (
                                <button type="submit" className="bouton">
                                    {chargementRequete === "modalNouveauMdp" ? <Chargement variant="button" /> : "Enregistrer"}
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {contenuModal == "activer2FA" && (
                    <div className="configuration2FA">
                        <h2>Configuration 2FA</h2>
                        <p id="pEtape1">1. QR Code à scanner sur votre application OTP</p>
                        <img src={details2Modal} />
                        <p id="pEtape2">2. Saisir le code afficher sur l'application</p>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setChargementRequete("verifier2FA");
                                const code = document.querySelector<HTMLInputElement>("#champ2FA")!.value;
                                const reponse = await requete({
                                    url: "/utilisateurs/initialisation-code-2FA",
                                    methode: "POST",
                                    corps: { code },
                                });
                                setTimeout(() => {
                                    if (reponse.active) {
                                        setDetailsModal({ type: "normal", contenu: "✅ Double authentification activée" });
                                        setTimeout(() => {
                                            setDonnees(reponse.detail);
                                            setAfficherModal(false);
                                        }, 1000);
                                    } else {
                                        setDetailsModal({ type: "erreur", contenu: reponse.detail });
                                    }
                                }, 1000);
                            }}
                        >
                            <ChampDonneesForm id="champ2FA" placeholder="Code 2FA" typeInput="text" focus={true} />

                            {detailsModal && (
                                <div id="divDetailsModal">
                                    {detailsModal.type === "normal" && <p id="pMdpChanger">{detailsModal.contenu}</p>}

                                    {detailsModal.type === "erreur" && (
                                        <div id="divErreurFormulaire">
                                            <TriangleAlert />
                                            <p id="pErreur">{detailsModal.contenu}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {(!detailsModal || detailsModal.type !== "normal") && (
                                <button type="submit" className="bouton">
                                    {chargementRequete === "verifier2FA" ? <Chargement variant="button" /> : "Valider 2FA"}
                                </button>
                            )}
                        </form>
                    </div>
                )}
            </Modal>
        </>
    );
}
