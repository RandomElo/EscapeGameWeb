import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Equipe.css";
import { useNavigate } from "react-router-dom";
import { useRequete } from "../fonctions/requete";
import Modal from "../composants/Modal";
import ChampDonneesForm from "../composants/ChampDonneesForm";
import { ClipboardSignature, EllipsisVertical, Trash2, TriangleAlert, UserPlus } from "lucide-react";

export default function Equipe() {
    const { estAuth, chargement } = useAuth();
    const navigation = useNavigate();
    const requete = useRequete();

    const [afficherModal, setAfficherModal] = useState<boolean>(false);
    const [contenuModal, setContenuModal] = useState<"creationEquipe" | "optionsEquipe" | "menuEquipeSupprimer" | "menuEquipeModifierNom" | "menuAjouterMembre" | "menuListeMembres">();
    const [erreur, setErreur] = useState<string>();
    const [equipesListe, setEquipesListe] = useState<[{ nom: string; estChef: boolean; listeMembres: { nom: string; mail?: string; estChef: boolean }[] }]>();
    const [donneesModal, setDonneesModal] = useState<string>();

    useEffect(() => {
        if (!estAuth && chargement) {
            navigation("/connexion");
        } else {
            // recupération de la liste des équipes
            const recuperationDonnees = async () => {
                const reponse = await requete({ url: "/equipes/mes-equipes" });
                console.log(reponse);
                setEquipesListe(reponse);
            };
            recuperationDonnees();
        }
    }, [chargement, estAuth, navigation]);

    return (
        <>
            <main className="Equipe">
                <h1 id="titre">Équipe</h1>
                <div id="divActions">
                    <button
                        className="bouton"
                        onClick={() => {
                            setContenuModal("creationEquipe");
                            setAfficherModal(true);
                        }}
                    >
                        Crée une équipe
                    </button>
                </div>
                <div id="divListeEquipes">
                    <div id="divMesEquipes">
                        <h2>Les équipes que vous avez crée</h2>
                        <table>
                            <tbody>
                                {equipesListe
                                    ?.filter((equipe) => equipe.estChef)
                                    .map((equipe, key) => (
                                        <tr key={key}>
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
                                            {/* je doit mettre les détails des membres */}
                                            {/* <td className="action"><UserPlus /></td>
                                            <td className="action"><Pencil /></td>
                                            <td className="action"><Trash2 /></td> */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    <div id="divAutreEquipes">
                        <h2>Les équipes dont vous faite partie</h2>
                        {equipesListe
                            ?.filter((equipe) => !equipe.estChef)
                            .map((equipe) => (
                                <p>{equipe.nom}</p>
                            ))}
                    </div>
                </div>
            </main>
            <Modal estOuvert={afficherModal} fermeture={() => setAfficherModal(false)}>
                {contenuModal == "creationEquipe" && (
                    <div id="modalCreationEquipe">
                        <h1>Création d'équipe</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const nom = document.querySelector<HTMLInputElement>("#champNom")!.value;
                                const reponse = await requete({ url: "/equipes/creation", methode: "POST", corps: { nom } });
                                if (reponse.cree) {
                                    setEquipesListe(reponse.detail);
                                } else {
                                    setErreur(reponse.detail);
                                }
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
                            {/* je doit verifier si le champ nom est bien unique */}
                            {/* gestion des erreurs */}
                            {erreur && (
                                <div id="divErreurFormulaire">
                                    <TriangleAlert />
                                    <p id="pErreur">{erreur}</p>
                                </div>
                            )}
                            <button type="submit" className="bouton" disabled={!!erreur}>
                                Crée
                            </button>
                        </form>
                    </div>
                )}
                {contenuModal == "optionsEquipe" && (
                    <div id="modalOptionsEquipe">
                        <h1>Menu d'équipe</h1>
                        <div id="divOptions">
                            <a
                                className="bouton"
                                onClick={() => {
                                    console.log(equipesListe?.filter((equipe) => equipe.nom == donneesModal)[0]);
                                    setContenuModal("menuListeMembres");
                                }}
                            >
                                Liste des membres
                            </a>
                            <a
                                className="bouton"
                                onClick={() => {
                                    setContenuModal("menuAjouterMembre");
                                }}
                            >
                                Ajouter un membre
                            </a>
                            <a
                                className="bouton"
                                onClick={() => {
                                    setContenuModal("menuEquipeModifierNom");
                                }}
                            >
                                Modifier le nom
                            </a>
                            <a
                                className="bouton"
                                onClick={() => {
                                    setContenuModal("menuEquipeSupprimer");
                                }}
                            >
                                Supprimer
                            </a>
                        </div>
                    </div>
                )}
                {contenuModal == "menuEquipeSupprimer" && (
                    <div id="modalSupprimerEquipe">
                        <h1>Suppression</h1>
                        <p>Êtes vous sur de vouloir supprimer l'équipe ?</p>
                        <div id="divChoix">
                            <button
                                className="bouton"
                                onClick={() => {
                                    setAfficherModal(false);
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                className="bouton boutonSupprimer"
                                onClick={async () => {
                                    const reponse = await requete({ url: "/equipes/suppression", methode: "DELETE", corps: { nom: donneesModal } });
                                    setEquipesListe(reponse);
                                    setAfficherModal(false);
                                }}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                )}
                {contenuModal == "menuEquipeModifierNom" && (
                    <div id="modalModifierEquipe">
                        <h1>Modifier le nom</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const nom = document.querySelector<HTMLInputElement>("#inputNouveauNom")!.value;

                                const reponse = await requete({ url: "/equipes/modification-nom", methode: "PATCH", corps: { nouveauNom: nom, ancienNom: donneesModal } });

                                setEquipesListe(reponse);
                                setAfficherModal(false);
                            }}
                        >
                            <ChampDonneesForm id="inputNouveauNom" typeInput="text" placeholder={donneesModal} focus={true} />
                            <button type="submit" className="bouton">
                                Modifier
                            </button>
                        </form>
                    </div>
                )}
                {contenuModal == "menuAjouterMembre" && (
                    <div id="modalAjouterMembre">
                        <h1>Inviter une personne</h1>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const mail = document.querySelector<HTMLInputElement>("#inputMail")!.value;
                                const activerNotification = document.querySelector<HTMLInputElement>("#checkboxEnvoyerMail")?.checked;

                                const reponse = await requete({ url: "/equipes/ajout-utilisateur", methode: "POST", corps: { mail, activerNotification, nomEquipe: donneesModal } });
                                if (reponse.utilisateurExistant) {
                                    setEquipesListe(reponse.detail);
                                }
                                setAfficherModal(false)
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
                            <div id="divEnvoyerMail">
                                <input type="checkbox" id="checkboxEnvoyerMail" />
                                <label htmlFor="checkboxEnvoyerMail">Envoyer une notification par mail</label>
                            </div>
                            {erreur && <p id="pErreur"> {erreur}</p>}
                            <button type="submit" className="bouton" disabled={!!erreur}>
                                Ajouter
                            </button>
                        </form>
                    </div>
                )}
                {contenuModal == "menuListeMembres" && (
                    <div id="modalListesMembres">
                        <h1>Liste des membres</h1>
                        <table>
                            <tbody>
                                {equipesListe
                                    ?.find((equipe) => equipe.nom === donneesModal)
                                    ?.listeMembres.map((joueur) => (
                                        <tr key={joueur.nom}>
                                            <td className="tdNom">{joueur.nom}</td>
                                            <td className="tdMail">{joueur.mail ?? ""}</td>
                                            {joueur.mail ? (
                                                <td
                                                    className={`tdPoubelle${joueur.estChef ? ` interdit` : ""}`}
                                                    onClick={async () => {
                                                        if (!joueur.estChef) {
                                                            const reponse = await requete({ url: "/equipes/suppression-membre", methode: "DELETE", corps: { membre: joueur.mail, equipe: donneesModal } });
                                                            setEquipesListe(reponse);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 />
                                                </td>
                                            ) : (
                                                <td></td>
                                            )}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {/* <p>Je suis chef {equipesListe.nom[donneesModal]}</p> */}
                    </div>
                )}
                {/* {contenuModal == "menu" && <div id="modal"></div>} */}
            </Modal>
        </>
    );
}
