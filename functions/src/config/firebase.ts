import * as admin from "firebase-admin";

let firebaseInitialized = false;

export function initializeFirebaseAdmin(): void {
  if (firebaseInitialized) {
    return;
  }

  try {
    admin.initializeApp({
      databaseURL: "https://viora-cv-uploads-default-rtdb.firebaseio.com",
      storageBucket: "viora-cv-uploads.firebasestorage.app",
    });

    firebaseInitialized = true;
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
