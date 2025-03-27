import { getFirestore, doc, getDoc, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);
const TIME_DIFF_KEY = "timeDifference";
const LAST_SYNC_KEY = "lastSyncTime";
const SYNC_INTERVAL = 7 * 24 * 60 * 60 * 1000;

async function getStoredTimeDifference() {
    const timeDiff = localStorage.getItem(TIME_DIFF_KEY);
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);

    if (timeDiff && lastSync) {
        const lastSyncTime = parseInt(lastSync, 10);
        if (!isNaN(lastSyncTime) && Date.now() - lastSyncTime < SYNC_INTERVAL) {
            const parsedDiff = parseInt(timeDiff, 10);
            return isNaN(parsedDiff) ? null : parsedDiff;
        }
    }
    return null;
}


async function fetchServerTimeDifference() {
    try {
        const docRef = doc(db, "timestamps", "serverTime");
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, { time: serverTimestamp() }, { merge: true });
            docSnap = await getDoc(docRef); // Fetch updated document
        }

        const serverTime = docSnap.data().time?.toDate();
        if (!serverTime) return null;

        const localTime = new Date();
        const difference = serverTime.getTime() - localTime.getTime();

        localStorage.setItem(TIME_DIFF_KEY, difference.toString());
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

        return difference;
    } catch (error) {
        console.error("Error fetching server time:", error);
        return null;
    }
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

    const accurateTime = new Date(Date.now() + (timeDifference || 0));
    return accurateTime.toLocaleTimeString("es-AR", {
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
    });
}
