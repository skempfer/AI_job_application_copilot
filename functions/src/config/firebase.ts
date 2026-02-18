import * as admin from "firebase-admin";

let firebaseInitialized = false;

export function initializeFirebaseAdmin(): void {
  if (firebaseInitialized) {
    return;
  }

  try {
    // Firebase Functions automatically provides credentials via Application Default Credentials (ADC)
    // No need to specify credential - it will use the service account with proper permissions
    admin.initializeApp();

    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
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
