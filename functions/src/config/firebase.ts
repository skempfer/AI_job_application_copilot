import * as admin from "firebase-admin";

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK for Cloud Functions
 */
export function initializeFirebaseAdmin(): void {
  if (firebaseInitialized) {
    return;
  }

  try {
    admin.initializeApp({
      databaseURL: "https://viora-cv-uploads-default-rtdb.firebaseio.com",
      storageBucket: "viora-cv-uploads.appspot.com",
    });

    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized for Cloud Functions");
  } catch (error: any) {
    if (error.code !== 'app/duplicate-app') {
      console.error("❌ Error initializing Firebase Admin SDK:", error);
      throw error;
    }
    firebaseInitialized = true;
  }
}

export function getDatabase() {
  if (!firebaseInitialized) {
    throw new Error("Firebase has not been initialized. Call initializeFirebaseAdmin() first");
  }
  return admin.database();
}

export function getStorageBucket() {
  if (!firebaseInitialized) {
    throw new Error("Firebase has not been initialized. Call initializeFirebaseAdmin() first");
  }
  return admin.storage().bucket();
}

export function getFirebaseAdmin() {
  return admin;
}

export default admin;
