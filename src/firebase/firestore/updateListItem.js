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
        console.log("Buscando en la lista:", list);
        const foundItem = list.find(item => {
            const match = (item.numeroLeg === searchValue1 || item.fecha === searchValue1) && item.hora === searchValue2;
            console.log("Comparando item:", item, "con searchValue1:", searchValue1, "searchValue2:", searchValue2, "Resultado:", match);
            return match;
        });
        if (foundItem) {
            if (newValue !== undefined && newValue !== '') {
                foundItem[propertyToUpdate] = newValue;
                await updateDoc(docRef, { list });
            } else {
                console.warn("Skipped update because newValue is empty or undefined.");
            }
        } else {
            console.log("Item not found in 'list' array.");
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
}