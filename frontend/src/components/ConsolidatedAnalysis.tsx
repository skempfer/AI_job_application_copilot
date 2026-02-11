import { useLanguage } from '../hooks/useLanguage';
import type { FormattedAnalysisResult } from '../types/analysis';
import type { GapAnalysisResult } from '../types/analysis';

interface ConsolidatedAnalysisProps {
  result: FormattedAnalysisResult;
  gapResult: GapAnalysisResult;
}

export function ConsolidatedAnalysis({ result, gapResult }: ConsolidatedAnalysisProps) {
  const { t } = useLanguage();
  const technicalScore = gapResult.matchScore;
  const overallScore = result.fitScore;

  return (
    <div className="space-y-6 animate-fade-in mt-8 pt-8 border-t-2 border-gray-300 dark:border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          📋 Resumo da Análise
        </h2>
        <p className="text-sm text-gray-800 dark:text-gray-100">
          Síntese de ambas as análises para uma decisão mais assertiva
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          📋 Recomendação 
        </h3>
        
        {overallScore >= 70 && technicalScore >= 70 ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-semibold mb-2">✅ Excelente Candidato</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Você atende tanto os requisitos técnicos quanto o alinhamento geral. Esta é uma vaga muito adequada para você. Aplique com confiança!
            </p>
          </div>
        ) : overallScore >= 50 && technicalScore >= 50 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">⚠️ Bom Ajuste (com ressalvas)</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {technicalScore < overallScore 
                ? 'Você tem bom fit geral, mas pode precisar aprender algumas tecnologias específicas. Considere estudar as skills faltando antes de aplicar.'
                : 'Você tem as skills técnicas, mas pode não ter toda experiência esperada. Mostre sua capacidade de aprendizado rápido na aplicação.'}
            </p>
          </div>
        ) : (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 p-4 rounded-lg">
            <p className="text-orange-800 dark:text-orange-200 font-semibold mb-2">🤔 Desafio Significativo</p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Existem gaps significativos entre seu perfil e os requisitos. Pode ser um candidato em transição de carreira. Foque em aprender as skills críticas antes.
            </p>
          </div>
        )}
      </div>

      {result.cvSuggestions.length > 0 && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">📝</span>
            {t('suggestions')}
          </h3>
          <ul className="space-y-3">
            {result.cvSuggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">{idx + 1}.</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400">💬</span>
          {t('recruiterMessage')}
        </h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-300 dark:border-green-700">
          <p className="text-gray-800 dark:text-gray-200 italic leading-relaxed">
            "{result.recruiterMessage}"
          </p>
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">
          💡 Personalize esta mensagem antes de enviar
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          🎯 Próximos Passos
        </h3>
        <ul className="space-y-3">
          {technicalScore < overallScore && (
            <li className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Aprenda as skills faltando:</strong> {gapResult.missingCriticalSkills.slice(0, 2).join(', ')}
              </span>
            </li>
          )}
          {overallScore < 70 && (
            <li className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">{technicalScore < overallScore ? '2' : '1'}</span>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Ganhe experiência relevante</strong> ou procure vagas mais juniores
              </span>
            </li>
          )}
          <li className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{overallScore >= 70 && technicalScore >= 70 ? '1' : overallScore < 70 ? '2' : '2'}</span>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Customize sua aplicação</strong> mencionando especificamente as skills que você possui
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
