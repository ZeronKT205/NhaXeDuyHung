'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { useTranslations } from 'next-intl';

const NAV_HREFS = ['#hero', '#vehicles', '#pricing', '#booking', '#footer'] as const;
const NAV_KEYS  = ['home', 'vehicles', 'pricing', 'booking', 'contact'] as const;

export default function Header() {
  const t = useTranslations('nav');
  const [isVisible, setIsVisible]   = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
      if (mobileOpen) {
        setIsVisible(true);
      } else if (y > lastScrollY.current && y > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileOpen]);

  useEffect(() => {
    const ids = NAV_HREFS.map(h => h.replace('#', ''));
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(`#${id}`); },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const headerClass = [
    'landing-header',
    isScrolled ? 'scrolled' : 'transparent',
    !isVisible ? 'hidden' : '',
    mobileOpen ? 'mobile-menu-active' : '',
  ].filter(Boolean).join(' ');

  const navLinks = NAV_HREFS.map((href, i) => ({ href, label: t(NAV_KEYS[i]) }));

  return (
    <Fragment>
      <header className={headerClass}>
        <div className="container">
          <a href="#" className="header-logo">
            <img
              src="/image/Herosecsison/logo (2)_backup.png"
              alt="Nhà Xe Duy Hùng"
              className="header-logo-img"
            />
          </a>

          <nav className="header-nav" aria-label="Main navigation">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`header-nav-link${activeSection === link.href ? ' active' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className={`header-burger${mobileOpen ? ' active' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div
        className={`header-sidebar-overlay${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={`header-mobile-menu${mobileOpen ? ' open' : ''}`}>
        <div className="header-sidebar-top">
          <img
            src="/image/Herosecsison/logo (2).png"
            alt="Nhà Xe Duy Hùng"
            className="header-sidebar-logo-img"
          />
          <button
            className="header-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="header-sidebar-links">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="header-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>

      </div>
    </Fragment>
  );
}
