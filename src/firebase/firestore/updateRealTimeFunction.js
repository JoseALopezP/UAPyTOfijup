import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);
const TIME_DIFF_KEY = "timeDifference";
const LAST_SYNC_KEY = "lastSyncTime";
const SYNC_INTERVAL = 6048000000;

function getStoredTimeDifference() {
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
        if (!docSnap.exists() || !docSnap.data().time) {
            await setDoc(docRef, { time: serverTimestamp() }, { merge: true });
            let retries = 5;
            while (retries > 0) {
                await new Promise((res) => setTimeout(res, 500));
                docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().time) break;
                retries--;
            }
        }
        const serverTime = docSnap.data().time?.toDate();
        if (!serverTime) return null;
        const localTime = new Date();
        const difference = serverTime.getTime() - localTime.getTime();
        localStorage.setItem(TIME_DIFF_KEY, difference.toString());
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

        return difference;
    } catch (error) {
        console.error("❌ Error fetching server time:", error);
        return null;
    }
}
export default async function updateRealTimeFunction() {
    let timeDifference = getStoredTimeDifference();
    if (timeDifference === null) {
        timeDifference = await fetchServerTimeDifference();
        if (timeDifference === null) {
            console.warn("⚠️ Falling back to local time, time difference is null.");
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
