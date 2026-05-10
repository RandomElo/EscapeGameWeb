import "../styles/Accueil.css";
export default function Accueil() {
    return (
        <main className="Accueil">
            <div className="accueilConteneur">
                <div className="entetePage">
                    <h1 className="titrePage">Présentation du projet</h1>
                    <p className="sousTitrePage">Escape Game — Projet de fin d'étude BTS CIEL IR</p>
                </div>

                <div className="grilleStatistiques">
                    <div className="carteStatistique coinsHud">
                        <div className="etiquetteStat">Durée</div>
                        <div className="valeurStat">5 mois</div>
                    </div>
                    <div className="carteStatistique coinsHud">
                        <div className="etiquetteStat">Membres</div>
                        <div className="valeurStat">5</div>
                    </div>
                    <div className="carteStatistique coinsHud">
                        <div className="etiquetteStat">Missions</div>
                        <div className="valeurStat">5</div>
                    </div>
                    <div className="carteStatistique coinsHud">
                        <div className="etiquetteStat">Scénarios</div>
                        <div className="valeurStat">3</div>
                    </div>
                </div>

                <div className="listeSections">
                    <div className="carteInterface">
                        <div className="titreCarte">Contexte du projet</div>
                        <div className="corpsCarte">
                            <p>Ce projet a été réalisé dans le cadre de la formation BTS en développement informatique. Il s'agit d'un système complet d'automatisation et de gestion d'un escape game.</p>
                            <p>Le projet combine une partie conception de missions (électronique et scripts Python) ainsi qu'une plateforme centrale de coordination permettant le suivi en temps réel des parties.</p>
                        </div>
                    </div>

                    <div className="carteInterface">
                        <div className="titreCarte">Objectif</div>
                        <div className="corpsCarte">
                            <p>Centraliser la gestion d'un escape game afin de fournir :</p>
                            <ul className="listePuces">
                                <li>Une interface de contrôle pour le superviseur de partie</li>
                                <li>Une interface joueur pour la gestion des équipes</li>
                                <li>Un suivi en temps réel des événements de la mission</li>
                            </ul>
                            <p>Le système permet de remplacer les outils manuels par une plateforme unifiée et automatisée.</p>
                        </div>
                    </div>

                    <div className="carteInterface">
                        <div className="titreCarte">Équipe projet</div>
                        <div className="tableauEquipe">
                            <div className="ligneEquipe">
                                <span className="nomMembre">Élias</span>
                                <span className="roleMembre">Développeur mission 1</span>
                            </div>
                            <div className="ligneEquipe">
                                <span className="nomMembre">Dorian</span>
                                <span className="roleMembre">Développeur missions 2, 4 et 5</span>
                            </div>
                            <div className="ligneEquipe">
                                <span className="nomMembre">Gonçalo</span>
                                <span className="roleMembre">Développeur missions 3, 4 et 5</span>
                            </div>
                            <div className="ligneEquipe">
                                <span className="nomMembre">Mathis</span>
                                <span className="roleMembre">Développeur système de communication (MQTT)</span>
                            </div>
                            <div className="ligneEquipe">
                                <span className="nomMembre">Éloi</span>
                                <span className="roleMembre">Développeur Frontend & Backend</span>
                            </div>
                        </div>
                    </div>

                    <div className="carteInterface">
                        <div className="titreCarte">Fonctionnalités</div>
                        <div className="conteneur">
                            <div>
                                <div className="sousSectionTitre">Interface superviseur</div>
                                <ul className="listePuces">
                                    <li>Configuration des missions et scénarios</li>
                                    <li>Génération locale d'audios dynamiques</li>
                                    <li>Suivi en temps réel de la progression</li>
                                </ul>
                            </div>
                            <div>
                                <div className="sousSectionTitre">Interface joueurs</div>
                                <ul className="listePuces">
                                    <li>Création et gestion d'équipe</li>
                                    <li>Participation aux missions</li>
                                </ul>
                            </div>
                            <div>
                                <div className="sousSectionTitre">Système global</div>
                                <ul className="listePuces">
                                    <li>Consultation des classements</li>
                                    <li>Synchronisation temps réel</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="carteInterface">
                        <div className="titreCarte">Stack technique</div>
                        <div className="grilleStack">
                            <div className="elementStack">
                                <span className="etiquetteStack">Frontend</span>
                                <span className="valeurStack">React</span>
                            </div>
                            <div className="elementStack">
                                <span className="etiquetteStack">Backend</span>
                                <span className="valeurStack">Express.js</span>
                            </div>
                            <div className="elementStack">
                                <span className="etiquetteStack">Base de données</span>
                                <span className="valeurStack">SQLite</span>
                            </div>
                            <div className="elementStack">
                                <span className="etiquetteStack">Temps réel</span>
                                <span className="valeurStack">WebSockets + MQTT</span>
                            </div>
                        </div>

                        <div className="rangLiens">
                            <div className="blocLien">
                                <span className="etiquetteLien">Dépôt GitHub</span>
                                <a className="lienExterne" href="https://github.com/">
                                    → GitHub du projet
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
