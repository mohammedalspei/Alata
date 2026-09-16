/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { partnersData } from '../data';
import { ShieldCheck, Landmark } from 'lucide-react';

export default function Partners() {
  // We duplicate the list to ensure a seamless continuous scrolling loop
  const duplicatedPartners = [...partnersData, ...partnersData, ...partnersData];

  return (
    <section id="partners" className="relative py-20 bg-white overflow-hidden border-t border-b border-slate-200 shadow-xs">
      {/* Structural layout accents */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(160,125,42,0.015)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50 z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10 text-center">
        <span className="text-gold-dark font-extrabold text-xs uppercase tracking-wider block mb-2 font-tajawal">
          ثقة متبادلة وتأهيل رسمي متكامل
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-tajawal">
          شركاء النجاح والاعتمادات الرسمية
        </h2>
        <div className="w-16 h-0.5 bg-gold-matte mx-auto mt-3 rounded-full"></div>
        <p className="text-slate-600 text-xs sm:text-sm mt-3 max-w-2xl mx-auto font-light leading-relaxed">
          يفخر مكتب العطا للاستشارات الهندسية بتأهيله واعتماده لدى كبرى الأجهزة الحكومية والمؤسسات المحلية والمنصات الوطنية لتقديم خدمات مساحية وترخيصية بلا عوائق.
        </p>
      </div>

      {/* Infinite Scrolling Ticker (RTL custom marquee) */}
      <div className="relative w-full z-10 overflow-hidden py-4 flex select-none">
        {/* Left & Right fading masking elements to make the scroller look professional */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none"></div>

        {/* Outer scrolling belt wrapper with native RTL css class we defined in index.css */}
        <div className="flex w-max space-x-reverse space-x-6 animate-scroll-rtl">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex items-center space-x-reverse space-x-3.5 bg-slate-50 border border-slate-200 hover:border-gold-matte/30 px-6 py-4 rounded-xl transition-all duration-300 group shrink-0 shadow-xs"
              style={{ width: '280px' }}
            >
              {/* Gold governmental state badge icon */}
              <div className="w-10 h-10 rounded-full bg-gold-matte/10 group-hover:bg-gold-matte/20 flex items-center justify-center border border-gold-matte/20 shrink-0 transition-colors">
                <Landmark className="w-5 h-5 text-gold-matte" />
              </div>

              <div className="text-right">
                <h4 className="text-slate-900 text-xs sm:text-sm font-bold font-tajawal group-hover:text-gold-dark transition-colors line-clamp-1">
                  {partner.name}
                </h4>
                <div className="flex items-center space-x-reverse space-x-1 mt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-sans">{partner.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust reassurance badge bottom banner within section */}
      <div className="text-center mt-10 relative z-10">
        <p className="text-[11px] text-slate-500 font-tajawal">
          * نلتزم بسلامة كافة الإرساليات وتطابق المعايير التقنية مع كود البناء السعودي (SBC) لمرور متطلباتكم دون عقبات فنية.
        </p>
      </div>
    </section>
  );
}
