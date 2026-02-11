import { useLanguage } from '../hooks/useLanguage';
import { Link } from 'react-router-dom';

export function Terms() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToHome')}
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('termsTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('termsLastUpdated')}: {language === 'pt' ? 'Fevereiro 2026' : 'February 2026'}
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('termsIntroTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {t('termsIntroText')}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('termsUseTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {t('termsUseText')}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>{t('termsUseItem1')}</li>
              <li>{t('termsUseItem2')}</li>
              <li>{t('termsUseItem3')}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('termsAffiliationTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('termsAffiliationText')}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('termsDataTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {t('termsDataText')}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>{t('termsDataItem1')}</li>
              <li>{t('termsDataItem2')}</li>
              <li>{t('termsDataItem3')}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('termsLiabilityTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('termsLiabilityText')}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('termsContactTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {t('termsContactText')}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong>{' '}
              <a href="mailto:contact@viora.app" className="text-blue-600 dark:text-blue-400 hover:underline">
                contact@viora.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
