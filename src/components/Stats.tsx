/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { statsData } from '../data';
import { Award, Building, Sparkles, Map } from 'lucide-react';
import { motion } from 'motion/react';

export default function Stats() {
  const getIcon = (id: string) => {
    switch (id) {
      case 'exp':
        return <Award className="w-8 h-8 text-gold-matte" />;
      case 'projects':
        return <Sparkles className="w-8 h-8 text-gold-matte" />;
      case 'gov':
        return <Building className="w-8 h-8 text-gold-matte" />;
      case 'meters':
        return <Map className="w-8 h-8 text-gold-matte" />;
      default:
        return <Award className="w-8 h-8 text-gold-matte" />;
    }
  };

  return (
    <section id="stats" className="relative py-24 bg-slate-50 text-slate-900 border-y border-slate-200 overflow-hidden">
      {/* Decorative architectural background element */}
      <div className="absolute right-0 bottom-0 top-0 left-0 bg-[linear-gradient(rgba(160,125,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(160,125,42,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>
      
      {/* Subtle glowing orbs */}
      <div className="absolute -top-40 right-20 w-96 h-96 bg-gold-matte/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 left-10 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold-matte font-bold text-xs uppercase tracking-wider block mb-2 px-3 py-1 bg-gold-matte/10 rounded-full inline-block">
            من نحن وتطلعاتنا الهندسية
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-tajawal">
            الأرقام تعكس ريادتنا وجودة أعمالنا
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold-matte to-gold-light mx-auto mt-4 rounded-full"></div>
          <p className="text-slate-600 mt-5 leading-relaxed text-sm sm:text-base">
            خلال ما يزيد عن عقد من الزمان، كرس مكتب العطا للاستشارات الهندسية جهوده لتنفيذ وتطوير وإصدار الرخص والأعمال المساحية بدقة متناهية تحت سقف من الثقة والمطابقة الكاملة لكود البناء السعودي.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative p-8 bg-white rounded-2xl border border-slate-200 hover:border-gold-matte/40 group transition-all duration-300 transform hover:-translate-y-1.5 shadow-xs hover:shadow-lg hover:shadow-gold-matte/5"
            >
              {/* Gold light corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-2xl rounded-bl-2xl border-t-2 border-r-2 border-transparent group-hover:border-gold-matte transition-all duration-300"></div>

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-gold-matte/10 group-hover:border-gold-matte/30 transition-all duration-300 mb-6">
                {getIcon(stat.id)}
              </div>

              {/* Big Graduated Number */}
              <span className="text-4xl sm:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-gold-matte to-gold-dark block tracking-tight">
                {stat.value}
              </span>

              {/* Title / Label */}
              <h3 className="text-lg sm:text-xl font-bold font-tajawal text-slate-900 mt-4 group-hover:text-gold-dark transition-colors">
                {stat.label}
              </h3>

              {/* Short explanation */}
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Vision Statement Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-white border border-slate-200 p-8 rounded-2xl max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
        >
          <div className="text-right flex-1">
            <h4 className="text-gold-dark text-[15px] font-extrabold font-tajawal">رسالتنا ورؤيتنا المستقبلية</h4>
            <p className="text-slate-650 text-sm mt-2 leading-relaxed">
              &quot;نتطلع في العطا للاستشارات الهندسية أن نكون الذراع التقني والجمالي الأول في تقديم الحلول الإنشائية والمساحية بالمملكة العربية السعودية، متبنين استراتيجيات رقمية تواكب برنامج التحول البلدي والنهضة العقارية في منطقة القصيم وكافة أرجاء الوطن.&quot;
            </p>
          </div>
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="text-left font-sans text-xs text-slate-500">
              <span className="block font-bold text-slate-900 font-tajawal text-sm">المهندس/ عطاالله عبدالله الدخيل</span>
              <span className="block text-[11px] mt-0.5 font-tajawal text-slate-400">رئيس مجلس الإدارة المفوّض</span>
            </div>
            <div className="w-14 h-14 rounded-full bg-gold-matte/10 flex items-center justify-center border border-gold-matte/20">
              <span className="text-lg font-bold text-gold-matte bg-transparent">عطا</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
