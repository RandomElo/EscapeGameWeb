import { NavLink } from "react-router-dom";
import "../styles/MentionsLegales.css";

export default function MentionsLegales() {
    return (
        <main className="MentionsLegales">
            <h1>Mentions légales</h1>

            <h2>Éditeur du site</h2>
            <p>
                Nom : Eloi Bontron <br />
                Statut : Site réalisé dans le cadre d'un projet de fin d'études (<NavLink to="/">en savoir plus</NavLink>).
                <br />
                Email : eloi.random@gmail.com
            </p>

            <h2>Hébergement</h2>
            <p>
                Hébergeur : Auto-hébergé <br />
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>Le site et son contenu sont protégés. Toute reproduction est interdite.</p>

            <h2>Attributions</h2>
            <ul className="ulAttirbutions">
                <li>React (MIT License – Meta)</li>
                <li>Express.js (MIT License)</li>
                <li>Lucide Icons (MIT License)</li>
                <li>
                    <a href="https://www.flaticon.com/free-icons/anchor" title="anchor icons">
                        Anchor icons created by mavadee - Flaticon
                    </a>
                </li>
            </ul>
        </main>
    );
}
