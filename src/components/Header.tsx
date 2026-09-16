/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Menu, X, Phone, ShieldCheck, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenConsultation: () => void;
  activeSection: string;
}

export default function Header({ onOpenConsultation, activeSection }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('alata_company_logo') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const loadLogo = () => {
      try {
        const savedLogo = localStorage.getItem('alata_company_logo');
        if (savedLogo) {
          setCompanyLogo(savedLogo);
        }
      } catch (e) {
        // ignore
      }
    };
    
    loadLogo();

    // Fetch from central API
    fetch('/api/custom-images')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.company_logo) {
          setCompanyLogo(data.company_logo);
          try {
            localStorage.setItem('alata_company_logo', data.company_logo);
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {});

    const handleLogoUpdate = () => {
      loadLogo();
    };

    window.addEventListener('alata-logo-changed', handleLogoUpdate);
    return () => window.removeEventListener('alata-logo-changed', handleLogoUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', name: 'الرئيسية' },
    { id: 'stats', name: 'عن العطا' },
    { id: 'services', name: 'خدماتنا الاستشارية' },
    { id: 'projects', name: 'معرض المشاريع' },
    { id: 'experiences', name: 'الخبرات والاعتمادات' },
    { id: 'partners', name: 'شركاء النجاح' },
    { id: 'contact', name: 'اتصل بنا' },
  ];

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    // Slight timeout ensures any mobile drawer layout transition is resolved
    // and doesn't interfere with the scroll destination calculations
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        // Apply smooth scroll margin
        element.style.scrollMarginTop = '90px';
        
        // 1. Try modern native scrollIntoView
        try {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } catch (e) {
          // Ignore
        }

        // 2. Dual fallback scroll for older browsers/webview frames
        const offset = 90;
        const elementPosition = element.getBoundingClientRect().top;
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const offsetPosition = elementPosition + scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 120);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-md'
            : 'bg-gradient-to-b from-white/80 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Right: Company Logo & Brand Name */}
            <div
              className="flex items-center space-x-reverse space-x-3 cursor-pointer group"
              onClick={() => handleScrollTo('hero')}
            >
              {/* Premium Abstract Architectural Logo */}
              <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-white to-slate-100 rounded-xl border border-gold-matte/30 shadow-xs group-hover:border-gold-matte transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0.5 rounded-lg border border-gold-matte/10"></div>
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="شعار العطا للاستشارات الهندسية"
                    className="w-full h-full object-contain p-1 relative z-10 transition-transform duration-300 transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  /* Stylized Architectural A frame with Gold accents */
                  <svg
                    className="w-7 h-7 text-gold-matte group-hover:text-gold-light transition-colors duration-300 transform group-hover:scale-105"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 21h16" />
                    <path d="M6 21V9l6-5 6 5v12" />
                    <path d="M12 4v17" />
                    <path d="M9 14h6" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xl md:text-2xl font-black text-slate-900 tracking-wide font-tajawal">
                  <span className="text-gold-matte group-hover:text-gold-light transition-colors">العطا</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                  للاستشارات الهندسية
                </span>
              </div>
            </div>

            {/* Middle: Desktop Navigation links */}
            <nav className="hidden lg:flex items-center space-x-reverse space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScrollTo(item.id)}
                  className={`px-4 py-2 rounded-lg font-tajawal text-[15px] font-medium transition-all duration-300 whitespace-nowrap ${
                    activeSection === item.id || (activeSection === '' && item.id === 'hero')
                      ? 'text-gold-matte bg-gold-matte/5 border border-gold-matte/10'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Left: Gold CTA Buttons and Toggle */}
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-4 shrink-0">
              {/* Fast Contact info icon/number on desktop */}
              <div
                className="hidden xl:flex items-center space-x-reverse space-x-2 text-slate-705 group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-gold-matte/10 transition-all duration-300">
                  <Phone className="w-4 h-4 text-gold-matte" />
                </div>
                <div className="flex flex-col text-left text-xs gap-0.5">
                  <span className="text-[9px] text-slate-500">للاتصال والمكالمات المباشرة</span>
                  <div className="flex flex-col font-sans font-bold text-[11px] leading-tight text-slate-800">
                    <a href="tel:+966565093050" className="hover:text-gold-dark hover:underline" dir="ltr">+966 56 509 3050</a>
                    <a href="tel:+966536374907" className="hover:text-gold-dark hover:underline" dir="ltr">+966 53 637 4907</a>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenConsultation}
                className="inline-flex relative overflow-hidden group px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-lg font-tajawal text-xs sm:text-sm font-bold sm:font-semibold text-white transition-all duration-300 shadow-md shadow-gold-matte/10 active:scale-95 border border-gold-matte whitespace-nowrap shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #a07d2a 0%, #c4a14d 100%)',
                }}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                طلب استشارة مجانية
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-gold-matte/50 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer with full styling - attached directly under header */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 top-full z-40 lg:hidden px-4 pt-4 pb-6 bg-white border-b border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleScrollTo(item.id)}
                    className={`w-full text-right px-4 py-3 rounded-lg font-tajawal text-base font-medium transition-colors ${
                      activeSection === item.id
                        ? 'text-gold-matte bg-gold-matte/10 border-r-4 border-gold-matte'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenConsultation();
                    }}
                    className="w-full text-center py-3.5 rounded-lg font-tajawal text-sm font-bold text-white shadow-lg shadow-gold-matte/15"
                    style={{
                      background: 'linear-gradient(135deg, #a07d2a 0%, #c4a14d 100%)',
                    }}
                  >
                    طلب استشارة هندسية وافية
                  </button>

                  <div className="flex justify-around items-center pt-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-reverse space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-gold-matte" />
                      <span>امتثال ١٠0٪ بلدي</span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-1.5">
                      <Award className="w-4 h-4 text-gold-matte" />
                      <span>مكتب هندسي معتمد</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
