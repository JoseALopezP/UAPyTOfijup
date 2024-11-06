import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function  updateRealTimeFunction(){
    try {
        const tempDocRef = doc(db, "timestamps", "temp");
        await setDoc(tempDocRef, { time: serverTimestamp() });
        const docSnap = await getDoc(tempDocRef);
        if (docSnap.exists()) {
            const serverTime = docSnap.data().time.toDate();
            return(serverTime.toLocaleTimeString("es-AR", {
                hourCycle: 'h23',
                hour: "2-digit",
                minute: "2-digit"
            }).toString());
        } else {
            throw new Error("No timestamp document found.");
        }
        
    } catch (error) {
        console.error('Error fetching server time from Firestore, using local time:', error);
        return(new Date().toLocaleTimeString("es-AR", {
            hourCycle: 'h23',
            hour: "2-digit",
            minute: "2-digit"
        }));
    }
};