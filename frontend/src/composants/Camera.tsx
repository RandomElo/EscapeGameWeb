import { useEffect, useState } from "react";
import { useRequete } from "../fonctions/requete";

export default function Camera() {
    const [image, setImage] = useState(null);
    const [token, setToken] = useState<string>("");

    const requete = useRequete();

    useEffect(() => {
        async function recuperationToken() {
            const reponse = await requete(ur);
        }
        recuperationToken();
    }, []);
    /*
    useEffect(() => {
        console.log("je sis ici");
        const ws = new WebSocket("ws://172.18.201.101:8080/ws/stream");

        ws.onmessage = (event) => {
            // si tu envoies du JSON côté Python :
            try {
                const data = JSON.parse(event.data);
                setImage(data.image);
            } catch {
                // sinon fallback si brut
                setImage(event.data);
            }
        };

        ws.onclose = () => {
            console.log("WS closed");
        };

        return () => ws.close();
    }, []); */

    return image && <img src={`data:image/jpeg;base64,${image}`} alt="stream" />;
}
