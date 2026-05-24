import { useState, useEffect } from "react";
import { recupererImage, definirImageCache } from "./diapositivesCache";
import { useRequete } from "./requete";

export function useDiapositives(tableauImagesId: number[]) {
    const [urls, setUrls] = useState<Record<number, string>>({});
    const [chargement, setChargement] = useState(true);
    const requete = useRequete();
    useEffect(() => {
        const objectUrls: string[] = [];

        async function loadAll() {
            const entries = await Promise.all(
                tableauImagesId.map(async (id) => {
                    let imageBlob = await recupererImage(String(id));

                    if (!imageBlob) {
                        console.log("je doit charger le blob");
                        imageBlob = await requete({ url: `/admins/missions/${id}/recuperer-diapositive`, blob: true });
                        if (!imageBlob) {
                            throw new Response("Impossible de charger la diapositive", {
                                status: 500,
                            });
                        }
                        await definirImageCache(String(id), imageBlob);
                    }

                    const url = URL.createObjectURL(imageBlob);
                    objectUrls.push(url);
                    return [id, url] as [number, string];
                }),
            );

            setUrls(Object.fromEntries(entries));
            setChargement(false);
        }

        loadAll();

        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [JSON.stringify(tableauImagesId)]);

    return { urls, chargement };
}
