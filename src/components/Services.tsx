/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { servicesData } from '../data';
import { Compass, Layers, FileCheck, Eye, Briefcase, TrendingUp, CheckCircle, ArrowLeft, X, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesProps {
  onOpenConsultationWithService: (serviceTitle: string) => void;
}

export default function Services({ onOpenConsultationWithService }: ServicesProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'FileCheck':
        return <FileCheck className={className} />;
      case 'Eye':
        return <Eye className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  const activeService = servicesData.find((s) => s.id === selectedServiceId);

  return (
    <section id="services" className="relative py-28 bg-white overflow-hidden">
      {/* Structural background details */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold-matte/5 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-navy-royal/5 rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-gold-matte font-bold text-xs uppercase tracking-wider block mb-2 px-3 py-1 bg-gold-matte/10 rounded-full inline-block">
            خدماتنا الشاملة والمتكاملة
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#001f3f] font-tajawal">
            حلول هندسية متكاملة تحت سقف واحد
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold-matte to-gold-light mx-auto mt-4 rounded-full"></div>
          <p className="text-gray-500 mt-5 leading-relaxed text-sm sm:text-base">
            يمتلك مكتب العطا للاستشارات الهندسية نطاق خدمات واسعاً وعميقاً، مرخصاً ومطوراً ليوافق متطلبات كود البناء السعودي ومنصة بلدي وأخلاقيات المهنة الهندسية الرفيعة.
          </p>
        </div>

        {/* Services Grid (6 Cards as requested) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedServiceId(service.id)}
              className="group cursor-pointer p-8 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/60 hover:border-gold-matte/40 shadow-sm hover:shadow-xl hover:shadow-gold-matte/5 transition-all duration-300 text-right flex flex-col justify-between"
            >
              <div>
                {/* Icon wrapper & highlight */}
                <div className="w-14 h-14 rounded-xl bg-[#001f3f]/5 group-hover:bg-gold-matte/10 border border-transparent group-hover:border-gold-matte/20 flex items-center justify-center transition-all duration-300 mb-6">
                  {getIcon(service.iconName, 'w-6 h-6 text-[#001f3f] group-hover:text-gold-matte transition-colors duration-300')}
                </div>

                {/* Service Title */}
                <h3 className="text-xl font-bold font-tajawal text-[#001f3f] group-hover:text-gold-dark transition-colors">
                  {service.title}
                </h3>

                {/* Service Short Spec */}
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Action Link indicator */}
              <div className="mt-8 flex items-center justify-start space-x-reverse space-x-2 text-gold-matte font-bold text-xs">
                <span>عرض تفاصيل ومكونات الخدمة</span>
                <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Pitch Banner inside Services section */}
        <div className="mt-16 bg-gradient-to-l from-slate-100 to-slate-50 text-slate-800 p-8 sm:p-12 rounded-3xl border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-md">
          <div className="text-right">
            <span className="text-gold-dark text-xs font-bold uppercase tracking-widest block mb-2">امتياز مهني ورقمي</span>
            <h3 className="text-2xl sm:text-3xl font-bold font-tajawal leading-snug text-slate-900">
              هل تبحث عن استشارات مطابقة لكود البناء ومكتملة الرخص سلفاً؟
            </h3>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              جميع مخططاتنا وتصاميمنا يتم تصميمها وتدقيقها بالبرامج الهندسية المتطورة ومطابقتها التامة لمنصة بلدي وأمانة منطقة القصيم لتسريع إصدار التراخيص وتقليص النفقات قيد التشييد.
            </p>
          </div>
          <button
            onClick={() => onOpenConsultationWithService('طلب استشارة عامة')}
            className="w-full lg:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-gold-matte to-gold-light hover:from-gold-light hover:to-gold-matte text-white transition-all duration-300 shadow-md whitespace-nowrap active:scale-95"
          >
            طلب تفاصيل مخصصة الآن
          </button>
        </div>
      </div>

      {/* Expanded Service details Slideover Modal via AnimatePresence */}
      <AnimatePresence>
        {selectedServiceId && activeService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedServiceId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Body container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-2xl border border-gold-matte/30 shadow-2xl relative w-full max-w-3xl overflow-hidden z-10"
            >
              {/* Gold Top highlight line */}
              <div className="h-2 bg-gradient-to-l from-gold-matte via-gold-light to-gold-matte"></div>

              {/* Close Button right aligned (RTL) */}
              <button
                onClick={() => setSelectedServiceId(null)}
                className="absolute top-6 right-6 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="إغلاق التبويب"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 sm:p-10 text-right">
                {/* Header layout */}
                <div className="flex items-center space-x-reverse space-x-4 mb-6 pt-4">
                  <div className="w-16 h-16 rounded-xl bg-gold-matte/10 flex items-center justify-center border border-gold-matte/20">
                    {getIcon(activeService.iconName, 'w-8 h-8 text-gold-matte')}
                  </div>
                  <div>
                    <span className="text-xs text-gold-matte font-bold font-tajawal">الخدمة الاستشارية المتخصصة</span>
                    <h3 className="text-2xl font-black text-[#001f3f] font-tajawal">
                      {activeService.title}
                    </h3>
                  </div>
                </div>

                {/* Detailed descriptions */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[#001f3f] font-bold text-md mb-2">أبعاد ونطاق الخدمة:</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {activeService.fullDescription}
                    </p>
                  </div>

                  {/* Bullet features */}
                  <div>
                    <h4 className="text-[#001f3f] font-bold text-md mb-3">تشتمل هذه الخدمة بشكل رئيسي على:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeService.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-reverse space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100/80"
                        >
                          <CheckCircle className="w-5 h-5 text-gold-matte shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-gray-700 font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer buttons on modal */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onOpenConsultationWithService(activeService.title);
                      setSelectedServiceId(null);
                    }}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-gold-matte to-gold-light hover:from-gold-light hover:to-gold-matte shadow-md active:scale-95 transition-all outline-none"
                  >
                    اطلب هذه الخدمة مسودة الآن
                  </button>
                  <button
                    onClick={() => setSelectedServiceId(null)}
                    className="px-6 py-3.5 rounded-xl font-medium text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    العودة لجميع الخدمات
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
