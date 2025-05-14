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
        const foundItem = list.find(item => {
            const match = (item.numeroLeg === searchValue1 || item.fecha === searchValue1) && item.hora === searchValue2;
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
            console.log("Item not found in 'list' array. Agregando uno nuevo.");
            if (newValue !== undefined && newValue !== '') {
                const newItem = {
                    numeroLeg: searchValue1,
                    hora: searchValue2,
                    [propertyToUpdate]: newValue
                };
                list.push(newItem);
                await updateDoc(docRef, { list });
            } else {
                console.warn("No se pudo crear un nuevo item porque el valor es vacío o indefinido.");
            }
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
}