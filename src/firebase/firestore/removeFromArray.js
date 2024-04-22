import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function removeFromArray(collectionName, documentId, searchValue1, searchValue2) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            const { list } = docSnapshot.data();
            const indexToDelete = list.findIndex(item => item.value1 === searchValue1 && item.value2 === searchValue2);
            if (indexToDelete !== -1) {
                list.splice(indexToDelete, 1);
                await updateDoc(docRef, { list });
            } else {
                console.log("Item not found in 'list' array.");
            }
        } else {
            console.log("Document not found.");
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
}