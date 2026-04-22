import { useEffect, useRef, useState } from "react";
import { useRequete } from "../../fonctions/requete";
import Chargement from "../Chargement";

export default function CardCamera() {
    const [token, setToken] = useState<string>("");
    const [chargement, setChargement] = useState<boolean>(true);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const lastUrlRef = useRef<string | null>(null);

    const requete = useRequete();

    useEffect(() => {
        async function recuperationToken() {
            const reponse = await requete({ url: "/admins/cameras/recuperation-token", methode: "POST" });
            setToken(reponse);
        }
        recuperationToken();
    }, []);

    useEffect(() => {
        if (!token) return;
        const ws = new WebSocket(`ws://172.18.201.101:8080/ws/stream?token=${token}`);
        ws.binaryType = "blob";

        console.log("WS Open");

        ws.onmessage = async (event) => {
            if (chargement) {
                setChargement(false);
            }
            const blob = new Blob([event.data], { type: "image/jpeg" });
            const url = URL.createObjectURL(blob);

            if (imgRef.current) {
                imgRef.current.src = url;
            }

            if (lastUrlRef.current) {
                URL.revokeObjectURL(lastUrlRef.current);
            }

            lastUrlRef.current = url;
        };

        ws.onclose = () => {
            console.log("WS closed");
            setChargement(true);
        };

        return () => ws.close();
    }, [token]);

    return (
        <div className="card cameraCard">
            <h3>Aperçu caméra</h3>
            <div className="cameraPreview">{chargement ? <Chargement variant="button" /> : <img ref={imgRef} alt="stream" />}</div>
        </div>
    );
}
