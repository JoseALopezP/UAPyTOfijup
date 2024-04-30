import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function pushToHitos(collectionName, documentId, searchValue1, searchValue2, newHitosItems) {
    try {
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            let { list } = docSnapshot.data();
            const listItem = list.find(item => item.numeroLeg === searchValue1 && item.hora === searchValue2);
            if (listItem) {
                if (!listItem.hasOwnProperty("hitos")) {
                    listItem.hitos = [];
                }
                let { hitos } = listItem;
                hitos.push(...newHitosItems);
                listItem.hitos = hitos;
                list[list.indexOf(listItem)] = listItem;
                await updateDoc(docRef, { list });
            } else {
                console.log("List item not found for search values:", searchValue1, searchValue2);
            }
        } else {
            console.log("Document not found.");
        }
    } catch (error) {
        console.error("Error updating document:", error);
    }
}