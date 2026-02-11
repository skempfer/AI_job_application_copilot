import type { GapAnalysisResult } from '../types/analysis';

interface GapAnalysisDisplayProps {
  result: GapAnalysisResult;
}

export function GapAnalysisDisplay({ result }: GapAnalysisDisplayProps) {
  const clampedScore = Math.max(0, Math.min(100, result.matchScore));
  
  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-gray-800 dark:text-blue-400">🔧 Análise Técnica</span>
            <span className="text-xs px-2 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-semibold">
              Match de Skills
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-blue-300">
            Compara as tecnologias do seu CV com as exigidas na vaga. Score percentual baseado em match técnico.
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-3 pt-2 border-t border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Match Técnico</h3>
          <div className={`px-4 py-2 rounded-full border-2 font-bold text-lg ${getScoreBadgeClass(clampedScore)}`}>
            {clampedScore}%
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>

      {result.strongMatches.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            Skills que você possui
          </h3>
          <ul className="flex flex-wrap gap-2">
            {result.strongMatches.map((match) => (
              <li
                key={match}
                className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium"
              >
                {match}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.missingCriticalSkills.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400">✕</span>
            Skills críticas faltando
          </h3>
          <ul className="space-y-2">
            {result.missingCriticalSkills.map((skill) => (
              <li key={skill} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-red-500 dark:text-red-400 mt-1">•</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestedFocusAreas.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-orange-600 dark:text-orange-400">→</span>
            Próximas tecnologias a aprender
          </h3>
          <ul className="space-y-2">
            {result.suggestedFocusAreas.map((area) => (
              <li key={area} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-orange-500 dark:text-orange-400 mt-1">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
