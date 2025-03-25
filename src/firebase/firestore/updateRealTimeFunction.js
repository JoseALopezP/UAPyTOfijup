import { getFirestore, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);
const TIME_DIFF_KEY = "timeDifference";
const LAST_SYNC_KEY = "lastSyncTime";
const SYNC_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días

async function getStoredTimeDifference() {
    const timeDiff = localStorage.getItem(TIME_DIFF_KEY);
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);

    if (timeDiff && lastSync) {
        const lastSyncTime = parseInt(lastSync);
        if (Date.now() - lastSyncTime < SYNC_INTERVAL) {
            return parseInt(timeDiff);
        }
    }
    return null;
}

async function fetchServerTimeDifference() {
    try {
        const docRef = doc(db, "timestamps", "serverTime");
        const docSnap = await getDoc(docRef);

        let serverTime;
        if (docSnap.exists()) {
            serverTime = docSnap.data().time.toDate();
        } else {
            // Si no existe, creamos el documento una sola vez
            await updateDoc(docRef, { time: serverTimestamp() });
            return null;
        }

        const localTime = new Date();
        const difference = serverTime.getTime() - localTime.getTime();

        localStorage.setItem(TIME_DIFF_KEY, difference.toString());
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

        return difference;
    } catch (error) {
        console.error("Error fetching server time:", error);
    }
    return null;
}

export default async function updateRealTimeFunction() {
    let timeDifference = await getStoredTimeDifference();

    if (timeDifference === null) {
        timeDifference = await fetchServerTimeDifference();
        if (timeDifference === null) {
            return new Date().toLocaleTimeString("es-AR", {
                hourCycle: "h23",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
    }

    const accurateTime = new Date(Date.now() + timeDifference);
    return accurateTime.toLocaleTimeString("es-AR", {
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
    });
}
