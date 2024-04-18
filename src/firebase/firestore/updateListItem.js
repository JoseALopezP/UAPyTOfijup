import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

async function updateListItem(collectionName, documentId, searchValue, newValue) {
    try {
        // Get the document by its ID
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            // Retrieve the 'list' array from the document
            const { list } = docSnapshot.data();

            // Find the index of the item you want to update
            const index = list.findIndex(item => item.value === searchValue);

            if (index !== -1) {
                // Update the value of another item at the same index
                list[index].newValue = newValue; // Modify 'newValue' to the desired property

                // Update the document with the modified 'list' array
                await updateDoc(docRef, { list });
                console.log("Item updated successfully!");
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