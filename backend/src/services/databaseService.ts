import { getDatabase } from "../config/firebase.js";

export interface AnalysisRecord {
  id?: string;
  timestamp: number;
  fitScore: number;
  decision: string;
  jobTitle?: string;
  resumeFileName?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
}

/**
 * Save an analysis in Realtime Database
 *
 * @param analysis - Analysis data
 * @returns ID of the created record
 */
export async function saveAnalysis(analysis: Omit<AnalysisRecord, "id">): Promise<string> {
  try {
    const db = getDatabase();
    const analysesRef = db.ref("analyses");
    
    const newAnalysisRef = analysesRef.push();
    await newAnalysisRef.set({
      ...analysis,
      timestamp: Date.now(),
    });

    const analysisId = newAnalysisRef.key;
    
    return analysisId!;
  } catch (error) {
    console.error("❌ Error saving analysis to database:", error);
    throw error;
  }
}

/**
 * Fetch analysis history
 *
 * @param limit - Maximum number of records (default: 50)
 * @returns Array of analyses ordered by timestamp (most recent first)
 */
export async function getAnalysisHistory(limit: number = 50): Promise<AnalysisRecord[]> {
  try {
    const db = getDatabase();
    const analysesRef = db.ref("analyses");
    
    const snapshot = await analysesRef
      .orderByChild("timestamp")
      .limitToLast(limit)
      .once("value");

    if (!snapshot.exists()) {
      return [];
    }

    const analyses: AnalysisRecord[] = [];
    snapshot.forEach((childSnapshot) => {
      analyses.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });

    return analyses.reverse();
  } catch (error) {
    console.error("❌ Error fetching analysis history:", error);
    throw error;
  }
}

/**
 * Fetch a specific analysis by ID
 *
 * @param id - Analysis ID
 * @returns Analysis data or null if not found
 */
export async function getAnalysisById(id: string): Promise<AnalysisRecord | null> {
  try {
    const db = getDatabase();
    const analysisRef = db.ref(`analyses/${id}`);
    
    const snapshot = await analysisRef.once("value");
    
    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.key!,
      ...snapshot.val(),
    };
  } catch (error) {
    console.error(`❌ Error fetching analysis ${id}:`, error);
    throw error;
  }
}

/**
 * Get analysis statistics
 */
export async function getAnalyticsStats() {
  try {
    const db = getDatabase();
    const analysesRef = db.ref("analyses");
    
    const snapshot = await analysesRef.once("value");
    
    if (!snapshot.exists()) {
      return {
        totalAnalyses: 0,
        averageScore: 0,
        decisionCounts: {},
      };
    }

    let total = 0;
    let scoreSum = 0;
    const decisionCounts: Record<string, number> = {};

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      total++;
      scoreSum += data.fitScore || 0;
      
      const decision = data.decision || "unknown";
      decisionCounts[decision] = (decisionCounts[decision] || 0) + 1;
    });

    return {
      totalAnalyses: total,
      averageScore: total > 0 ? Math.round(scoreSum / total) : 0,
      decisionCounts,
    };
  } catch (error) {
    console.error("❌ Error getting statistics:", error);
    throw error;
  }
}
