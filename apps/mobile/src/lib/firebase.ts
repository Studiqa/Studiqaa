import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { initializeAuth, getReactNativePersistence, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mobile can't reuse @studiqa/firebase-config as-is: that package uses web-only
// App Check (ReCaptchaEnterpriseProvider) and reads NEXT_PUBLIC_* env vars via
// Next.js's build-time inlining, neither of which exists in a React Native/Expo app.
// Mobile needs its own persistence layer (AsyncStorage) and its own App Check
// provider (Play Integrity / App Attest, via expo-firebase-app-check — not wired
// here yet). Fill these from EAS/Expo env config before shipping; never hardcode
// real values into source.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let authInstance: Auth | null = null;
export function auth(): Auth {
  if (!authInstance) {
    authInstance = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  }
  return authInstance;
}

export const db = () => getFirestore(app);
