const admin = require('firebase-admin');
const firebase_app = require("../config");

// Initialize Firebase Admin SDK with appropriate credentials
const serviceAccount = require('path/to/serviceAccountKey.json'); // Replace with your service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = getAuth(firebase_app);

async function signUp(email, password, logName, userType) {
    let result = null,
        error = null;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;
        await admin.auth().setCustomUserClaims(uid, { userType: userType });
        result = { uid, email, username };
        
    } catch (error) {
        console.error('Error creating user:', error);
        error = error.message;
    }
    return { result, error };
}