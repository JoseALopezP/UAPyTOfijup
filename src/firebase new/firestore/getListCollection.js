import firebase_app from "../config";
import { getFirestore, collection, getDocs} from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function getListCollection(collectionName, date, subcol) {
  if (!collectionName || !date || !subcol || (typeof date === 'string' && !date.trim())) {
    // console.warn(`getListCollection called with missing or invalid parameters: ${collectionName}/${date}/${subcol}`);
    return [];
  }
  try {
    const subcolRef = collection(db, collectionName, date, subcol);
    const snapshot = await getDocs(subcolRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.error("Firebase fetch error:", e);
    throw new Error(e.message || "Failed to fetch data from Firestore.");
  }
}