import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";

let firebaseInitialized = false;

export function initializeFirebase(): void {
  if (firebaseInitialized) {
    return;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountKey) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is not defined in environment variables"
      );
    }

    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
    if (process.env.FIREBASE_DATABASE_URL) {
      console.log("✅ Realtime Database connected:", process.env.FIREBASE_DATABASE_URL);
    }
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error);
    throw error;
  }
}

export function getStorageBucket() {
  if (!firebaseInitialized) {
    throw new Error("Firebase has not been initialized. Call initializeFirebase() first");
  }

  return admin.storage().bucket();
}

export function getFirebaseAdmin() {
  return admin;
}


export function getDatabase() {
  if (!firebaseInitialized) {
    throw new Error("Firebase has not been initialized. Call initializeFirebase() first");
  }

  return admin.database();
}
