import { useState, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface CoverLetterDisplayProps {
  coverLetter: string;
}

export function CoverLetterDisplay({ coverLetter }: CoverLetterDisplayProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const normalizeText = (text: string): string => {
    return text
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^[\s\n]+|[\s\n]+$/g, '');
  };

  const normalizedText = normalizeText(coverLetter);
  
  // DEBUG: Log what we're receiving
  console.log('📄 CoverLetterDisplay - Raw coverLetter:', {
    length: coverLetter.length,
    hasDoubleNewlines: coverLetter.includes('\n\n'),
    hasSingleNewlines: coverLetter.includes('\n'),
    firstChars: coverLetter.substring(0, 100),
    charCodes: coverLetter.substring(0, 50).split('').map(c => `${c}(${c.charCodeAt(0)})`).join(', ')
  });
  console.log('📄 CoverLetterDisplay - After normalizeText:', {
    length: normalizedText.length,
    preview: normalizedText.substring(0, 100)
  });
  
  const paragraphs = normalizedText.split('\n\n').filter(p => p.trim().length > 0);
  console.log('📄 CoverLetterDisplay - Paragraphs:', {
    count: paragraphs.length,
    lengths: paragraphs.map(p => p.length),
    firstParagraph: paragraphs[0]?.substring(0, 50)
  });

  const firstParagraph = paragraphs[0] || '';
  const hasMoreContent = paragraphs.length > 1 || firstParagraph.length > 250;

  const handleReadFull = () => {
    setIsExpanded(true);
    setTimeout(() => {
      scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedText);
      alert(language === 'pt' ? 'Carta copiada com sucesso!' : 'Cover letter copied successfully!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert(language === 'pt' ? 'Erro ao copiar. Tente novamente.' : 'Failed to copy. Try again.');
    }
  };

  const handleEdit = () => {
    alert(language === 'pt' 
      ? 'Funcionalidade de edição em desenvolvimento. Você pode copiar e editar no seu editor de texto favorito.'
      : 'Edit feature coming soon. You can copy and edit in your favorite text editor.'
    );
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([normalizedText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div ref={scrollContainerRef} className="card bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 scroll-smooth">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="text-2xl">📄</span>
          {language === 'pt' ? 'Carta de Apresentação' : 'Cover Letter'}
        </h3>
      </div>

      {!isExpanded ? (
        <div className="space-y-4">
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-slate-300 dark:border-slate-700 leading-relaxed">
              <p className="text-gray-800 dark:text-gray-150 font-serif text-sm whitespace-pre-wrap">
                {firstParagraph}
              </p>
              {hasMoreContent && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent rounded-b-lg"></div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {hasMoreContent && (
              <button
                onClick={handleReadFull}
                className="flex-1 min-w-max px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                {language === 'pt' ? 'Ler Completa' : 'Read Full'}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex-1 min-w-max px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {language === 'pt' ? 'Copiar' : 'Copy'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-slate-300 dark:border-slate-700 max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {paragraphs.map((paragraph, idx) => (
                <p 
                  key={idx}
                  className="text-gray-800 dark:text-gray-200 font-serif text-sm leading-relaxed whitespace-pre-wrap"
                >
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {language === 'pt' ? 'Resumir' : 'Collapse'}
            </button>

            <button
              onClick={handleEdit}
              className="flex-1 min-w-max px-4 py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {language === 'pt' ? 'Editar' : 'Edit'}
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 min-w-max px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {language === 'pt' ? 'Copiar' : 'Copy'}
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 min-w-max px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {language === 'pt' ? 'Baixar' : 'Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
