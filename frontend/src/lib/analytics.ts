import { initializeApp, getApps } from 'firebase/app';
import { Analytics, getAnalytics, isSupported, logEvent, setUserId as setFirebaseUserId } from 'firebase/analytics';
import { FEATURES, ENV } from '../config/app.config';

export type AnalyticsEvent =
  | 'page_view'
  | 'cv_uploaded'
  | 'job_description_filled'
  | 'analyze_clicked'
  | 'analysis_success'
  | 'analysis_error'
  | 'cover_letter_generated'
  | 'recruiter_message_generated';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every((value) => Boolean(value));

let analyticsPromise: Promise<Analytics | null> | null = null;

async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (typeof window === 'undefined' || ENV.isTest) {
    return null;
  }

  if (!FEATURES.analytics || !hasFirebaseConfig) {
    return null;
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => {
        if (!supported) {
          return null;
        }

        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        
        // Enable debug mode in development
        if (ENV.isDev && firebaseConfig.measurementId) {
          (window as any).gtag('config', firebaseConfig.measurementId, {
            'debug_mode': true
          });
        }
        
        return analytics;
      })
      .catch(() => null);
  }

  return analyticsPromise;
}

export async function trackEvent(eventName: AnalyticsEvent, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || ENV.isTest) {
    return;
  }

    const analytics = await getAnalyticsInstance();
    if (!analytics) return;

    logEvent(analytics, eventName as string, params);

}

export async function identifyUser(userId: string | null) {
  if (!userId || typeof window === 'undefined' || ENV.isTest) {
    return;
  }

    const analytics = await getAnalyticsInstance();
    if (!analytics) return;

    setFirebaseUserId(analytics, userId);

}
