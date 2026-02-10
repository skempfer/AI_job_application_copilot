import { Logo } from './Logo';

/**
 * Header - Application header with Viora branding
 * Displays logo and tagline, with responsive design
 */
export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Logo width={180} height={48} />
        </div>
        <p className="mt-2 text-gray-600 text-sm font-medium">
          Clarity for smarter career decisions
        </p>
      </div>
    </header>
  );
}
