import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import firebase_app from "../config";

const storage = getStorage (firebase_app)
export default async function uploadFile(image){
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
            "state_changed",
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
            }
        );
    });
};