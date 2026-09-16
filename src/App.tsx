/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import Projects from './components/Projects';
import Partners from './components/Partners';
import Footer from './components/Footer';
import ConsultationModal from './components/ConsultationModal';
import AdminLoginModal from './components/AdminLoginModal';
import { HelpCircle, Star, Phone, CheckCircle, FileText, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const cleanLogoText = (logoBase64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(logoBase64);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Erase old text block at the bottom
        const eraseY = Math.round(canvas.height * 0.53);
        const eraseHeight = Math.round(canvas.height * 0.47);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, eraseY, canvas.width, eraseHeight);

        // Draw new clean text
        ctx.fillStyle = '#0f243d'; // Elegant navy
        ctx.textAlign = 'center';

        const arabicFontSize = Math.round(canvas.height * 0.082);
        ctx.font = `800 ${arabicFontSize}px "Tajawal", "Segoe UI", sans-serif`;
        const arabicY = Math.round(canvas.height * 0.70);
        ctx.fillText("العطا للاستشارات الهندسية", canvas.width / 2, arabicY);

        const englishFontSize = Math.round(canvas.height * 0.058);
        ctx.font = `650 ${englishFontSize}px "Georgia", "Times New Roman", serif`;
        const englishY = Math.round(canvas.height * 0.86);
        ctx.fillText("ATA Consult Engineering", canvas.width / 2, englishY);

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(err);
    img.src = logoBase64;
  });
};

export default function App() {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [prefilledService, setPrefilledService] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor Scroll and track current active section (ScrollSpy)
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      const sections = ['hero', 'stats', 'services', 'projects', 'experiences', 'partners', 'contact'];
      const scrollPosition = window.scrollY + 200; // Offset for header trigger

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic favicon synchronization effect for google search results and mobile devices
  useEffect(() => {
    const updateFavicon = (logoBase64: string | null) => {
      const favicons = document.querySelectorAll<HTMLLinkElement>(
        "link[rel='icon'], link[rel='apple-touch-icon'], link[rel='shortcut icon']"
      );
      const targetSrc = logoBase64 || "/favicon.png";
      favicons.forEach(el => {
        el.href = targetSrc;
      });
    };

    const loadAndSyncLogo = async () => {
      // 1. Try local storage cache
      const localLogo = localStorage.getItem('alata_company_logo');
      if (localLogo) {
        updateFavicon(localLogo);
      }

      // 2. Query master server config
      try {
        const res = await fetch('/api/custom-images');
        if (res.ok) {
          const data = await res.json();
          if (data && data.company_logo) {
            
            // Check if we need to clean old text from logo
            const isCleaned = localStorage.getItem('alata_logo_cleaned_v2');
            if (!isCleaned) {
              try {
                const cleanedLogo = await cleanLogoText(data.company_logo);
                if (cleanedLogo) {
                  // POST back fully cleaned master logo
                  const updatedData = { ...data, company_logo: cleanedLogo };
                  await fetch('/api/custom-images', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ images: updatedData })
                  });

                  try {
                    localStorage.setItem('alata_company_logo', cleanedLogo);
                  } catch (e) {
                    // ignore
                  }
                  localStorage.setItem('alata_logo_cleaned_v2', 'true');
                  updateFavicon(cleanedLogo);
                  window.dispatchEvent(new Event('alata-logo-changed'));
                  return;
                }
              } catch (migrateErr) {
                console.error("Failed to clean company logo text:", migrateErr);
              }
            }

            try {
              localStorage.setItem('alata_company_logo', data.company_logo);
            } catch (e) {
              console.warn("Storage quota exceeded, skipped local storage cache update for logo");
            }
            updateFavicon(data.company_logo);
            return;
          }
        }
      } catch (err) {
        console.error("Favicon sync error:", err);
      }

      if (!localLogo) {
        updateFavicon(null); // Back to base gold asset
      }
    };

    loadAndSyncLogo();

    // Listen for real-time changes inside Admin Panel
    window.addEventListener('alata-logo-changed', loadAndSyncLogo);
    return () => {
      window.removeEventListener('alata-logo-changed', loadAndSyncLogo);
    };
  }, []);

  const openConsultation = (serviceTitle = '') => {
    setPrefilledService(serviceTitle);
    setIsConsultationOpen(true);
  };

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.scrollMarginTop = '90px';
      
      try {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } catch (e) {
        // Ignore
      }

      const offset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const offsetPosition = elementPosition + scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative min-h-screen font-sans antialiased overflow-x-hidden text-slate-900 bg-slate-50 selection:bg-gold-matte/30 selection:text-[#001f3f] select-none">
      {/* Decorative top safety bar with urgent contact values */}
      <div className="bg-slate-100 border-b border-slate-200 text-xs text-slate-705 py-2 sm:py-2.5 px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          
          {/* Right values */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
            <div className="flex items-center space-x-reverse space-x-1.5 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span className="text-gold-matte font-bold">بوابة بلدي:</span>
              <span className="text-slate-650">مكتب مرخص ومستقل ومؤهل مساحياً بكافة الأمانات</span>
            </div>
            <span className="hidden md:inline text-slate-350">|</span>
            <div className="flex items-center space-x-reverse space-x-1 text-slate-650">
              <span>أوقات مراجعة المعاملات:</span>
              <span className="font-sans font-medium text-slate-800">8:00 ص - 6:00 م</span>
            </div>
          </div>

          {/* Left social fast links */}
          <div className="flex items-center space-x-reverse space-x-4 text-[11px]">
            <a
              href="mailto:ataa.consult2025@gmail.com"
              className="hover:text-gold-dark transition-colors text-slate-600"
            >
              ataa.consult2025@gmail.com
            </a>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-reverse space-x-1 text-slate-650">
              <span className="text-gold-matte font-bold">الرئيس التنفيذي:</span>
              <span className="text-slate-700">المهندس/ عطاالله عبدالله الدخيل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main sticky navigation header */}
      <Header
        onOpenConsultation={() => openConsultation('طلب استشارة عامة')}
        activeSection={activeSection}
      />

      {/* Hero Entrance View */}
      <Hero
        onOpenConsultation={() => openConsultation('طلب استشارة معمارية ومساحية')}
        onExploreProjects={() => handleScrollToSection('projects')}
      />

      {/* Interactive Achievements & Stats Tracker */}
      <Stats />

      {/* Deep Dive Services (6 Interactive cards & popups) */}
      <Services onOpenConsultationWithService={openConsultation} />

      {/* Filterable Project Showcase Showcase */}
      <Projects onOpenConsultationWithProject={(pTitle) => openConsultation(`مراجعة مشروع مشابه لـ: ${pTitle}`)} />

      {/* Scrolling Partners Ministry Logobar */}
      <Partners />

      {/* Comprehensive Royal Footer with Locations */}
      <Footer />

      {/* Interactive consultation request forms modal overlays */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        prefilledServiceType={prefilledService}
      />

      {/* Admin login modal */}
      <AdminLoginModal />

      {/* Floater CTA Sidebar Actions */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        {/* Scroll Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3.5 rounded-full bg-gradient-to-t from-slate-200 to-slate-100 hover:from-gold-matte hover:to-gold-light text-slate-800 hover:text-white shadow-lg hover:shadow-gold-matte/20 border border-slate-300 hover:border-gold-matte cursor-pointer select-none outline-none transition-all duration-300"
              aria-label="الرجوع للأعلى"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Immediate WhatsApp Floater Icon */}
        <a
          href="https://wa.me/966583893870"
          target="_blank"
          rel="noreferrer"
          className="p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-2xl hover:shadow-emerald-500/30 border border-emerald-600/30 font-bold flex items-center justify-center cursor-pointer transition-all duration-300 select-none scale-102 hover:scale-110 active:scale-95"
          style={{ animationDuration: '3s' }}
          title="افتح نقاش مباشر واتساب"
        >
          {/* Stylized custom WhatsApp bubble icon */}
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.501-5.734-1.453L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.7 1.455 5.4 0 9.8-4.4 9.8-9.8.0-2.6-1-5.1-2.9-6.9C16.4 2.1 14 1.1 11.5 1.1c-5.4.0-9.8 4.4-9.8 9.8.0 2 .5 3.9 1.5 5.6l-.9 3.2 3.3-.9zM17.4 14.1c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.1.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3.0-.5.1-.6s.3-.3.4-.5c.2-.1.3-.3.4-.5.1-.2.0-.4-.1-.5-.1-.2-.7-1.7-.9-2.3-.3-.5-.6-.4-.8-.4s-.5.0-.8.0c-.3.0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.3.0 1.9 1.4 3.7 1.6 4 1.9 2.5 4 4.1 6.3 4.9.7.3 1.3.4 1.8.4.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
