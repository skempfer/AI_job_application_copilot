import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { useLanguage } from './useLanguage';
import { LanguageContext } from '../contexts/LanguageContext';

describe('useLanguage', () => {
  const mockSetLanguage = jest.fn();

  const createWrapper = (languageValue: any) => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <LanguageContext.Provider value={languageValue}>
        {children}
      </LanguageContext.Provider>
    );
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should provide language and setLanguage from context', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.language).toBe('en');
      expect(typeof result.current.setLanguage).toBe('function');
    });

    it('should retrieve current language', () => {
      const contextValue = {
        language: 'pt' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.language).toBe('pt');
    });
  });

  describe('setLanguage functionality', () => {
    it('should call setLanguage from context', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      act(() => {
        result.current.setLanguage('pt');
      });

      expect(mockSetLanguage).toHaveBeenCalledWith('pt');
    });

    it('should support switching from English to Portuguese', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.language).toBe('en');

      act(() => {
        result.current.setLanguage('pt');
      });

      expect(mockSetLanguage).toHaveBeenCalledWith('pt');
    });

    it('should support switching from Portuguese to English', () => {
      const contextValue = {
        language: 'pt' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.language).toBe('pt');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(mockSetLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('translation functions', () => {
    it('should provide translation function t', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(typeof result.current.t).toBe('function');
    });

    it('should provide freeform translation function', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(typeof result.current.translateFreeform).toBe('function');
    });
  });

  describe('context error handling', () => {
    it('should throw error when used outside LanguageProvider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useLanguage());
      }).toThrow('useLanguage must be used within LanguageProvider');

      spy.mockRestore();
    });

    it('should throw error with meaningful message', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();

      try {
        renderHook(() => useLanguage());
      } catch (error) {
        expect((error as Error).message).toContain('LanguageProvider');
      }

      spy.mockRestore();
    });
  });

  describe('language state updates', () => {
    it('should reflect language from context', () => {
      const contextValue = {
        language: 'pt' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.language).toBe('pt');
    });
  });

  describe('multiple hook instances', () => {
    it('should return same language for multiple hook instances', () => {
      const contextValue = {
        language: 'pt' as const,
        setLanguage: mockSetLanguage,
      };

      const { result: result1 } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      const { result: result2 } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result1.current.language).toBe(result2.current.language);
      expect(result1.current.language).toBe('pt');
    });
  });

  describe('hook return type', () => {
    it('should return object with expected properties', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current).toHaveProperty('language');
      expect(result.current).toHaveProperty('setLanguage');
      expect(result.current).toHaveProperty('t');
      expect(result.current).toHaveProperty('translateFreeform');
    });

    it('should return correct property types', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(typeof result.current.language).toBe('string');
      expect(typeof result.current.setLanguage).toBe('function');
      expect(typeof result.current.t).toBe('function');
      expect(typeof result.current.translateFreeform).toBe('function');
    });
  });

  describe('supported languages', () => {
    it('should support english language', () => {
      const contextValue = {
        language: 'en' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.language).toBe('en');
    });

    it('should support portuguese language', () => {
      const contextValue = {
        language: 'pt' as const,
        setLanguage: mockSetLanguage,
      };

      const { result } = renderHook(() => useLanguage(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.language).toBe('pt');
    });
  });
});
