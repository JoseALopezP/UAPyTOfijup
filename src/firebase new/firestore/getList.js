import firebase_app from "../config";
import { getFirestore, collection, getDocs} from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getList(collectionName, fechaId) {
    try {
        const subcol = collection(db, collectionName, fechaId, "audiencias");
        const snapshot = await getDocs(subcol);
        return snapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Error fetching list:", e);
        return [];
    }
}