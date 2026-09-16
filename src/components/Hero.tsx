/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle, 
  HelpCircle, 
  X, 
  BookOpen, 
  Users, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  Check, 
  ScrollText,
  UserCheck
} from 'lucide-react';

interface HeroProps {
  onOpenConsultation: () => void;
  onExploreProjects: () => void;
}

const SECTIONS_CONTENT = [
  {
    tag: 'القيادة والريادة',
    name: 'المدير العام',
    detail: 'كلمة رئيس مجلس الإدارة',
    subtitle: 'المهندس/ عطاالله عبدالله الدخيل',
    iconName: 'Award',
    bgGradient: 'from-amber-600/20 to-gold-matte/10',
    content: {
      name: 'م. عطا الله بن عبدالله الدخيل',
      title: 'المدير العام ورئيس مجلس الإدارة الفني والتنفيذي',
      qualifications: [
        'ماجستير إدارة الأعمال التنفيذية.',
        'بكالوريوس الهندسة التقنية الإلكترونية.'
      ],
      memberships: [
        'الهيئة السعودية للمهندسين.',
        'الجمعية السعودية للجودة.',
        'معهد إدارة المشاريع  (PMI).'
      ],
      experience: [
        'الكفاءة الفائقة في مجال استشارات الإدارة والتميز المؤسسي وحوكمة القطاعات الهندسية والتنموية.',
        'المعرفة التامة بإدارة المشاريع الإنشائية الكبرى والذكاء العمراني والبنى التحتية لتقنية المعلومات.',
        'خبرة عملية عريضة ومتميزة في شتى القطاعات العامة والخاصة، تم من خلالها قيادة فرق العمل وتأسيس النظم الهندسية المتوافقة مع الكود البلدي والمحلي.',
        'دعم وتدعيم المهارات الإدارية بالعديد من الشهادات المهنية العالمية المرموقة ومنها: مدير مشاريع محترف (PMP) و(Prince2 Practitioner)، الحصول على شهادة أخصائي هندسة قيمية معتمد (AVS)، وبناء الجودة التقنية بشهادة (ITIL).',
        'الاعتماد كمقيم داخلي معتمد من الأمانة العامة لجائزة الملك عبد العزيز للجودة (KAQA)، ومقيم داخلي معتمد بالتميز المؤسسي طبقاً للنموذج الأوروبي العالمي الشهير (EFQM).',
        'المشاركة النشطة والمستمرة كمقيّم تميز مؤسسي معتمد في العديد من الجوائز الإقليمية والمحلية الرائدة، ومنها: الدورة الرابعة لجائزة الملك عبد العزيز، والمحلف والقياس في جائزة الشيخ خليفة بن زايد للامتياز بدورتيها السابعة عشرة والثامنة عشرة، وكذلك جائزة دبي للجودة لعام 2019.',
        'مقيم حوكمة معتمد ومشارك للجهات غير الربحية والجمعيات الأهلية التابعة لوزارة الموارد البشرية والتنمية الاجتماعية، ووزارة الشؤون البلدية والقروية والإسكان (وكالة الإسكان التنموي).'
      ]
    }
  },
  {
    tag: 'نبذة عن المكتب',
    name: 'تعريف المكتب',
    detail: 'رسالتنا، رؤيتنا وقيمنا الاستراتيجية',
    subtitle: 'تأسس عام وممتد بأرقى الكفاءات والحلول الهندسية',
    iconName: 'BookOpen',
    bgGradient: 'from-blue-600/20 to-gold-matte/10',
    content: {
      name: 'تعريف بمكتب العطا للاستشارات الهندسية',
      title: 'تأسس عام 1435 هـ (2014 م) كمكتب سعودي 100% لتطوير المستقبل',
      qualifications: [
        'الريادة والتميز: يتبوأ المكتب دوراً ريادياً في تقديم أفضل الخدمات التخصصية بصرف النظر عن حجم المشروع أو مستوى الربحية.',
        'رؤية المملكة 2030: الإسهام الفعّال والمباشر في النهضة التنموية الشاملة والاستثنائية للمملكة عن طريق استقطاب الخبرات المحلية والدولية.',
        'الخدمات التخصصية: التخصص في مجالات وميادين هندسية متعددة بالتطابق التام مع أصول المهنة والممارسات الهندسية العالمية الحديثة.'
      ],
      memberships: [
        'نقل وتوطين التقنيات والخبرات الفنية والهندسية المتقدمة لتمكين الكفاءات الوطنية.',
        'الالتزام الصارم والدائم بمبدأ التحسين المستمر لأداء وتقديم الخدمات المهنية التخصصية.',
        'إتاحة فرصة حقيقية للمتميزين وذوي المهارات العالية لتطبيق معرفتهم وخبراتهم لخدمة المجتمع.'
      ],
      experience: [
        'تأسس مكتب العطا في العام 1435 هـ (2014 م) كمكتب سعودي 100% بواسطة المهندس/ عطاالله عبدالله الدخيل مؤسس ومدير عام المكتب وذلك بهدف المساهمة في النهضة التنموية الشاملة والاستثنائية التي تشهدها المملكة بصفة عامة لتحقيق (رؤية 2030) وذلك عن طريق استقطاب الخبرات المحلية والعربية والاجنبية وكان لهذه السياسة أبلغ الأثر في نقل التقنيات والخبرات الفنية إلى المكتب ليقوم بمواصلة دوره في دفع عجلة التنمية وتطويرها بالمملكة.',
        'وهو ملتزم بمبدأ التحسين المستمر لأداء خدماته المهنية التخصصية ويسعى لإتاحة الفرصة لذوي المهارات والكفاءات العالية لتطبيق معرفتهم وخبراتهم نحو التنمية وخدمة المجتمع بأعلى مستويات التكامل والالتزام المهني.',
        'كما يسعى إلى التحسين المستمر ليحظى بترتيب جيد ضمن مصاف الشركات الاستشارية الكبرى وإلى تبوؤ دور ريادي في استخدام الحلول التكنولوجية المهنية وتقديم أفضل الخدمات التخصصية بصرف النظر عن حجم المشروع أو مستوى الربحية من المشروع.',
        'ويعتبر مكتب العطا متخصص في مجالات وميادين هندسية متعددة، حيث يقدم لعملائه أفضل الخدمات الهندسية بالتطابق مع أصول المهنة والممارسات الهندسية العالمية الحديثة.'
      ]
    }
  },
  {
    tag: 'الكوادر البشرية',
    name: 'فريق العمل بالمكتب',
    detail: 'نخبة من المهندسين الاستشاريين والخبراء',
    subtitle: 'بيئة احترافية مؤهلة تأهيلاً تخصصياً عالياً لخدمتكم',
    iconName: 'Users',
    bgGradient: 'from-emerald-600/20 to-gold-matte/10',
    content: {
      name: 'فريق العمل بمكتب العطا للاستشارات الهندسية',
      title: 'نخبة متميزة من الكفاءات والمهندسين الاستشاريين والمصممين',
      qualifications: [
        'بيئة عمل احترافية بلمسة ودية تضمن تقديم منتجات ذات جودة عالية وفي الوقت المناسب.',
        'تلبية تطلعات واحتياجات عملائنا الكرام وفق أعلى معايير الإتقان والالتزام المهني المتكامل.',
        'فريق واعد يضم العديد من المهنيين والمفتشين حاصلين على أرقى الشهادات الجامعية والخبرات المعملية.'
      ],
      memberships: [
        'الخبرة في تنفيذ مشاريع الدعم والتطوير التقني والإشراف على المشاريع البلدية والخدمية.',
        'تصاميم هندسية وتخطيط عمراني مميز بالاعتماد على أفضل البرامج والحلول الرقمية.',
        'التمكن من مشاريع نظم المعلومات الجغرافية والمساحة المستوية والجيوديسية والإدارة.'
      ],
      experience: [
        'يوفر مكتب العطا بيئة عمل احترافية في جو ودي ، كما انه يوجد لدينا المهنيين المؤهلين تأهيلاً جيدا وذوي الخبرة الفنية العالية لتقديم منتجات ذات جودة عالية وفي الوقت المناسب ، والتي تلبي أعلى معايير ومتطلبات لعملائنا.',
        'تكمن خبرتنا في تنفيذ مشاريع الدعم والتطوير التقني والاشراف على المشاريع البلدية والجهات الخدمية والخاصة المختلفة ، ومشاريع نظم المعلومات الجغرافية ، ومشاريع التصاميم الهندسية ، ومشاريع التخطيط العمراني ، ومشاريع المساحة المستوية والجيوديسية . والمشاريع الادارية والمالية',
        'يضم فريقنا العديد من المهنيين والمصممين حيث ان معظمهم حاصلين على شهادات جامعية ولديهم خبرة عملية عالية .كما انهم حريصون على العمل الجماعي والمبادرة الشخصية بشكل كبير. حيث يوفر مكتبنا فرصًا منتظمة لمزيد من التدريب والتطوير من أجل الحفاظ على المهارات على قدم المساواة مع التطورات التكنولوجية. حيث نقوم باستمرار بتحديث مهاراتنا لتقديم خدمات ذات قيمة عالية وفعالة من حيث الجودة والتكلفة .'
      ]
    }
  },
  {
    tag: 'التسلسل الإداري',
    name: 'الهيكل التنظيمي',
    detail: 'تكامل المسؤوليات والمهام الإدارية والفنية',
    subtitle: 'حوكمة مؤسسية تضمن الرقابة المزدوجة ومراقبة إنتاج الجودة الفورية',
    iconName: 'Layers',
    bgGradient: 'from-purple-600/20 to-gold-matte/10',
    content: {
      name: 'منظومة الحوكمة والإنتاج الإداري الفعال',
      title: 'هرم تنظيمي متناسق لخدمتكم بلا تأخير وبرقابة مزدوجة على الجودة الكلية',
      qualifications: [
        'مجلس الإدارة والمدير العام (م. عطاالله الدخيل): القيادة الفكرية والتخطيط الاستراتيجي الأعلى للمشاريع الوطنية والاستشارية.',
        'الإدارة الهندسية وأقسام التصميم والحلول الإنشائية: الإشراف المستمر والابتكار المعماري وبناء الهيكل والتصميم الواعد.',
        'قسم الامتثال الفني والبلدي وعلاقات إحكام وبوابة بلدي: الفحص الميداني والتدقيق القانوني والبلدي المتكامل.'
      ],
      memberships: [
        'إرساء معايير الجودة الشاملة وتقييم سير الإنتاج وتسريع فرز الوحدات السكنية.',
        'أنظمة رقابة الجودة الصارمة والتأكد من مطابقة كود البناء السعودي (SBC) قبل التوقيع النهائي والاعتماد.',
        'انسيابية التواصل والشفافية عبر مستويات اتخاذ القرار في المكتب لتحديث العميل بسير معاملته لحظة بلحظة.'
      ],
      experience: [
        'يبدأ مسار معاملتكم تحت رقابة إدارية متسلسلة تبدأ بتسجيل الأبعاد وتوزيع المسؤوليات للمجموعات الفنية المختصة، مع تطبيق حوكمة تمنع تعارض المصالح وترفع مستويات الأمان الإنشائي.',
        'لقد صُمم الهيكل التنظيمي للعطا للاستشارات الهندسية ليكون مرناً، سريعاً، متجاوباً، وداعماً للتنمية والتحول الرقمي البلدي بموثوقية هندسية كاملة.'
      ]
    }
  }
];

export default function Hero({ onOpenConsultation, onExploreProjects }: HeroProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const getIconComponent = (name: string, className: string = "w-12 h-12") => {
    switch (name) {
      case 'Award': return <Award className={`${className} text-gold-matte`} />;
      case 'BookOpen': return <BookOpen className={`${className} text-gold-matte`} />;
      case 'Users': return <Users className={`${className} text-gold-matte`} />;
      case 'Layers': return <Layers className={`${className} text-gold-matte`} />;
      default: return <Award className={`${className} text-gold-matte`} />;
    }
  };

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Visual background image with high-end dark-navy overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503387762458-7e52d4e0e79e?auto=format&fit=crop&w=1920&q=80"
            alt="العطا للاستشارات الهندسية - رؤية ٢٠٣٠"
            className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
            style={{ animationDuration: '20s' }}
          />
          {/* Soft off-white light gradient veil overlaying the structure image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-white/95 to-slate-100/90 z-10"></div>
          {/* Grid pattern accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#a07d2a_1px,transparent_1px)] [background-size:24px_24px] opacity-10 z-10"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
          {/* Subtle Saudi Vision 2030 badge / quality certification badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-reverse space-x-2 bg-gold-matte/10 border border-gold-matte/30 px-4 py-1.5 rounded-full mb-8"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-matte opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-matte"></span>
            </span>
            <span className="text-xs sm:text-sm text-gold-dark font-black tracking-wide font-tajawal">
              شريك معتمد للأمانات والدفاع المدني وممتثل لكود البناء السعودي
            </span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight sm:leading-none tracking-tight font-tajawal max-w-5xl mx-auto"
          >
            تصميم المستقبل
          </motion.h1>

          {/* Hero Description referencing Vision 2030 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg sm:text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto font-light space-y-2"
          >
            <span>في العطا للاستشارات الهندسية، نكرس طاقاتنا وخبراتنا لمواكبة النهضة العمرانية وفق رؤية المملكة ٢٠٣٠. ندمج بين أحدث تكنولوجيا الرفع المساحي المطور وأصالة التخطيط العمراني العصري لنؤسس بنياناً آمناً يفوق التوقعات وبامتثال قانوني مطلق.</span>
          </motion.p>

          {/* Core Quick Value Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-y-3 gap-x-6 text-sm text-slate-600 font-medium"
          >
            <div className="flex items-center space-x-reverse space-x-1.5">
              <CheckCircle className="w-4 h-4 text-gold-matte" />
              <span>مسح كروكيات بلدي معتمد</span>
            </div>
            <div className="flex items-center space-x-reverse space-x-1.5">
              <CheckCircle className="w-4 h-4 text-gold-matte" />
              <span>استشارات تراخيص البناء</span>
            </div>
            <div className="flex items-center space-x-reverse space-x-1.5">
              <CheckCircle className="w-4 h-4 text-gold-matte" />
              <span>تأهيل محطات الوقود وإشراف معتمد</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <button
              onClick={onOpenConsultation}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-tajawal text-md font-bold text-white transition-all duration-300 shadow-lg shadow-gold-matte/20 hover:shadow-gold-matte/40 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group border border-gold-matte/80 select-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #a07d2a 0%, #c4a14d 100%)',
              }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              اطلب استشارتك المجانية الآن
            </button>

            <button
              onClick={onExploreProjects}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-tajawal text-md font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-250 border border-slate-200 hover:border-gold-matte/40 transition-all duration-300 backdrop-blur-xs flex items-center justify-center space-x-reverse space-x-2 select-none cursor-pointer"
            >
              <span>استكشف معرض المشاريع</span>
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
          </motion.div>

          {/* Achievement Badges in Floating Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {SECTIONS_CONTENT.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedIdx(index)}
                className="bg-white/95 border border-slate-200/80 p-5 rounded-2xl text-right hover:border-gold-matte/60 hover:bg-slate-50/50 active:scale-95 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md select-none relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-transparent via-gold-matte/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-gold-matte font-bold tracking-wider uppercase">{item.tag}</span>
                  <div className="opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 text-gold-matte">
                    {getIconComponent(item.iconName, "w-4 h-4")}
                  </div>
                </div>

                <h4 className="text-slate-900 text-md sm:text-lg font-bold font-tajawal group-hover:text-gold-dark transition-colors">
                  {item.name}
                </h4>
                
                <p className="text-xs text-slate-500 mt-1 lines-clamp-1 group-hover:text-slate-705 transition-colors">
                  {item.detail}
                </p>

                <div className="mt-3 flex items-center space-x-reverse space-x-1 text-[10px] text-slate-400 group-hover:text-gold-dark transition-colors pt-2.5 border-t border-slate-150">
                  <span>انقر للتفاصيل والبيانات</span>
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Elegant Architect Ruler/Grid Graphic representation */}
        <div className="absolute bottom-0 right-0 left-0 h-10 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* Structured Detailed Info Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto pt-16 pb-12 md:items-center md:py-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdx(null)}
              className="fixed inset-0 bg-[#000812]/92 backdrop-blur-md z-40 transition-opacity"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-3xl border border-gold-matte/40 shadow-2xl relative w-full max-w-4xl overflow-hidden z-50 flex flex-col md:flex-row-reverse my-auto text-right"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedIdx(null)}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-navy-dark/90 hover:bg-navy-royal md:bg-slate-100 md:hover:bg-slate-200 border border-gold-matte/35 md:border-slate-200 text-gold-matte md:text-slate-600 hover:text-white md:hover:text-slate-900 transition-all duration-300 z-50 shadow-md active:scale-95 cursor-pointer"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Sidebar Design Accent with modern premium visual elements */}
              <div className="md:w-1/3 bg-gradient-to-b from-[#001f3f] to-[#001021] text-white p-8 sm:p-10 text-right flex flex-col justify-between border-b md:border-b-0 md:border-l border-gold-matte/25 relative shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(#a07d2a_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-10"></div>
                
                <div className="relative z-10 space-y-6 pt-4">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-gold-matte/10 border border-gold-matte/30 items-center justify-center text-gold-matte mb-4">
                    {getIconComponent(SECTIONS_CONTENT[selectedIdx].iconName, "w-8 h-8")}
                  </div>

                  <div>
                    <span className="text-xs text-gold-matte font-bold block mb-1 font-sans tracking-wide uppercase">
                      {SECTIONS_CONTENT[selectedIdx].tag}
                    </span>
                    <h3 className="text-2xl font-black font-tajawal text-white leading-tight">
                      {SECTIONS_CONTENT[selectedIdx].name}
                    </h3>
                    <p className="text-slate-300 text-sm mt-2 font-tajawal leading-relaxed">
                      {SECTIONS_CONTENT[selectedIdx].subtitle}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-slate-800">
                  <div className="flex items-center space-x-reverse space-x-2.5 text-xs text-gold-matte font-tajawal">
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>العطا للاستشارات الهندسية</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">معتمد ومرخص ١٠٠٪ بلدي</p>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto max-h-[70vh] md:max-h-[80vh]">
                <div className="pt-2">
                  <h2 className="text-2xl font-black text-[#001f3f] font-tajawal mb-1">
                    {SECTIONS_CONTENT[selectedIdx].content.name}
                  </h2>
                  <p className="text-gold-matte font-bold text-sm mb-6 pb-4 border-b border-slate-100">
                    {SECTIONS_CONTENT[selectedIdx].content.title}
                  </p>

                  {selectedIdx === 3 && (
                    <div className="mb-10 mt-6 overflow-hidden">
                      <h4 className="flex items-center space-x-reverse space-x-2 text-md font-bold text-[#001f3f] mb-6 font-tajawal">
                        <Layers className="w-5 h-5 text-gold-matte shrink-0" />
                        <span>مخطط الهيكل التنظيمي المعتمد بالتفصيل</span>
                      </h4>

                      {/* Web/Desktop Interactive Org Chart Graphic Structure */}
                      <div className="hidden lg:flex flex-col items-center bg-slate-50/70 p-8 rounded-3xl border border-slate-100/80 relative min-w-[750px] overflow-x-auto select-none">
                        
                        {/* Level 1: المدير العام */}
                        <div className="relative flex flex-col items-center z-10 w-full mb-2">
                          <div className="bg-gradient-to-r from-navy-dark to-navy-royal text-white border-2 border-gold-matte px-8 py-3.5 rounded-2xl shadow-lg text-center max-w-sm transition-transform transform hover:scale-103 duration-300">
                            <span className="text-[10px] text-gold-matte font-black tracking-wider block font-sans">القيادة العليا للمكتب</span>
                            <span className="text-base font-black font-tajawal block mt-1">المدير العام</span>
                            <span className="text-xs text-slate-200 mt-1 block font-tajawal">المهندس / عطاالله بن عبدالله الدخيل</span>
                          </div>
                          {/* Connector Line down from Level 1 */}
                          <div className="w-0.5 h-8 bg-gold-matte/40 mt-1"></div>
                        </div>

                        {/* Level 2: Supports and Quality (Performance & Quality on left, Marketing on right) */}
                        <div className="relative w-full max-w-3xl flex justify-between px-16 z-10 mb-4">
                          {/* Left Line & Connector */}
                          <div className="absolute top-0 left-1/2 right-[25%] h-0.5 bg-gold-matte/40"></div>
                          {/* Right Line & Connector */}
                          <div className="absolute top-0 right-1/2 left-[25%] h-0.5 bg-gold-matte/40"></div>
                          
                          {/* Left side support */}
                          <div className="flex flex-col items-center w-[44%]">
                            <div className="w-0.5 h-4 bg-gold-matte/40"></div>
                            <div className="bg-white text-navy-dark border border-gold-matte/30 px-5 py-3 rounded-xl shadow-sm text-center w-full hover:border-gold-matte hover:bg-gold-matte/5 transition-all duration-300">
                              <span className="text-[9px] text-gold-matte font-bold block">مساعد وداعم التطوير والجودة</span>
                              <span className="text-xs font-bold font-tajawal text-navy-dark mt-0.5 block">قسم تطوير الأداء والجودة</span>
                            </div>
                            <div className="w-0.5 h-6 bg-gold-matte/40 font-tajawal"></div>
                          </div>

                          {/* Right side support */}
                          <div className="flex flex-col items-center w-[44%]">
                            <div className="w-0.5 h-4 bg-gold-matte/40"></div>
                            <div className="bg-white text-navy-dark border border-gold-matte/30 px-5 py-3 rounded-xl shadow-sm text-center w-full hover:border-gold-matte hover:bg-gold-matte/5 transition-all duration-300">
                              <span className="text-[9px] text-gold-matte font-bold block">دفع المشاريع واستقطاب العملاء</span>
                              <span className="text-xs font-bold font-tajawal text-navy-dark mt-0.5 block">قسم تسويق المشاريع</span>
                            </div>
                            <div className="w-0.5 h-6 bg-gold-matte/40"></div>
                          </div>
                        </div>

                        {/* Mid Bridge connector down from the Level 2 split */}
                        <div className="w-full flex justify-between relative z-10 px-12 mb-4">
                          {/* Left Bridge connector */}
                          <div className="absolute top-0 left-1/2 right-[25%] h-0.5 bg-gold-matte/40"></div>
                          {/* Right Bridge connector */}
                          <div className="absolute top-0 right-1/2 left-[25%] h-0.5 bg-gold-matte/40"></div>
                          
                          {/* Level 3: ادارة المشاريع */}
                          <div className="flex flex-col items-center w-[44%]">
                            <div className="w-0.5 h-4 bg-gold-matte/40"></div>
                            <div className="bg-[#001f3f] text-white border border-gold-matte/40 px-6 py-3.5 rounded-xl shadow-md text-center w-full hover:bg-navy-royal transition-all duration-300">
                              <span className="text-[9px] text-gold-matte font-bold block">الريادة الفنية والإنتاج</span>
                              <span className="text-sm font-extrabold font-tajawal mt-0.5 block">ادارة المشاريع</span>
                            </div>
                            {/* Vertical Line going down to feed the 5 departments */}
                            <div className="w-0.5 h-6 bg-gold-matte/40"></div>
                          </div>

                          {/* Level 3: ادارة الشئون المالية والادارية */}
                          <div className="flex flex-col items-center w-[44%]">
                            <div className="w-0.5 h-4 bg-gold-matte/40"></div>
                            <div className="bg-[#001f3f] text-white border border-gold-matte/40 px-6 py-3.5 rounded-xl shadow-md text-center w-full hover:bg-navy-royal transition-all duration-300">
                              <span className="text-[9px] text-gold-matte font-bold block">المساندة المالية والتنظيم</span>
                              <span className="text-sm font-extrabold font-tajawal mt-0.5 block">ادارة الشئون المالية والادارية</span>
                            </div>
                            {/* Vertical Line going down to feed the 2 departments */}
                            <div className="w-0.5 h-6 bg-gold-matte/40"></div>
                          </div>
                        </div>

                        {/* Grid container for Level 4 elements under their respective parents */}
                        <div className="flex justify-between w-full mt-1 relative z-10 px-2 gap-8">
                          
                          {/* Columns under: ادارة المشاريع (5 Depts) */}
                          <div className="w-1/2 flex flex-col items-center relative pr-2 border-l border-slate-200/50">
                            {/* Top Horizontal line across bottom depts */}
                            <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-gold-matte/30"></div>
                            
                            {/* Flex children layout for 5 departments */}
                            <div className="grid grid-cols-5 gap-1.5 w-full pt-4">
                              {[
                                { name: 'نظم المعلومات الجغرافية' },
                                { name: 'الاشراف الهندسي' },
                                { name: 'المساحة والخرائط' },
                                { name: 'الدراسات والتصاميم' },
                                { name: 'التخطيط العمراني' }
                              ].map((dept, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                  {/* connection vertical line */}
                                  <div className="w-0.5 h-3 bg-gold-matte/30 -mt-4 mb-1"></div>
                                  <div className="bg-slate-100 text-[#001f3f] border border-slate-200 p-2 rounded-lg shadow-2xs w-full hover:border-gold-matte/50 hover:bg-white transition-all duration-300 flex flex-col justify-center min-h-[76px]">
                                    <span className="text-[10px] font-bold font-tajawal leading-snug">{dept.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Columns under: ادارة الشئون المالية والادارية (2 Depts) */}
                          <div className="w-1/2 flex flex-col items-center relative pl-2">
                            {/* Top Horizontal line across bottom depts */}
                            <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-gold-matte/30"></div>
                            
                            {/* Flex children layout for 2 departments */}
                            <div className="grid grid-cols-2 gap-4 w-full pt-4 max-w-sm">
                              {[
                                { name: 'الشؤون الادارية والمالية' },
                                { name: 'شئون الموظفين' }
                              ].map((dept, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                  {/* connection vertical line */}
                                  <div className="w-0.5 h-3 bg-gold-matte/30 -mt-4 mb-1"></div>
                                  <div className="bg-slate-100 text-[#001f3f] border border-slate-200 p-2 text-center rounded-lg shadow-2xs w-full hover:border-gold-matte/50 hover:bg-white transition-all duration-300 flex flex-col justify-center min-h-[76px]">
                                    <span className="text-[11px] font-bold font-tajawal leading-snug">{dept.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Mobile Friendly responsive vertical list Org Chart */}
                      <div className="lg:hidden flex flex-col space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 select-none">
                        {/* Unit Block (Top Manager) */}
                        <div className="bg-gradient-to-r from-[#001021] to-[#001f3f] text-white border-r-4 border-gold-matte p-3 rounded-xl shadow-sm text-right">
                          <span className="text-[8px] text-gold-matte font-bold block">القيادة العليا للمكتب</span>
                          <span className="text-xs font-black font-tajawal block mt-0.5">المدير العام: المهندس/ عطاالله عبدالله الدخيل</span>
                        </div>

                        {/* Indented Supports */}
                        <div className="mr-4 space-y-2 border-r-2 border-dashed border-gold-matte/30 pr-3">
                          <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-3xs">
                            <span className="text-xs font-bold font-tajawal text-[#001f3f]">قسم تطوير الاداء والجودة</span>
                          </div>
                          <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-3xs">
                            <span className="text-xs font-bold font-tajawal text-[#001f3f]">قسم تسوق المشاريع</span>
                          </div>
                        </div>

                        {/* Core Managers */}
                        <div className="mr-3 space-y-4 pt-2">
                          {/* 1. إدارة المشاريع Section */}
                          <div className="space-y-2">
                            <div className="bg-[#002855] text-white p-2.5 rounded-lg text-right flex items-center justify-between">
                              <span className="text-xs font-black font-tajawal">ادارة المشاريع</span>
                              <span className="text-[9px] bg-gold-matte/20 text-gold-light px-2 py-0.5 rounded font-bold">٥ أقسام</span>
                            </div>
                            {/* Inner Departments */}
                            <div className="mr-4 space-y-1.5 border-r border-slate-200 pr-3.5 pt-1">
                              {['نظم المعلومات الجغرافية', 'الاشراف الهندسي', 'المساحة والخرائط', 'الدراسات والتصاميم', 'التخطيط العمراني'].map((item, idx) => (
                                <div key={idx} className="bg-white text-xs font-medium font-tajawal p-2 rounded-lg border border-slate-100/80 text-slate-700">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. إدارة الشؤون المالية والإدارية Section */}
                          <div className="space-y-2">
                            <div className="bg-[#0c1a30] text-white p-2.5 rounded-lg text-right flex items-center justify-between">
                              <span className="text-xs font-black font-tajawal">ادارة الشئون المالية والادارية</span>
                              <span className="text-[9px] bg-gold-matte/20 text-gold-light px-2 py-0.5 rounded font-bold">قسمين</span>
                            </div>
                            {/* Inner Departments */}
                            <div className="mr-4 space-y-1.5 border-r border-slate-200 pr-3.5 pt-1">
                              {['الشؤون الادارية والمالية', 'شئون الموظفين'].map((item, idx) => (
                                <div key={idx} className="bg-white text-xs font-medium font-tajawal p-2 rounded-lg border border-slate-100/80 text-slate-700">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Qualifications Panel */}
                  <div className="mb-6">
                    <h4 className="flex items-center space-x-reverse space-x-2 text-md font-bold text-[#001f3f] mb-3 font-tajawal">
                      <GraduationCap className="w-5 h-5 text-gold-matte shrink-0" />
                      <span>{selectedIdx === 0 ? "المؤهلات ومجالات التخصص" : "الركائز الأساسية"}</span>
                    </h4>
                    <div className="space-y-2">
                      {SECTIONS_CONTENT[selectedIdx].content.qualifications.map((item, key) => (
                        <div key={key} className="flex items-start space-x-reverse space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-sm font-tajawal">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Memberships Panel */}
                  <div className="mb-6">
                    <h4 className="flex items-center space-x-reverse space-x-2 text-md font-bold text-[#001f3f] mb-3 font-tajawal">
                      <ScrollText className="w-5 h-5 text-gold-matte shrink-0" />
                      <span>{selectedIdx === 0 ? "العضويات المهنية والتراخيص" : (SECTIONS_CONTENT[selectedIdx].content as any).bulletsTitle || "خدمات ذات قيمة مضافة"}</span>
                    </h4>
                    <div className="space-y-2">
                      {SECTIONS_CONTENT[selectedIdx].content.memberships.map((item, key) => (
                        <div key={key} className="flex items-start space-x-reverse space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                          <Check className="w-4 h-4 text-gold-matte stroke-[3] shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-sm font-tajawal">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience block (Formatted paragraph blocks) */}
                  <div>
                    <h4 className="flex items-center space-x-reverse space-x-2 text-md font-bold text-[#001f3f] mb-3 font-tajawal">
                      <Briefcase className="w-5 h-5 text-gold-matte shrink-0" />
                      <span>{selectedIdx === 0 ? "موجز الخبرة المهنية والتميز" : "التفاصيل والمسار الميداني"}</span>
                    </h4>
                    <div className="space-y-4 text-sm text-slate-650 leading-relaxed font-tajawal text-justify bg-slate-50/40 p-5 rounded-2xl border border-slate-100">
                      {SECTIONS_CONTENT[selectedIdx].content.experience.map((para, id) => (
                        <p key={id} className="last:mb-0">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Modal Action */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <span className="text-xs text-slate-400 font-tajawal text-center sm:text-right">
                    هل تبحث عن استشارة هندسية وافية؟ سيتواصل معك فريقنا الاستشاري فورا.
                  </span>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedIdx(null);
                        onOpenConsultation();
                      }}
                      className="px-6 py-2.5 rounded-xl font-tajawal text-xs font-bold text-white shadow-md shadow-gold-matte/10 select-none cursor-pointer hover:scale-103 active:scale-95 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #a07d2a 0%, #c4a14d 100%)',
                      }}
                    >
                      طلب استشارة مجانية
                    </button>
                    <button
                      onClick={() => setSelectedIdx(null)}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors select-none cursor-pointer"
                    >
                      إغلاق النافذة
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
