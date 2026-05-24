import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Equipe.css";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useRequete } from "../fonctions/requete";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { Crown, EllipsisVertical, Trash2, TriangleAlert } from "lucide-react";
import Chargement from "../composants/Chargement";
import RetourArriere from "../composants/RetourArriere";
import Checkbox from "../composants/Checkbox";

export default function Equipe() {
    const { estAuth, chargement } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();
    const donneesLoader = useLoaderData();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"creationEquipe" | "optionsEquipe" | "menuEquipeSupprimer" | "menuEquipeModifierNom" | "menuAjouterMembre" | "menuListeMembres" | "menuQuitterEquipe" | "demandeAdhesion">();
    const [erreur, setErreur] = useState<string>();
    const [equipesListe, setEquipesListe] = useState<[{ nom: string; estChef: boolean; listeMembres: { nom: string; mail?: string; estChef: boolean }[] }]>();
    const [donneesModal, setDonneesModal] = useState<string>();
    const [etatModal, setEtatModal] = useState<string>();
    const [chargementRequete, setChargementRequete] = useState<boolean>(false);

    useEffect(() => {
        if (!estAuth && !chargement) {
            navigation("/connexion");
        } else {
            // recupération de la liste des équipes
            const attributionDonnees = async () => {
                setEquipesListe(donneesLoader);
            };
            attributionDonnees();
        }
    }, [chargement, estAuth, navigation, donneesLoader]);

    return (
        <>
            {/* <main className="Equipe">
                <h1 id="titre">Équipe</h1>
                <button
                    className="bouton"
                    onClick={() => {
                        setContenuModal("creationEquipe");
                        setAfficherModal(true);
                    }}
                >
                    Crée une équipe
                </button>
                <div id="divListeEquipes">
                    <table>
                        <tbody>
                            {equipesListe?.map((equipe, key) => (
                                <tr key={key}>
                                    <td className={equipe.estChef ? "tdEstChef" : ""}>
                                        {equipe.estChef ? (
                                            <>
                                                <Crown />
                                                <span className="infoBulle">Vous êtes le propriétaire de l'équipe</span>
                                            </>
                                        ) : (
                                            ""
                                        )}
                                    </td>
                                    <td>{equipe.nom}</td>
                                    <td
                                        className="action"
                                        onClick={() => {
                                            setDonneesModal(equipe.nom);
                                            setContenuModal("optionsEquipe");
                                            setAfficherModal(true);
                                        }}
                                    >
                                        <EllipsisVertical />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button
                    id="boutonDemanderRejoindre"
                    className="bouton"
                    onClick={() => {
                        setContenuModal("demandeAdhesion");
                        setAfficherModal(true);
                    }}
                >
                    Demander à rejoindre une équipe
                </button>
            </main> */}

            <div className="Equipe">
                <div className="entetePage">
                    <h1 className="titrePage">Équipe</h1>
                    <button
                        className="boutonAction"
                        onClick={() => {
                            setContenuModal("creationEquipe");
                            setAfficherModal(true);
                        }}
                    >
                        + Créer une équipe
                    </button>
                </div>

                <div className="carteInterface">
                    <div className="enteteCarte">
                        <span className="titreCarte">Mes équipes</span>
                        <span className="nbrEquipesCarte">
                            {equipesListe?.length} équipe{equipesListe && equipesListe.length > 1 && "s"}
                        </span>
                    </div>
                    <table className="tableauDonnees">
                        <tbody>
                            {equipesListe?.map((equipe, key) => (
                                <tr key={key}>
                                    <td className="tdCouronne">{equipe.estChef && <span className="badgeChef">Chef</span>}</td>
                                    <td className="tdNomEquipe">{equipe.nom}</td>
                                    <td
                                        className="tdAction"
                                        onClick={() => {
                                            setDonneesModal(equipe.nom);
                                            setContenuModal("optionsEquipe");
                                            setAfficherModal(true);
                                        }}
                                    >
                                        <EllipsisVertical size={21} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="piedPage">
                    <button
                        className="boutonAction"
                        onClick={() => {
                            setContenuModal("demandeAdhesion");
                            setAfficherModal(true);
                        }}
                    >
                        Demander à rejoindre une équipe
                    </button>
                </div>
            </div>

            {contenuModal == "creationEquipe" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Créer une équipe"
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);
                        console.log(document.querySelector<HTMLInputElement>("#champNom"));
                        const nom = document.querySelector<HTMLInputElement>("#champNom")!.value;
                        const reponse = await requete({ url: "/equipes/creation", methode: "POST", corps: { nom } });

                        setTimeout(() => {
                            setChargementRequete(false);
                            if (reponse.cree) {
                                setEquipesListe(reponse.detail);
                                setAfficherModal(false);
                            } else {
                                setErreur(reponse.detail);
                            }
                        }, 1000);
                    }}
                >
                    <ChampDonneesForm
                        id="champNom"
                        placeholder="Nom de l'équipe"
                        typeInput="text"
                        focus={true}
                        onBlur={() => {
                            if (erreur) setErreur("");
                        }}
                    />
                    {erreur && (
                        <div id="divErreurFormulaire">
                            <TriangleAlert />
                            <p id="pErreur">{erreur}</p>
                        </div>
                    )}
                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo" disabled={!!erreur || chargementRequete}>
                            {chargementRequete ? <Chargement variant="button" /> : "Crée"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "optionsEquipe" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre={donneesModal ? donneesModal : "Menu d'équipe"}>
                    <div className="divModalOptionsEquipe">
                        <a
                            className="boutonAction"
                            onClick={() => {
                                setContenuModal("menuListeMembres");
                            }}
                        >
                            Liste des membres
                        </a>
                        {equipesListe?.find((equipe) => equipe.nom == donneesModal)?.estChef ? (
                            <>
                                <a
                                    className="boutonAction"
                                    onClick={() => {
                                        setContenuModal("menuAjouterMembre");
                                    }}
                                >
                                    Ajouter un membre
                                </a>
                                <a
                                    className="boutonAction"
                                    onClick={() => {
                                        setContenuModal("menuEquipeModifierNom");
                                    }}
                                >
                                    Modifier le nom de l'équipe
                                </a>
                                <a
                                    className="boutonAction"
                                    onClick={() => {
                                        setContenuModal("menuEquipeSupprimer");
                                    }}
                                >
                                    Supprimer l'équipe
                                </a>
                            </>
                        ) : (
                            <>
                                <a
                                    className="boutonAction"
                                    onClick={() => {
                                        setContenuModal("menuQuitterEquipe");
                                    }}
                                >
                                    Quitter l'équipe
                                </a>
                            </>
                        )}
                    </div>
                </Modal>
            )}
            {contenuModal == "menuListeMembres" && (
                <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)} titre={donneesModal ? `Membres - ${donneesModal}` : "Membres équipe"} retourArriere={() => setContenuModal("optionsEquipe")}>
                    <div className="listeMembresEquipe">
                        {equipesListe
                            ?.find((equipe) => equipe.nom === donneesModal)
                            ?.listeMembres.map((joueur, key) =>
                                !joueur.mail ? (
                                    <p key={key} className="nomSansMail">
                                        {joueur.nom}
                                    </p>
                                ) : (
                                    <table key={key} className="tableau">
                                        <tbody>
                                            <tr>
                                                <td className="tdNom">{joueur.nom}</td>
                                                <td className="tdMail">{joueur.mail}</td>
                                                <td
                                                    className={`tdPoubelle${joueur.estChef ? " interdit" : ""}`}
                                                    onClick={async () => {
                                                        if (!joueur.estChef) {
                                                            const reponse = await requete({
                                                                url: "/equipes/suppression-membre",
                                                                methode: "DELETE",
                                                                corps: {
                                                                    membre: joueur.mail,
                                                                    equipe: donneesModal,
                                                                },
                                                            });
                                                            setEquipesListe(reponse);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ),
                            )}
                    </div>
                </Modal>
            )}
            {contenuModal == "menuAjouterMembre" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={"Inviter un membre"}
                    retourArriere={() => setContenuModal("optionsEquipe")}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);

                        const mail = document.querySelector<HTMLInputElement>("#inputMail")!.value;
                        const activerNotification = document.querySelector<HTMLInputElement>("#checkboxEnvoyerMail")?.checked;

                        const reponse = await requete({ url: "/equipes/ajout-utilisateur", methode: "POST", corps: { mail, activerNotification, nomEquipe: donneesModal } });
                        setTimeout(() => {
                            setChargementRequete(false);
                            console.log(reponse);
                            if (reponse.utilisateurExistant) {
                                setEquipesListe(reponse.detail);
                            }
                            setContenuModal("menuListeMembres");
                        }, 1000);
                    }}
                >
                    <ChampDonneesForm
                        id="inputMail"
                        placeholder="exemple@mail.com"
                        onBlur={(e) => {
                            const valeur = e.target.value.trim();
                            const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                            if (valeur && !regexMail.test(valeur)) {
                                setErreur("Adresse mail invalide.");
                            } else {
                                setErreur("");
                            }
                        }}
                        focus={true}
                    />
                    <div className="Checkbox envoyerNotificationMail">
                        <div className="listeSelection">
                            <div className="elementSelection">
                                <input type="checkbox" id="checkboxEnvoyerMail" />
                                <label htmlFor="checkboxEnvoyerMail">Envoyer une notification par mail</label>
                            </div>
                        </div>
                    </div>

                    {erreur && <p id="pErreur"> {erreur}</p>}
                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo" disabled={!!erreur || chargementRequete}>
                            {chargementRequete ? <Chargement variant="button" /> : "Ajouter"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "menuEquipeModifierNom" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre="Modifier le nom de l'équipe"
                    retourArriere={() => setContenuModal("optionsEquipe")}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        setChargementRequete(true);
                        const nom = document.querySelector<HTMLInputElement>("#inputNouveauNom")!.value;

                        const reponse = await requete({ url: "/equipes/modification-nom", methode: "PATCH", corps: { nouveauNom: nom, ancienNom: donneesModal } });

                        setTimeout(() => {
                            setEquipesListe(reponse);
                            setChargementRequete(false);
                            setAfficherModal(false);
                        }, 1000);
                    }}
                >
                    <ChampDonneesForm id="inputNouveauNom" typeInput="text" placeholder={donneesModal} focus={true} />
                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo" disabled={chargementRequete}>
                            {chargementRequete ? <Chargement variant="button" /> : "Modifier"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "menuQuitterEquipe" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={"Quitter l'équipe"}
                    retourArriere={() => setContenuModal("optionsEquipe")}
                    onSubmit={async () => {
                        const reponse = await requete({ url: "/equipes/quitter", methode: "DELETE", corps: { equipe: donneesModal } });
                        setEquipesListe(reponse);
                        setAfficherModal(false);
                    }}
                >
                    <p>Êtes-vous sur de vouloir quitter l'équipe ?</p>
                    <div className="modalPied">
                        <button className="boutonDiscret" onClick={() => setContenuModal("optionsEquipe")}>
                            Annuler
                        </button>
                        <button type="submit" className="boutonAction">
                            {chargementRequete ? <Chargement variant="button" /> : "Quitter"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "menuEquipeSupprimer" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={"Suppression l'équipe"}
                    retourArriere={() => setContenuModal("optionsEquipe")}
                    onSubmit={async () => {
                        const reponse = await requete({ url: "/equipes/suppression", methode: "DELETE", corps: { nom: donneesModal } });
                        setEquipesListe(reponse);
                        setAfficherModal(false);
                    }}
                >
                    <p>Êtes vous sur de vouloir supprimer l'équipe ?</p>
                    <div className="modalPied">
                        <button className="boutonDiscret" onClick={() => setContenuModal("optionsEquipe")}>
                            Annuler
                        </button>
                        <button type="submit" className="boutonAction">
                            {chargementRequete ? <Chargement variant="button" /> : "Quitter"}
                        </button>
                    </div>
                </Modal>
            )}
            {contenuModal == "demandeAdhesion" && (
                <Modal
                    estOuvert={afficherModal}
                    fermeture={() => setAfficherModal(false)}
                    titre={"Demande d'adhésion"}
                    onSubmit={async (e) => {
                        e?.preventDefault();
                        const nomEquipe = document.querySelector<HTMLInputElement>("#inputNomEquipe")!.value;
                        const reponse = await requete({ url: "/equipes/cree-demande-adhesion", methode: "POST", corps: { nomEquipe } });

                        if (reponse.ajouter) {
                            setEtatModal("demandeEnvoyee");
                            setTimeout(() => {
                                setEtatModal("");
                                setAfficherModal(false);
                            }, 700);
                        } else {
                            setErreur(reponse.detail);
                        }
                    }}
                >
                    <ChampDonneesForm id="inputNomEquipe" placeholder="Nom de l'équipe" focus={true} onBlur={() => setErreur("")} />

                    {erreur && <p id="pErreur">{erreur}</p>}

                    <div className="modalPied">
                        <button type="submit" className="boutonAction solo" disabled={!!(erreur || etatModal == "demandeEnvoyee")}>
                            {etatModal == "demandeEnvoyee" ? "✅ Demande envoyée" : "Envoyer"}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
