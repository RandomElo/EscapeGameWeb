import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Compte.css";
import { useEffect, useState, type JSX } from "react";
import { useRequete } from "../fonctions/requete";
import { useAuth } from "../contexts/AuthContext";
import Chargement from "../composants/Chargement";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { Check, ChevronLeft, ChevronRight, Lock, LogOut, Mail, ShieldCheck, Trash, Trash2, TriangleAlert, User, X } from "lucide-react";
export default function Compte() {
    const donneesLoader = useLoaderData();
    const requete = useRequete();
    const navigation = useNavigate();
    const [searchParams] = useSearchParams();
    const { estAuth, chargement, deconnexion } = useAuth();

    const token = searchParams.get("token");
    const type = searchParams.get("type");

    const [donnees, setDonnees] = useState<{ nom: string; mail: string; doubleAuthentificationActive: boolean; nbrParties?: number }>();
    const [chargementRequete, setChargementRequete] = useState<"changerMail" | "notificationChangerMdp" | "deconnexion" | "modalNouveauMdp" | "qrCode2FA" | "verifier2FA" | "desactiver2FA" | "supprimerCompte" | null>(null);

    // --- MODAL ---
    const [afficherModal, setAfficherModal] = useState<boolean>(false); // Oui ou non j'affiche la modal
    const [contenuModal, setContenuModal] = useState<"modifierMail" | "nouveauMdp" | "activer2FA" | "supprimerCompte">(); // Défini le contenu de la modal
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
                <div className="inner">
                    <div className="profil-hero">
                        <div className="avatar">
                            <User size={25} />
                        </div>
                        <div>
                            <div className="profil-nom">{donnees?.nom}</div>
                            <div className="profil-mail">{donnees?.mail}</div>
                        </div>
                        <div className="etatConnexion">
                            <span className="badge-ok">
                                <span className="dot"></span>Connecté
                            </span>
                            {donnees?.doubleAuthentificationActive ? (
                                <span className="badge-ok doubleAuthentification">
                                    <Check size={16} />
                                    2FA active
                                </span>
                            ) : (
                                <span className="badge-off doubleAuthentification">
                                    <X size={16} />
                                    2FA inactive
                                </span>
                            )}
                        </div>
                    </div>
                    {donnees?.nbrParties && donnees?.tempsMoyen && (
                        <div className="stats-row">
                            <div className="stat-cell">
                                <div className="stat-num">24</div>
                                <div className="stat-lbl">Parties jouées</div>
                            </div>
                            <div className="stat-cell">
                                <div className="stat-num victoirePartie">12</div>
                                <div className="stat-lbl">Victoires</div>
                            </div>
                            <div className="stat-cell">
                                <div className="stat-num">
                                    15 <span className="pourcentatgePartie">min</span> 30
                                </div>
                                <div className="stat-lbl">Temps moyen</div>
                            </div>
                        </div>
                    )}

                    <div className="section-head">Paramètres du compte</div>

                    <div className="actions-list">
                        <div
                            className="action-row"
                            onClick={() => {
                                setContenuModal("modifierMail");
                                setDetailsModal(null);
                                setAfficherModal(true);
                            }}
                        >
                            <div className="action-icon">
                                <Mail size={20} />
                            </div>
                            <div className="action-text">
                                <div className="action-title">Changer d'adresse mail</div>
                                <div className="action-desc">{donnees?.mail}</div>
                            </div>
                            <ChevronRight size={20} />
                        </div>
                        <div
                            className="action-row"
                            onClick={() => {
                                setContenuModal("nouveauMdp");
                                setAfficherModal(true);
                            }}
                        >
                            <div className="action-icon">
                                <Lock size={20} />
                            </div>
                            <div className="action-text">
                                <div className="action-title">Changer de mot de passe</div>
                                <div className="action-desc">Un lien sera envoyé par mail</div>
                            </div>
                            <ChevronRight size={20} />
                        </div>
                        <div
                            className="action-row"
                            onClick={async () => {
                                setChargementRequete("qrCode2FA");

                                setContenuModal("activer2FA");
                                setAfficherModal(true);

                                const reponse = await requete({ url: "/utilisateurs/qr-code-2fa", methode: "POST" });
                                setTimeout(() => {
                                    setDetails2Modal(reponse);
                                    setChargementRequete(null);
                                }, 1000);
                            }}
                        >
                            <div className="action-icon doubleAuthentification">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="action-text">
                                <div className="action-title">Double authentification</div>
                                <div className="action-desc">Actuellement {donnees?.doubleAuthentificationActive ? "active  · Désactiver" : "inactive · Activer"}</div>
                            </div>
                            <ChevronRight size={20} />
                        </div>
                    </div>

                    <div className="danger-zone">
                        <div className="danger-head">Actions sensibles</div>
                        <div className="danger-actions">
                            <button
                                className="btn-danger"
                                onClick={async (e) => {
                                    e.preventDefault();

                                    await requete({ url: "/utilisateurs/deconnexion", methode: "DELETE" });
                                    deconnexion();
                                    navigation("/connexion");
                                }}
                            >
                                <LogOut size={20} />
                                Déconnexion
                            </button>
                            <button
                                className="btn-danger supprimerCompte"
                                onClick={() => {
                                    setContenuModal("supprimerCompte");
                                    setAfficherModal(true);
                                }}
                            >
                                <Trash2 size={20} />
                                Supprimer le compte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="CompteAncien">
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

                    {donnees?.nbrParties != null && (
                        <p>
                            <span className="gras">Nombres de parties jouées : </span>
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
                    {!donnees?.doubleAuthentificationActive ? (
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
                    ) : (
                        <button
                            className="bouton rouge"
                            onClick={async () => {
                                setChargementRequete("desactiver2FA");
                                const reponse = await requete({ url: "/utilisateurs/desactiver-2fa", methode: "DELETE" });
                                setTimeout(() => {
                                    setDonnees(reponse);
                                    setAfficherModal(false);
                                    setChargementRequete(null);
                                }, 1000);
                            }}
                        >
                            {chargementRequete == "desactiver2FA" ? <Chargement variant="button" /> : "Désactiver 2FA"}
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

            {contenuModal == "modifierMail" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Changer d'adresse mail"
                    onSubmit={async (e) => {
                        e?.preventDefault();
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
                    <div className="modalPied">
                        {detailsModal ? (
                            <button className="boutonAction solo" disabled>
                                {detailsModal.contenu}
                            </button>
                        ) : (
                            <button type="submit" className="boutonAction solo">
                                Enregistrer
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            {contenuModal == "nouveauMdp" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Saisir le nouveau mot de passe"
                    onSubmit={async (e) => {
                        e?.preventDefault();
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
                    <ChampDonneesForm id="nouveauMdp" typeInput="password" placeholder="Nouveau mot de passe" />

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
                        <div className="modalPied">
                            <button type="submit" className="boutonAction solo">
                                {chargementRequete === "modalNouveauMdp" ? <Chargement variant="button" /> : "Enregistrer"}
                            </button>
                        </div>
                    )}
                </Modal>
            )}

            {contenuModal == "activer2FA" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre="Configuration 2FA">
                    <p id="pEtape1">1. QR Code à scanner sur votre application OTP</p>
                    {chargementRequete ? <Chargement variant="button" /> : <img src={details2Modal} className="image2FA" />}

                    <p id="pEtape2">2. Saisir le code afficher sur l'application</p>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setChargementRequete("verifier2FA");
                            const code = document.querySelector<HTMLInputElement>("#champ2FA")!.value;
                            const reponse = await requete({
                                url: "/utilisateurs/initialisation-code-2fa",
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
                            <div className="modalPied">
                                <button type="submit" className="boutonAction solo" disabled={!!chargementRequete}>
                                    {chargementRequete === "verifier2FA" ? <Chargement variant="button" /> : "Valider 2FA"}
                                </button>
                            </div>
                        )}
                    </form>
                </Modal>
            )}

            {contenuModal == "supprimerCompte" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Supprimer le compte"
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete("supprimerCompte");
                        await requete({ url: "/utilisateurs/suppression", methode: "DELETE" });
                        deconnexion();
                        navigation("/inscription");
                    }}
                >
                    <p>Êtes-vous sur de vouloir supprimer votre compte ?</p>
                    <div className="modalPied">
                        <button className="boutonDiscret" onClick={() => setAfficherModal(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="boutonAction">
                            {chargementRequete ? <Chargement variant="button" /> : "Supprimer"}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
