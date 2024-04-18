import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function addOrUpdateDocument(collectionName, documentId, data) {
    try {
        // Check if the document exists
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            // Document exists, update its data
            await updateDoc(docRef, {
                list: arrayUnion(data)
            });
            console.log("Document updated successfully!");
        } else {
            // Document doesn't exist, create a new one with the specified ID
            await setDoc(docRef, {
                list: [data]
            });
            console.log("Document created successfully!");
        }
    } catch (e) {
        console.error(e);
    }
}