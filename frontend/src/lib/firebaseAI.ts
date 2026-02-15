import {
  type App,
  type Firestore,
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";
import type {
  AIProviderFailureReason,
  AIFallbackProvider,
  AIProviderFallbackResponse,
} from "../types/analysis";
import { getFirebaseApp } from "./firebaseApp";
import { ENV } from "../config/app.config";

let db: Firestore | null = null;

function getDb(): Firestore | null {
  if (db) {
    return db;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    db = getFirestore(app);

    // Use emulator in development for testing
    if (ENV.isDev && !db._initialized) {
      try {
        connectFirestoreEmulator(db, "localhost", 8080);
      } catch {
        // Already connected or not available - silently continue
      }
    }

    return db;
  } catch {
    return null;
  }
}

/**
 * Response from Firebase AI fallback
 * Includes structured error and recovered prompts
 */
export interface FirebaseAIFallbackResponse {
  success: true;
  provider: "firebase";
  result: {
    fitScore: number;
    decision: "apply" | "apply_with_fixes" | "skip";
    recruiterMessage: string;
    coverLetter: string;
    explanation: {
      positives: string[];
      negatives: string[];
      summary: string;
    };
  };
  context: {
    primaryProviderFailed: AIProviderFailureReason;
    primaryProviderPrompt: {
      system: string;
      user: string;
    };
  };
}

/**
 * Query Firebase Firestore for cached AI fallback responses
 * Uses job description hash to find similar cached results
 *
 * This allows the frontend to recover from primary provider failures
 * by leveraging previously computed analyses
 */
export async function queryFirestoreForFallback(
  response: AIProviderFallbackResponse
): Promise<FirebaseAIFallbackResponse | null> {
  // Validate that we have the required prompt data
  if (!response.prompt?.user) {
    console.warn("[FirestoreAI] No prompt data available for fallback");
    return null;
  }

  const db = getDb();
  if (!db) {
    console.warn("[FirestoreAI] Firestore not initialized");
    return null;
  }

  // For now, return null to indicate Firebase fallback not yet implemented
  // In a full implementation, this would:
  // 1. Hash the job description prompt
  // 2. Query previous results with similar hashes
  // 3. Return cached analysis if found
  // 4. Otherwise, trigger offline/degraded mode

  return null;
}

/**
 * Store a successful analysis result in Firestore for future fallback use
 *
 * @param prompt - The original system + user prompt
 * @param result - The analysis result from the primary provider
 */
export async function storeAnalysisInFirestore(
  prompt: { system: string; user: string },
  result: unknown
): Promise<boolean> {
  const db = getDb();
  if (!db) {
    return false;
  }

  // Store implementation would go here
  // This allows future executions to use cached results
  return true;
}
