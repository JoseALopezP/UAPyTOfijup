import firebase_app from "../config";
import { createUserWithEmailAndPassword, setCustomUserClaims, createCustom} from "firebase/auth";
import { getAuth } from "firebase/auth";

const auth = getAuth(firebase_app);

export default async function signUp(email, password, userType){
    let result = null,
        error = null;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;
        result = { uid, email};
        const data = {
            id: uid,
            type: userType
        }
    } catch (error) {
        console.error('Error creating user:', error);
        error = error.message;
    }
    return { result, error };
}