import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function oldAddOrUpdateDocument(collectionName, documentId, data) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            await updateDoc(docRef, {
                list: arrayUnion(data)
            });
        } else {
            await setDoc(docRef, {
                list: [data]
            });
        }
    } catch (e) {
        console.error(e);
    }
}