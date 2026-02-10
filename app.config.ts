/**
 * Application Configuration
 * Centralized product metadata and branding
 */

export const PRODUCT = {
  name: 'Viora',
  tagline: 'Clarity for smarter career decisions',
  description:
    'Viora is an AI-powered career intelligence tool that helps you see job opportunities more clearly, evaluate real fit, and make smarter career decisions with confidence.',
};

/**
 * Version Information
 * Follows semantic versioning
 */
export const VERSION = {
  major: 1,
  minor: 1,
  patch: 0,
  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
};

/**
 * Application Metadata
 */
export const APP_METADATA = {
  title: `${PRODUCT.name} - ${PRODUCT.tagline}`,
  description: PRODUCT.description,
  version: VERSION.toString(),
  keywords: [
    'career',
    'job-search',
    'AI',
    'fit-analysis',
    'decision-support',
    'recruitment',
  ],
  author: 'Viora Team',
  license: 'MIT',
  repository: 'https://github.com/skempfer/AI_job_application_copilot',
};

/**
 * Feature Flags
 * Control feature availability without code changes
 */
export const FEATURES = {
  i18n: true, // Internationalization (en, pt)
  themes: true, // Theme switching (light, dark)
  accessibility: true, // WCAG 2.1 AA compliance
  analytics: false, // User analytics (disabled by default)
  beta: false, // Beta features
};

/**
 * Environment Configuration
 */
export const ENV = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
