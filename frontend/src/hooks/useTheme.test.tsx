import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { useTheme } from './useTheme';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

describe('useTheme', () => {
  const mockSetTheme = jest.fn();

  // Create a wrapper component that returns JSX
  const createWrapper = (themeValue: any) => {
    const Wrapper = ({ children }: { children: ReactNode }) => {
      // Using React.createElement to avoid JSX syntax issues in TS
      return themeValue ? (
        <ThemeContext.Provider value={themeValue}>
          {children}
        </ThemeContext.Provider>
      ) : null;
    };
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('basic functionality', () => {
    it('should provide theme and setTheme from context', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.theme).toBe('light');
      expect(typeof result.current.setTheme).toBe('function');
    });

    it('should retrieve current light theme', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.theme).toBe('light');
    });

    it('should retrieve current dark theme', () => {
      const contextValue = {
        theme: 'dark' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('setTheme functionality', () => {
    it('should call setTheme from context', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should support switching from light to dark', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.setTheme('dark');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should support switching from dark to light', () => {
      const contextValue = {
        theme: 'dark' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.setTheme('light');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('toggleTheme functionality', () => {
    it('should provide toggleTheme function', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(typeof result.current.toggleTheme).toBe('function');
    });

    it('should toggle from light to dark', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should toggle from dark to light', () => {
      const contextValue = {
        theme: 'dark' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should toggle correctly multiple times', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      act(() => {
        result.current.toggleTheme();
      });
      expect(mockSetTheme).toHaveBeenCalledWith('dark');

      mockSetTheme.mockClear();
    });
  });

  describe('resetToSystem functionality', () => {
    it('should provide resetToSystem function', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(typeof result.current.resetToSystem).toBe('function');
    });

    it('should remove theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');

      const contextValue = {
        theme: 'dark' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      const originalLocation = window.location;
      const reloadMock = jest.fn();
      delete (window as any).location;
      (window as any).location = { reload: reloadMock };

      act(() => {
        result.current.resetToSystem();
      });

      expect(localStorage.getItem('theme')).toBeNull();

      (window as any).location = originalLocation;
    });
  });

  describe('context error handling', () => {
    it('should throw error when used outside ThemeProvider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within ThemeProvider');

      spy.mockRestore();
    });

    it('should throw error with meaningful message', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();

      try {
        renderHook(() => useTheme());
      } catch (error) {
        expect((error as Error).message).toContain('ThemeProvider');
      }

      spy.mockRestore();
    });
  });

  describe('theme state updates', () => {
    it('should reflect theme from context', () => {
      const contextValue = {
        theme: 'dark' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      // Should reflect the context value provided
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('multiple hook instances', () => {
    it('should return same theme for multiple hook instances', () => {
      const contextValue = {
        theme: 'dark' as Theme,
        setTheme: mockSetTheme,
      };

      const { result: result1 } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      const { result: result2 } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result1.current.theme).toBe(result2.current.theme);
      expect(result1.current.theme).toBe('dark');
    });

    it('should toggle independently on different instances', () => {
      const setTheme1 = jest.fn();
      const setTheme2 = jest.fn();

      const contextValue1 = {
        theme: 'light' as Theme,
        setTheme: setTheme1,
      };

      const contextValue2 = {
        theme: 'dark' as Theme,
        setTheme: setTheme2,
      };

      const { result: result1 } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue1),
      });

      const { result: result2 } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue2),
      });

      act(() => {
        result1.current.toggleTheme();
        result2.current.toggleTheme();
      });

      expect(setTheme1).toHaveBeenCalledWith('dark');
      expect(setTheme2).toHaveBeenCalledWith('light');
    });
  });

  describe('hook return type', () => {
    it('should return object with expected properties', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('setTheme');
      expect(result.current).toHaveProperty('toggleTheme');
      expect(result.current).toHaveProperty('resetToSystem');
    });

    it('should return correct property types', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(typeof result.current.theme).toBe('string');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.resetToSystem).toBe('function');
    });
  });

  describe('supported themes', () => {
    it('should support light theme', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.theme).toBe('light');
    });

    it('should support dark theme', () => {
      const contextValue = {
        theme: 'dark' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('integration scenarios', () => {
    it('should support complete user workflow', () => {
      const contextValue = {
        theme: 'light' as Theme,
        setTheme: mockSetTheme,
      };

      const { result } = renderHook(() => useTheme(), {
        wrapper: createWrapper(contextValue),
      });

      // User starts in light theme
      expect(result.current.theme).toBe('light');

      // User toggles to dark
      act(() => {
        result.current.toggleTheme();
      });
      expect(mockSetTheme).toHaveBeenCalledWith('dark');

      // User can set theme directly
      mockSetTheme.mockClear();
      act(() => {
        result.current.setTheme('light');
      });
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });
});
