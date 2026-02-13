import { useLanguage } from '../../hooks/useLanguage';
import { Link } from 'react-router-dom';
import './Terms.css';

export function Terms() {
  const { t, language } = useLanguage();

  return (
    <div className="terms-page">
      <div className="terms-container">
        <Link
          to="/"
          className="terms-back-link"
        >
          <svg className="terms-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToHome')}
        </Link>

        <div className="terms-header">
          <h1 className="terms-title">
            {t('termsTitle')}
          </h1>
          <p className="terms-updated">
            {t('termsLastUpdated')}: {language === 'pt' ? 'Fevereiro 2026' : 'February 2026'}
          </p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2 className="terms-section-title">
              {t('termsIntroTitle')}
            </h2>
            <p className="terms-section-text">
              {t('termsIntroText')}
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">
              {t('termsUseTitle')}
            </h2>
            <p className="terms-section-text">
              {t('termsUseText')}
            </p>
            <ul className="terms-section-list">
              <li className="terms-section-item">{t('termsUseItem1')}</li>
              <li className="terms-section-item">{t('termsUseItem2')}</li>
              <li className="terms-section-item">{t('termsUseItem3')}</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">
              {t('termsAffiliationTitle')}
            </h2>
            <p className="terms-section-text">
              {t('termsAffiliationText')}
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">
              {t('termsDataTitle')}
            </h2>
            <p className="terms-section-text">
              {t('termsDataText')}
            </p>
            <ul className="terms-section-list">
              <li className="terms-section-item">{t('termsDataItem1')}</li>
              <li className="terms-section-item">{t('termsDataItem2')}</li>
              <li className="terms-section-item">{t('termsDataItem3')}</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">
              {t('termsLiabilityTitle')}
            </h2>
            <p className="terms-section-text">
              {t('termsLiabilityText')}
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">
              {t('termsContactTitle')}
            </h2>
            <p className="terms-section-text">
              {t('termsContactText')}
            </p>
            <p className="terms-section-text">
              <span className="terms-contact-label">Email:</span>{' '}
              <a href="mailto:contact@viora.app" className="terms-email-link">
                contact@viora.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
