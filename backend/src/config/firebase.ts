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
        "FIREBASE_SERVICE_ACCOUNT não está definida nas variáveis de ambiente"
      );
    }

    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK inicializado com sucesso");
    if (process.env.FIREBASE_DATABASE_URL) {
      console.log("✅ Realtime Database conectado:", process.env.FIREBASE_DATABASE_URL);
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase Admin SDK:", error);
    throw error;
  }
}

export function getStorageBucket() {
  if (!firebaseInitialized) {
    throw new Error("Firebase não foi inicializado. Chame initializeFirebase() primeiro");
  }

  return admin.storage().bucket();
}

export function getFirebaseAdmin() {
  return admin;
}


export function getDatabase() {
  if (!firebaseInitialized) {
    throw new Error("Firebase não foi inicializado. Chame initializeFirebase() primeiro");
  }

  return admin.database();
}
