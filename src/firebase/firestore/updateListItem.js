import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function updateListItem(collectionName, documentId, searchValue1, searchValue2, propertyToUpdate, newValue) {
    try {
        if (typeof collectionName !== "string" || typeof documentId !== "string") {
            throw new Error("Collection name and document ID must be strings.");
        }
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);
        if (!docSnapshot.exists()) {s
            console.log("Document not found.");
            return;
        }
        const { list = [] } = docSnapshot.data();
        const foundItem = list.find(item => (item.numeroLeg === searchValue1 || item.fecha === searchValue1) && item.hora === searchValue2);

        if (foundItem) {
            foundItem[propertyToUpdate] = newValue;
            await updateDoc(docRef, { list });
        } else {
            console.log("Item not found in 'list' array.");
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
}