import { useLanguage } from '../hooks/useLanguage';

/**
 * Header - Application header with translated title
 * Example of using useLanguage hook in a real component
 */
export function Header() {
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-4xl">🤖</span>
          {t('appTitle')}
        </h1>
        <p className="mt-2 text-gray-600">
          Analise o fit entre seu CV e vagas usando IA — tome decisões informadas, não automatize spam.
        </p>
      </div>
    </header>
  );
}
