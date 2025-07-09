import { initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBMU21_f6W0BNtpmXh94bf7nuwTYlGK9l0",
    authDomain: "daftar-push-notif.firebaseapp.com",
    projectId: "daftar-push-notif",
    storageBucket: "daftar-push-notif.firebasestorage.app",
    appId: "1:997351259970:web:4ff865b1c9a859d498d2db",
    measurementId: "G-76BPR5ZJZ0"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: Messaging | null = null;

if (typeof window !== "undefined") {
    try {
        messaging = getMessaging(app);
    } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error);
    }
}

export { messaging, getToken, onMessage, app };
