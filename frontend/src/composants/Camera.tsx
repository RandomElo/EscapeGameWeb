import { useEffect, useState } from "react";
import { useRequete } from "../fonctions/requete";
import Chargement from "./Chargement";

export default function Camera() {
    const [image, setImage] = useState(null);
    const [token, setToken] = useState<string>("");

    const requete = useRequete();

    useEffect(() => {
        async function recuperationToken() {
            const reponse = await requete({ url: "/admins/cameras/recuperation-token", methode: "POST" });
            setToken(reponse);
        }
        recuperationToken();
    }, []);

    useEffect(() => {
        if(!token) return
        const ws = new WebSocket(`ws://172.18.201.101:8080/ws/stream?token=${token}`);
        console.log("WS Open")
        ws.onmessage = (event) => {
            // si tu envoies du JSON côté Python :
            try {
                console.log('open')
                const data = JSON.parse(event.data);
                setImage(data.image);
            } catch {
                console.log("erreur")
                // sinon fallback si brut
                setImage(event.data);
            }
        };

        ws.onclose = () => {
            console.log("WS closed");
        };

        return () => ws.close();
    }, [token]);

    return image ? <img src={`data:image/jpeg;base64,${image}`} alt="stream" /> : <Chargement variant="button"/>;
}
