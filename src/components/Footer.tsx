/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapPin, Mail, Phone, Printer, Clock, ShieldAlert, BadgeCheck, Landmark, Compass } from 'lucide-react';

export default function Footer() {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer id="contact" className="relative bg-white text-slate-800 pt-24 pb-12 border-t-2 border-gold-matte">
      {/* Structural layout outlines */}
      <div className="absolute inset-0 bg-[radial-gradient(#a07d2a_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.04] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Column 1: About company */}
        <div className="space-y-6 text-right">
          <div className="flex items-center space-x-reverse space-x-3.5">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-gold-matte shadow-md">
              <svg
                className="w-7 h-7 text-gold-matte"
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
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 font-tajawal tracking-wide">
                <span className="text-gold-matte">العطا</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">للاستشارات الهندسية</span>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed font-light font-tajawal">
            مكتب استشاري هندسي معتمد مساحياً وبلدياً، نسخر طاقاتنا ونطبق أحدث نظم الكود السعودي وأفضل المعدات التكنولوجية لنصنع مساحات هندسية ريادية تحقق تطلعات التنمية الوطنية وتخدم الاستثمار.
          </p>

          <div className="flex items-center space-x-reverse space-x-3 pt-2">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
              <BadgeCheck className="w-5 h-5 text-gold-matte" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 font-tajawal">هيئة المهندسين السعوديين</p>
              <p className="text-[10px] text-slate-500">عضوية استشارية ذهبية رقم ٤٧٢١</p>
            </div>
          </div>
        </div>

        {/* Column 2: Fast Nav Links */}
        <div className="space-y-6 text-right">
          <h4 className="text-lg font-bold font-tajawal text-gold-dark border-r-4 border-gold-matte pr-3.5">روابط سريعة</h4>
          <ul className="space-y-3.5 text-sm text-slate-600">
            {[
              { id: 'hero', name: 'الرئيسية والترحيب' },
              { id: 'stats', name: 'عن العطا للاستشارات الهندسية' },
              { id: 'services', name: 'خدمات الرفع والتراخيص' },
              { id: 'projects', name: 'قائمة سابقة المشاريع' },
              { id: 'partners', name: 'بلدي والاعتمادات الرسمية' },
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleScrollTo(link.id)}
                  className="hover:text-gold-dark transition-colors text-right outline-none cursor-pointer flex items-center space-x-reverse space-x-2 font-light"
                >
                  <span className="text-gold-matte">✦</span>
                  <span>{link.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Local Authority Approvals */}
        <div className="space-y-6 text-right">
          <h4 className="text-lg font-bold font-tajawal text-gold-dark border-r-4 border-gold-matte pr-3.5">الاعتماد والترخيص الجغرافي</h4>
          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start space-x-reverse space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Landmark className="w-5 h-5 text-gold-matte mt-1 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">أمانة منطقة القصيم</p>
                <p className="text-xs text-slate-500 mt-1">المقر الرئيسي والمكتب الاستشاري معتمد بالبوابة الحضرية لبلدي، مؤهل لإفراز ومسح وتخطيط كافة كروكيات المنطقة وقراها ببريدة والقصيم بكفاءة هندسية.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Detailed Contact credentials */}
        <div className="space-y-6 text-right">
          <h4 className="text-lg font-bold font-tajawal text-gold-dark border-r-4 border-gold-matte pr-3.5">قنوات التواصل والمكتب</h4>
          <ul className="space-y-4 text-xs sm:text-sm text-slate-600">
            
            {/* Phone */}
            <li className="flex items-start space-x-reverse space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 text-gold-dark shrink-0 mt-1">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 font-tajawal text-right">مكالمات الاتصال المباشر</span>
                <div className="flex flex-col text-left font-sans font-bold text-slate-800 text-[13px] leading-tight mt-0.5">
                  <a href="tel:+966565093050" className="hover:underline hover:text-gold-dark" dir="ltr">+966 56 509 3050</a>
                  <a href="tel:+966536374907" className="hover:underline hover:text-gold-dark" dir="ltr">+966 53 637 4907</a>
                </div>
              </div>
            </li>

            {/* WhatsApp */}
            <li className="flex items-center space-x-reverse space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-center border border-emerald-250 text-emerald-600">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.074 2.875 1.222 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 font-tajawal text-right">محادثات الواتساب الفورية</span>
                <a href="https://wa.me/966583893870" target="_blank" rel="noreferrer" className="font-mono font-bold hover:underline text-slate-800" dir="ltr">+966 58 389 3870</a>
              </div>
            </li>

            {/* Email */}
            <li className="flex items-center space-x-reverse space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 text-gold-dark">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 font-tajawal text-right">مراسلات المشاريع والاستشارات</span>
                <a href="mailto:ataa.consult2025@gmail.com" className="font-mono font-bold text-slate-850 hover:text-gold-dark">ataa.consult2025@gmail.com</a>
              </div>
            </li>

            {/* Address */}
            <li className="flex items-start space-x-reverse space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 text-gold-dark mt-1 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">المقر الرئيسي:</p>
                <p className="text-xs text-slate-500 mt-0.5 font-tajawal">المملكة العربية السعودية، القصيم - بريدة.</p>
                <a 
                  href="https://share.google/pyyU3H7yfQYr6GGg2" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center space-x-reverse space-x-1.5 text-xs text-gold-dark hover:underline font-bold mt-1 font-tajawal bg-gold-matte/5 border border-gold-matte/20 rounded-lg px-2.5 py-1 transition-all"
                >
                  <span>📍 اضغط هنا للوصول إلى موقعنا عبر خرائط Google</span>
                </a>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Saudi Vision 2030 Ribbon Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 border-t border-slate-200 pt-10 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Saudi Vision 2030 design emblem representation */}
        <div className="flex items-center space-x-reverse space-x-4 bg-slate-50 border border-gold-matte/20 p-4 rounded-2xl shadow-md">
          {/* Stylized Saudi emblem with palms and sword geometries */}
          <div className="w-14 h-14 bg-gradient-to-tr from-[#004b23] to-[#001c3d] rounded-xl flex flex-col items-center justify-center border border-gold-matte/30 relative">
            <svg
              className="w-8 h-8 text-gold-matte animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v20M17 5H7M15 9H9M19 13H5" />
            </svg>
            <span className="text-[7px] text-emerald-400 font-bold uppercase mt-1">Vision 2030</span>
          </div>
          <div className="text-right">
            <h5 className="text-sm font-black text-slate-900 font-tajawal">رؤية المملكة العربية السعودية 2030</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-tajawal">تنمية عمرانية مستدامة ومجتمعات سكنية نابضة بالحياة. فخورون بكوننا نواة هندسية داعمة لبرامج الإسكان والمدن الذكية.</p>
          </div>
        </div>

        {/* Dynamic certificates badge row */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center space-x-reverse space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Compass className="w-3.5 h-3.5 text-gold-matte" />
            <span>كود البناء السعودي معتمد</span>
          </div>
          <div className="flex items-center space-x-reverse space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Landmark className="w-3.5 h-3.5 text-gold-matte" />
            <span>بلدي مرخص بالكامل</span>
          </div>
          <div className="flex items-center space-x-reverse space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-gold-matte animate-bounce" />
            <span>سلامة المنشآت والدفاع المدني</span>
          </div>
        </div>

      </div>

      {/* Copyright block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 text-center border-t border-slate-200">
        <p className="text-xs text-slate-500 font-light font-tajawal">
          © {new Date().getFullYear()} العطا للاستشارات الهندسية. جميع الحقوق محفوظة لوزارة الشؤون البلدية والقروية. المقر الرئيسي: القصيم - بريدة.
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-tajawal">
          تصفح بامتثال فني مطلق - تصميم المستقبل.
          <span 
            onClick={() => { window.dispatchEvent(new CustomEvent('open-alata-admin-login')); }} 
            className="opacity-20 hover:opacity-100 cursor-pointer text-slate-400 select-none transition-opacity mr-2"
            title="بوابة الإدارة المعتمدة"
          >
            🔑
          </span>
        </p>
      </div>
    </footer>
  );
}
