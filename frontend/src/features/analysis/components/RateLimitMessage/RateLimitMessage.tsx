import { useEffect, useState } from 'react';
import { getTimeUntilReset, isRateLimited } from '../../../../utils/rateLimiter';
import { useLanguage } from '../../../../hooks/useLanguage';
import './RateLimitMessage.css';

/**
 * RateLimitMessage Component
 * Displays a friendly rate limit message with live countdown timer
 * Supports multi-language display based on user's selected language
 */
export function RateLimitMessage() {
  const { t } = useLanguage();
  const [isLimited, setIsLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const checkLimitStatus = setInterval(() => {
      const limited = isRateLimited();
      const timeUntilReset = getTimeUntilReset();

      setIsLimited(limited);
      setTimeRemaining(timeUntilReset);
    }, 500);

    return () => clearInterval(checkLimitStatus);
  }, []);

  if (!isLimited || timeRemaining <= 0) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="rate-limit-message" role="alert" aria-live="polite">
      <div className="rate-limit-message__container">
        <span className="rate-limit-message__icon">😅</span>
        <div className="rate-limit-message__content">
          <p className="rate-limit-message__text">
            {t('rateLimitTitle')}
          </p>
          <p className="rate-limit-message__subtext">
            {t('rateLimitMessage')}{' '}
            <span className="rate-limit-message__timer">{formattedTime}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
