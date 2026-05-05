import Chargement from "../composants/Chargement";
import { useAuth } from "../contexts/AuthContext";

export default function Accueil() {
    const { estAuth, role } = useAuth();

    return (
        <main>
            {/* CONTEXTE */}
            <section>
                <h2>Contexte du projet</h2>
                <p>Ce projet a été réalisé dans le cadre de la formation BTS en développement informatique. Il s’agit d’un système complet d’automatisation et de gestion d’un escape game.</p>

                <p>Le projet combine une partie conception de missions (électronique et scripts Python) ainsi qu’une plateforme centrale de coordination permettant le suivi en temps réel des parties.</p>
            </section>

            <hr />

            {/* OBJECTIF */}
            <section>
                <h2>Objectif</h2>
                <p>L’objectif principal est de centraliser la gestion d’un escape game afin de fournir :</p>

                <ul>
                    <li>Une interface de contrôle pour le superviseur de partie</li>
                    <li>Une interface joueur pour la gestion des équipes</li>
                    <li>Un suivi en temps réel des événements de la mission</li>
                </ul>

                <p>Le système permet de remplacer les outils manuels par une plateforme unifiée et automatisée.</p>
            </section>

            <hr />

            {/* EQUIPE */}
            <section>
                <h2>Équipe projet</h2>

                <ul>
                    <li>
                        <strong>Élias</strong> – Conception mission 1
                    </li>
                    <li>
                        <strong>Dorian</strong> – Missions 2, 4 et 5
                    </li>
                    <li>
                        <strong>Gonçalo</strong> – Missions 3, 4 et 5
                    </li>
                    <li>
                        <strong>Mathis</strong> – Ingénierie système de communication temps réel (MQTT / flux événementiel)
                    </li>
                    <li>
                        <strong>Éloi</strong> – Développement Frontend & Backend
                    </li>
                </ul>
            </section>

            <hr />

            {/* FONCTIONNALITES */}
            <section>
                <h2>Fonctionnalités</h2>

                <h3>Interface superviseur</h3>
                <ul>
                    <li>Configuration des missions et scénarios</li>
                    <li>Génération locale d’audios dynamiques</li>
                    <li>Suivi en temps réel de la progression</li>
                </ul>

                <h3>Interface joueurs</h3>
                <ul>
                    <li>Création et gestion d’équipe</li>
                    <li>Participation aux missions</li>
                </ul>

                <h3>Système global</h3>
                <ul>
                    <li>Consultation des classements accessibles à tous</li>
                    <li>Synchronisation des événements en temps réel</li>
                </ul>
            </section>

            <hr />

            {/* STACK */}
            <section>
                <h2>Stack technique</h2>

                <ul>
                    <li>
                        <strong>Frontend :</strong> React
                    </li>
                    <li>
                        <strong>Backend :</strong> Express.js
                    </li>
                    <li>
                        <strong>Base de données :</strong> SQLite
                    </li>
                    <li>
                        <strong>Communication temps réel :</strong> WebSockets (flux événementiel + MQTT)
                    </li>
                </ul>
            </section>

            <hr />

            {/* ROLE PERSO */}
            <section>
                <h2>Mon rôle dans le projet</h2>
                <p>
                    {/* À compléter si tu veux personnaliser */}
                    Développement de la partie interface et logique serveur, intégration des communications en temps réel et participation à la structuration de l’architecture globale.
                </p>
            </section>

            <hr />

            {/* CHIFFRES */}
            <section>
                <h2>Données du projet</h2>

                <ul>
                    <li>Durée du projet : 5 mois</li>
                    <li>Nombre de membres : 5</li>
                    <li>Nombre de missions : 5</li>
                    <li>Nombre de scénarios : 3</li>
                    <li>Sessions de jeu : [variable]</li>
                </ul>

                <p>
                    Démo : <a href="https://example.com">lien de démonstration</a>
                </p>

                <p>
                    Repository GitHub : <a href="https://github.com/">lien du projet</a>
                </p>
            </section>
        </main>
    );
}
