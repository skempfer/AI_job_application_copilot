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
 * Salva uma análise no Realtime Database
 * 
 * @param analysis - Dados da análise
 * @returns ID do registro criado
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
    console.log(`✅ Análise salva no database: ${analysisId}`);
    
    return analysisId!;
  } catch (error) {
    console.error("❌ Erro ao salvar análise no database:", error);
    throw error;
  }
}

/**
 * Busca histórico de análises
 * 
 * @param limit - Número máximo de registros (padrão: 50)
 * @returns Array de análises ordenadas por timestamp (mais recentes primeiro)
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

    // Inverter para ter mais recentes primeiro
    return analyses.reverse();
  } catch (error) {
    console.error("❌ Erro ao buscar histórico de análises:", error);
    throw error;
  }
}

/**
 * Busca uma análise específica por ID
 * 
 * @param id - ID da análise
 * @returns Dados da análise ou null se não encontrada
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
    console.error(`❌ Erro ao buscar análise ${id}:`, error);
    throw error;
  }
}

/**
 * Obtém estatísticas das análises
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
    console.error("❌ Erro ao obter estatísticas:", error);
    throw error;
  }
}
