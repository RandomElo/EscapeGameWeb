import { useAuth } from "../contexts/AuthContext";

export default function Accueil() {
    const { estAuth, role } = useAuth();

    return (
        <main className="Accueil">
            <h1>Accueil</h1>
            {!estAuth ? <p>Pas auth</p> : <p>Auth</p>}
            {role}
        </main>
    );
}
