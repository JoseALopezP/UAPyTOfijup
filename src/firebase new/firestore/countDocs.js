import { getFirestore, collection } from "firebase/firestore";
import { getCountFromServer } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export async function countDocs(path) {
    try {
        const colRef = collection(db, path);
        const snapshot = await getCountFromServer(colRef);
        return snapshot.data().count;
    } catch (e) {
        console.error("Firebase count error:", e);
        throw new Error(e.message || "Failed to count data from Firestore.");
    }
}
    