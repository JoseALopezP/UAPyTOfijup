import firebase_app from "../config";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default function updateDocumentListener(collectionName, documentId, callback) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                callback(docSnapshot.data().list);
            } else {
                callback([]);
            }
        }, (error) => {
            console.error("Error listening to document updates:", error);
        });
        return unsubscribe;
    } catch (e) {
        console.log(e);
        return null;
    }
}