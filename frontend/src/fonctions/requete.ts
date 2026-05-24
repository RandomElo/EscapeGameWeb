import { useErreur } from "../contexts/ErreurContext";
import { useAuth } from "../contexts/AuthContext";

interface RequeteParametres {
    url: string;
    methode?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    corps?: object;
    enTete?: Record<string, string>;
    formData?: boolean;
    blob?: boolean;
}

export function useRequete() {
    const { setErreur } = useErreur();
    const { estAuth, deconnexion } = useAuth();

    return async function requete({ url, methode = "GET", corps, enTete = {}, formData = false, blob = false }: RequeteParametres): Promise<any> {
        try {
            const req = await fetch(`${url}`, {
                method: methode,
                headers: {
                    ...(!formData && {
                        "Content-Type": "application/json",
                    }),
                    ...enTete,
                },
                credentials: "include",
                body: formData ? (corps as FormData) : corps ? JSON.stringify(corps) : undefined,
            });
            if (!req.ok) {
                throw new Error(`Code ${req.status} | Erreur lors de l'envoi de la requête`);
            }
            if (blob) {
                return await req.blob();
            }
            const reponse = await req.json();
            if (!reponse.etat) {
                if (reponse.detail == "Vous n'êtes pas connecté" || reponse.detail == "accueil") {
                    deconnexion();
                } else {
                    throw new Error(reponse.detail);
                }
            }
            return reponse.detail;
        } catch (erreur) {
            setErreur(erreur as Error);
            return null;
        }
    };
}
