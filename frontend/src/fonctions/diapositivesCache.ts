import { openDB } from "idb";
import type { IDBPDatabase } from "idb";

const BDD_NOM = "diapositives-cache";
const STORE = "diapositives";

async function recupererBdd(): Promise<IDBPDatabase> {
    return openDB(BDD_NOM, 1, {
        upgrade(db) {
            db.createObjectStore(STORE);
        },
    });
}

export async function recupererImage(id: string): Promise<Blob | undefined> {
    const db = await recupererBdd();
    return db.get(STORE, id);
}

export async function definirImageCache(id: string, blob: Blob): Promise<void> {
    const db = await recupererBdd();
    await db.put(STORE, blob, id);
}
