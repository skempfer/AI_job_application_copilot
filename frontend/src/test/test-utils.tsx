import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
