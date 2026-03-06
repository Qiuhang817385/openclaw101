'use client';

import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { Dictionary } from '@/lib/i18n';

interface NavbarProps {
  locale: 'en' | 'zh';
  dict: Dictionary;
}

export default function Navbar({ locale, dict }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const prefix = locale === 'en' ? '' : `/${locale}`;

  const links = [
    { label: dict.nav.learn, href: '#what-is' },
    { label: dict.nav.skills, href: '#skills' },
    { label: dict.nav.resources, href: '#resources' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md border-b border-gray-200 py-3'
          : 'py-4 sm:py-5'
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        paddingTop: scrolled ? 'calc(env(safe-area-inset-top) + 0.75rem)' : 'calc(env(safe-area-inset-top) + 1rem)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href={prefix || '/'} className="font-bold text-base sm:text-lg whitespace-nowrap text-gray-900">
          🐾 <span className="gradient-text">My</span>Claw
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`${prefix}/resources`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
          >
            {locale === 'zh' ? '全部资源' : 'All Resources'}
          </a>
          
          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden backdrop-blur-md border-t border-gray-200 px-4 py-4 bg-white/95">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`${prefix}/resources`}
            onClick={() => setMobileOpen(false)}
            className="block py-3 font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
          >
            {locale === 'zh' ? '全部资源 →' : 'All Resources →'}
          </a>
          
          {/* Mobile Language Switcher */}
          <div className="py-3 border-t border-white/10 mt-2">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}
