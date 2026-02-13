/**
 * Logo Animated - Usage Examples
 * 
 * This file documents how to use the animated logo components
 * throughout the Viora application.
 */

/**
 * COMPONENT: LogoAnimated
 * Base component with customizable animations
 * 
 * Usage:
 * import { LogoAnimated } from '@/components/LogoAnimated';
 * 
 * <LogoAnimated size={64} showAnimation={true} />
 * 
 * Props:
 * - size?: number (default: 64) - SVG width/height
 * - strokeColor?: string (default: '#2563eb') - Ring color
 * - coreColor?: string (default: '#2563eb') - Core color
 * - showAnimation?: boolean (default: true) - Enable animation
 * - className?: string - Additional CSS classes
 * 
 * Examples:
 * 
 * // Standard animated logo
 * <LogoAnimated />
 * 
 * // Larger size without animation
 * <LogoAnimated size={96} showAnimation={false} />
 * 
 * // Dark theme variant
 * <LogoAnimated strokeColor="#60a5fa" coreColor="#60a5fa" />
 */

/**
 * COMPONENT: SplashScreen
 * Full-screen splash screen with animated logo
 * Perfect for app initialization/onboarding
 * 
 * Usage:
 * import { SplashScreen } from '@/components/SplashScreen';
 * 
 * State:
 * const [showSplash, setShowSplash] = useState(true);
 * 
 * useEffect(() => {
 *   const timer = setTimeout(() => setShowSplash(false), 2500);
 *   return () => clearTimeout(timer);
 * }, []);
 * 
 * Render:
 * <SplashScreen
 *   show={showSplash}
 *   message="Viora"
 *   subtitle="Clarity for smarter career decisions"
 *   duration={2500}
 * />
 * 
 * Props:
 * - show: boolean - Control visibility
 * - message?: string - Main message
 * - subtitle?: string - Subtitle text
 * - duration?: number - Auto-hide after ms (0 = no auto-hide)
 * 
 * Best for:
 * - App startup
 * - Brand introduction on first load
 * - Premium first impression
 */

/**
 * COMPONENT: LoadingSpinner
 * Branded loading indicator with animated logo
 * Use during API requests or data processing
 * 
 * Usage:
 * import { LoadingSpinner } from '@/components/LoadingSpinner';
 * 
 * State:
 * const [loading, setLoading] = useState(false);
 * 
 * Render:
 * <LoadingSpinner
 *   show={loading}
 *   size="medium"
 *   message="Analyzing job fit..."
 * />
 * 
 * Props:
 * - show: boolean - Control visibility
 * - size?: 'small' | 'medium' | 'large' (default: 'medium')
 * - message?: string - Loading message
 * - overlay?: boolean - Fullscreen overlay (default: false)
 * 
 * Best for:
 * - API calls (useAsyncData hooks)
 * - File uploads/downloads
 * - Data processing feedback
 * - Button loading states
 */

/**
 * ANIMATION DETAILS
 * 
 * Ring Animation:
 * - Duration: 1.2s
 * - Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
 * - Type: Stroke draw from empty to full
 * - Effect: Professional appearance, premium feel
 * 
 * Core Animation:
 * - Duration: 1.5s
 * - Easing: cubic-bezier(0.4, 0.0, 0.6, 1)
 * - Type: Pulse (scale + opacity)
 * - Effect: Subtle vibrance, draws attention without being distracting
 * 
 * Both animations:
 * - Loop infinitely (core) or once (ring)
 * - Respect prefers-reduced-motion preference
 * - Work in light and dark modes
 */

/**
 * INTEGRATION EXAMPLES
 */

// Example 1: App startup with splash screen
// In App.tsx:
// const [appReady, setAppReady] = useState(false);
// 
// useEffect(() => {
//   const timer = setTimeout(() => setAppReady(true), 2000);
//   return () => clearTimeout(timer);
// }, []);
//
// return (
//   <>
//     <SplashScreen show={!appReady} duration={2000} />
//     {appReady && <AppContent />}
//   </>
// );

// Example 2: Loading during API call
// In AnalyzeButton.tsx:
// const [loading, setLoading] = useState(false);
//
// const handleAnalyze = async () => {
//   setLoading(true);
//   try {
//     const result = await analyzeJobFit(cv, jobDescription);
//     // ...
//   } finally {
//     setLoading(false);
//   }
// };
//
// return (
//   <>
//     <button onClick={handleAnalyze} disabled={loading}>
//       {loading ? <LogoAnimated size={24} /> : 'Analyze'}
//     </button>
//     <LoadingSpinner show={loading} overlay message="Analyzing..." />
//   </>
// );

// Example 3: Hero section with animated logo
// In Header.tsx or new HeroSection.tsx:
// <section className="hero">
//   <LogoAnimated size={120} />
//   <h1>Clarity for smarter career decisions</h1>
// </section>

export {};
