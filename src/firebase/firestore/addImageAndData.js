import firebase_app from "../config";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import uploadFile from "../storage/uploadFile";

const db = getFirestore(firebase_app)
export default async function addData(data) {

    try {
        const downloadURL = await uploadFile(image);
        await addDoc(collection(db, "informacion"), {
        data,
        imageUrl: downloadURL,
        createdAt: new Date(),
        });
    }catch (e) {
        console.error("Error creating post: ", error);
        alert("Error creating post.");
    }
}