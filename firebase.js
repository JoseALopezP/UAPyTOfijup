import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "uapyt-c78ae.firebaseapp.com",
    projectId: "uapyt-c78ae",
    storageBucket: "uapyt-c78ae.appspot.com",
    messagingSenderId: "342459802277",
    appId: "1:342459802277:web:5415b6cb127cd7940be34c"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);