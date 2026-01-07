import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Robust initialization
let app;
let dbInstance;

try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('PLACEHOLDER')) {
        console.warn("Firebase Config missing or placeholder. Persistence disabled.");
    } else {
        app = initializeApp(firebaseConfig);
        dbInstance = getFirestore(app);
    }
} catch (e) {
    console.error("Firebase Init Failed:", e);
}

export const db = dbInstance!;
