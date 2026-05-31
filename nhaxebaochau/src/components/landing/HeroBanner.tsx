'use client';

import type { SiteSettings } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface HeroBannerProps {
  settings: SiteSettings | null;
}

export default function HeroBanner({ settings: _settings }: HeroBannerProps) {
  const t = useTranslations('hero');

  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const confirmCall = window.confirm("Bạn có muốn thực hiện cuộc gọi đến số 0335-232-346 không?");
    if (confirmCall) {
      window.location.href = "tel:0335232346";
    }
  };

  return (
    <section className="hero" id="hero">
      <picture>
        <source media="(min-width: 768px)" srcSet="/image/Herosecsison/hero.png" />
        <img
          src="/image/Herosecsison/mobile.png"
          alt="Nhà Xe Duy Hùng - Xe ghép cao cấp Huế Đà Nẵng Hội An"
          className="hero-banner-img"
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      <div className="hero-gradient-overlay" aria-hidden="true" />

      <div className="hero-cta-strip">
        <div className="hero-cta-strip-inner">
          <div className="hero-cta-info">
            <span className="hero-cta-badge">🔥 {t('badge')}</span>
            <span className="hero-cta-desc">{t('confirm')}</span>
          </div>
          <div className="hero-cta-actions">
            <a href="#booking" className="hero-cta-btn">
              <span className="hero-cta-text">{t('cta')}</span>
              <span className="hero-cta-arrow">→</span>
            </a>
            <a
              href="tel:0335232346"
              onClick={handlePhoneClick}
              className="hero-cta-btn hero-phone-btn"
            >
              <span className="hero-cta-text">Liên hệ: 0335-232-346</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
