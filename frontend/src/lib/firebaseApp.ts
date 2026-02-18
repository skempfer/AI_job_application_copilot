import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const hasFirebaseConfig = Object.values(firebaseConfig).every((value) => Boolean(value));
function initializeAppCheckIfNeeded(app: FirebaseApp): void {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  
  if (!recaptchaSiteKey) {
    if (import.meta.env.DEV) {
      console.warn(
        '[AppCheck] reCAPTCHA site key not found. Set VITE_RECAPTCHA_SITE_KEY in .env'
      );
    }
    return;
  }

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug('[AppCheck] Already initialized or unavailable:', error);
    }
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseConfig) {
    return null;
  }

  if (getApps().length) {
    return getApps()[0];
  }

  try {
    const app = initializeApp(firebaseConfig);
    
    initializeAppCheckIfNeeded(app);
    
    return app;
  } catch {
    return null;
  }
}
