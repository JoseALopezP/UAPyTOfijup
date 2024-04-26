import firebase_app from "../config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const db = getFirestore(firebase_app)
export default async function getDocument(collectionName, documentId) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            return docSnapshot.data().list;
        } else {
            return [];
        }
    } catch (e) {
        console.log(e);
        return []
    }
}