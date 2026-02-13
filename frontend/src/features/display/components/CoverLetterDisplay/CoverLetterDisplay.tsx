import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { getLanguageLabel } from '../../../../utils/languageDetection';
import './CoverLetterDisplay.css';

interface CoverLetterDisplayProps {
  coverLetter: string;
  detectedLanguage?: 'pt' | 'en';
}

/**
 * Parsed cover letter structure
 */
interface ParsedCoverLetter {
  bodyParagraphs: string[];
  signature: string;
  fullText: string;
  plainText: string;
}

/**
 * Parse cover letter into structured sections
 */
function parseCoverLetter(text: string): ParsedCoverLetter {
  const normalized = text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^[\s\n]+|[\s\n]+$/g, '');

  let lines = normalized.split(/\n\n+/).filter(p => p.trim().length > 0);

  if (lines.length === 1) {
    const text = lines[0];
    
    const sentencePattern = /([^.!?]*[.!?])\s+(?=[A-Z])/g;
    const sentences = [];
    let lastIndex = 0;
    let match;

    const regex = new RegExp(sentencePattern);
    while ((match = regex.exec(text)) !== null) {
      sentences.push(text.substring(lastIndex, match.index + match[1].length).trim());
      lastIndex = match.index + match[1].length + 1;
    }
    if (lastIndex < text.length) {
      sentences.push(text.substring(lastIndex).trim());
    }

    if (sentences.length > 0) {
      lines = [];
      let currentParagraph = '';
      for (let i = 0; i < sentences.length; i++) {
        currentParagraph += (currentParagraph ? ' ' : '') + sentences[i];
        if ((i + 1) % 2 === 0 || currentParagraph.length > 400) {
          if (currentParagraph.trim().length > 0) {
            lines.push(currentParagraph.trim());
          }
          currentParagraph = '';
        }
      }
      if (currentParagraph.trim().length > 0) {
        lines.push(currentParagraph.trim());
      }
    }

    if (lines.length === 0) {
      lines = [text];
    }
  }

  const signaturePatterns = [
    /^(best regards|best|kind regards|sincerely|regards|respectfully|yours|atenciosamente|atenciosamente,|cordialmente|abraços|um abraço|obrigado|thanks|thank you)/i,
    /^[a-z\s,'-]*,?\s*$/i,
  ];

  let signature = '';
  let bodyParagraphs = lines;

  if (lines.length > 0) {
    const lastLine = lines[lines.length - 1];
    if (signaturePatterns.some(pattern => pattern.test(lastLine.trim()))) {
      signature = lines.pop()?.trim() || '';
    }
  }

  bodyParagraphs = bodyParagraphs.map(p => p.trim()).filter(p => p.length > 0);

  const plainText = [
    ...bodyParagraphs.map(p => p.replace(/\n/g, ' ')), 
    signature,
  ]
    .filter(Boolean)
    .join('\n\n');

  const fullText = [
    ...bodyParagraphs.map(p => p.replace(/\n/g, ' ')),
    signature,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    bodyParagraphs,
    signature,
    fullText,
    plainText,
  };
}

/**
 * Generate dynamic filename for exports
 */
function generateFilename(
  language: 'pt' | 'en',
  format: 'txt' | 'pdf' | 'docx' = 'txt'
): string {
  const date = new Date().toISOString().slice(0, 10);
  const langCode = language === 'pt' ? 'pt' : 'en';
  return `cover-letter-${langCode}-${date}.${format}`;
}

export function CoverLetterDisplay({ coverLetter, detectedLanguage }: CoverLetterDisplayProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout>();

  const parsed = parseCoverLetter(coverLetter);

  useEffect(() => {
    if (copyFeedback) {
      copyTimeoutRef.current = setTimeout(() => setCopyFeedback(null), 3000);
      return () => {
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
      };
    }
  }, [copyFeedback]);

  const handleReadFull = () => {
    setIsExpanded(true);
    setTimeout(() => {
      scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(parsed.plainText);
      setCopyFeedback(language === 'pt' ? '✓ Copiado!' : '✓ Copied!');
      const copyButtons = document.querySelectorAll('[data-copy-button]');
      copyButtons.forEach(btn => {
        if (btn instanceof HTMLElement) btn.focus();
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyFeedback(language === 'pt' ? '✗ Erro ao copiar' : '✗ Copy failed');
    }
  };



  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([parsed.plainText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = generateFilename(language, 'txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleDownload = handleDownloadTxt;

  const firstParagraph = parsed.bodyParagraphs[0] || '';
  const hasMoreContent = parsed.bodyParagraphs.length > 1 || firstParagraph.length > 250;

  return (
    <div ref={scrollContainerRef} className="card cover-letter">
      <div className="cover-letter__header">
        <h3 className="cover-letter__title">
          <span className="cover-letter__title-icon">📄</span>
          {language === 'pt' ? 'Carta de Apresentação' : 'Cover Letter'}
        </h3>
      </div>

      {detectedLanguage && (
        <p className="cover-letter__language" role="doc-subtitle">
          {getLanguageLabel(detectedLanguage, language as 'pt' | 'en')}
        </p>
      )}

      {!isExpanded ? (
        <div className="cover-letter__collapsed">
          <div className="cover-letter__preview">
            <article className="cover-letter__preview-article">
              <p className="cover-letter__preview-text">
                {firstParagraph}
              </p>
              {hasMoreContent && (
                <div className="cover-letter__preview-fade"></div>
              )}
            </article>
          </div>

         <div className="cover-letter__actions">
            {hasMoreContent && (
              <button
                onClick={handleReadFull}
                className="cover-letter__button cover-letter__button--read"
              >
                <svg className="cover-letter__button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                {language === 'pt' ? 'Ler Completa' : 'Read Full'}
              </button>
            )}

            <button
              onClick={handleCopy}
              data-copy-button
              className="cover-letter__button cover-letter__button--copy-neutral"
            >
              <svg className="cover-letter__button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {language === 'pt' ? 'Copiar' : 'Copy'}
            </button>

            <button
              onClick={handleDownload}
              className="cover-letter__button cover-letter__button--download"
            >
              <svg className="cover-letter__button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {language === 'pt' ? 'Baixar' : 'Download'}
            </button>
          </div>

          {copyFeedback && (
            <div
              className="cover-letter__feedback"
              role="status"
              aria-live="polite"
            >
              {copyFeedback}
            </div>
          )}
        </div>
      ) : (
        <div className="cover-letter__expanded">
          <article className="cover-letter__full-article">
            <div className="cover-letter__paragraphs">
              {parsed.bodyParagraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="cover-letter__paragraph"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {parsed.signature && (
              <div className="cover-letter__signature">
                <p className="cover-letter__paragraph">
                  {parsed.signature}
                </p>
              </div>
            )}
          </article>

          <div className="cover-letter__actions">
            <button
              onClick={() => setIsExpanded(false)}
              className="cover-letter__button cover-letter__button--collapse"
            >
              <svg className="cover-letter__button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {language === 'pt' ? 'Resumir' : 'Collapse'}
            </button>

            <button
              onClick={handleCopy}
              data-copy-button
              className="cover-letter__button cover-letter__button--copy-primary"
            >
              <svg className="cover-letter__button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {language === 'pt' ? 'Copiar' : 'Copy'}
            </button>

            <button
              onClick={handleDownload}
              className="cover-letter__button cover-letter__button--download"
            >
              <svg className="cover-letter__button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {language === 'pt' ? 'Baixar' : 'Download'}
            </button>
          </div>

          {copyFeedback && (
            <div
              className="cover-letter__feedback"
              role="status"
              aria-live="polite"
            >
              {copyFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
