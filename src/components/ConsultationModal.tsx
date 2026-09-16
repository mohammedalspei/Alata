/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, Loader2, Bookmark, Clock, Phone, MapPin, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConsultationRequest } from '../types';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledServiceType?: string;
}

export default function ConsultationModal({ isOpen, onClose, prefilledServiceType }: ConsultationModalProps) {
  // Form fields state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState('الخدمات المساحية وتخطيط الأراضي');
  const [constructionDetails, setConstructionDetails] = useState('');
  const [city, setCity] = useState('القصيم (بريدة)');
  const [notes, setNotes] = useState('');

  // Workflow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0); // 0: Idle, 1: Verifying specs, 2: Choice, 3: Completed
  const [errorMsg, setErrorMsg] = useState('');
  const [pastRequests, setPastRequests] = useState<ConsultationRequest[]>([]);
  const [lastSubmittedPhone, setLastSubmittedPhone] = useState('');
  const [lastConsultNo, setLastConsultNo] = useState('');

  // Clean submission states on modal close
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setSubmitStep(0);
      setLastConsultNo('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (prefilledServiceType) {
      setServiceType(prefilledServiceType);
    }
  }, [prefilledServiceType, isOpen]);

  // Load past consultations from LocalStorage for persistence
  useEffect(() => {
    const saved = localStorage.getItem('al_ata_consultations');
    if (saved) {
      try {
        setPastRequests(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  const generateMessageBody = (consultCode: string) => {
    const divider = '=========================';
    return `السلام عليكم ورحمة الله وبركاته،

أود تقديم طلب استشارة هندسية عبر بوابة العطا للاستشارات الهندسية.

*تفاصيل طلب الاستشارة:*
${divider}
• رمز الاستشارة: ${consultCode}
• الاسم الكريم: ${fullName}
• رقم الجوال: +966 ${phoneNumber}
• البريد الإلكتروني: ${email || 'غير مدرج'}
• فرع التعميد / المدينة: ${city}
• الخدمة المطلوبة: ${serviceType}
• مواصفات العقار أو التشييد: ${constructionDetails}
• ملاحظات إضافية: ${notes || 'لا يوجد'}
${divider}

تم توليد هذه الرسالة ومطابقتها مع المعايير الفنية لكود البناء السعودي. برجاء موافاتنا بالتأكيدات والدراسة المبدئية قريباً. وشكراً لكم.`;
  };

  const saveRequestLocallyAndProceed = (channelUsed: 'whatsapp' | 'email' | null) => {
    const consultNo = lastConsultNo || `ATA-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    if (!lastConsultNo) {
      setLastConsultNo(consultNo);
    }
    setLastSubmittedPhone(phoneNumber);

    const newRequest: ConsultationRequest = {
      id: `req-${Date.now()}`,
      fullName,
      phoneNumber,
      email: email || 'غير مدرج',
      serviceType,
      constructionDetails,
      city,
      notes,
      createdAt: new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'pending',
    };

    const updated = [newRequest, ...pastRequests];
    setPastRequests(updated);
    try {
      localStorage.setItem('al_ata_consultations', JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage quota exceeded, skipped saving consultations locally:", e);
    }

    // Clear input form
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setConstructionDetails('');
    setNotes('');

    setSubmitStep(3);
  };

  const handleSendViaWhatsApp = () => {
    const consultNo = lastConsultNo || `ATA-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    setLastConsultNo(consultNo);

    const text = generateMessageBody(consultNo);
    // WhatsApp URL to +966583893870
    const waUrl = `https://wa.me/966583893870?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    saveRequestLocallyAndProceed('whatsapp');
  };

  const handleSendViaEmail = () => {
    const consultNo = lastConsultNo || `ATA-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    setLastConsultNo(consultNo);

    const subject = `طلب استشارة هندسية معتمد - كود ${consultNo} - ${fullName}`;
    const body = generateMessageBody(consultNo);
    // mailto to ataa.consult2025@gmail.com
    const mailtoUrl = `mailto:ataa.consult2025@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    saveRequestLocallyAndProceed('email');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic Validations
    if (!fullName.trim()) {
      setErrorMsg('الرجاء إدخال الاسم الكريم بالكامل.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setErrorMsg('الرجاء إدخال رقم جوال صحيح للتواصل (مثال: 5xxxxxxxx).');
      return;
    }
    if (!constructionDetails.trim()) {
      setErrorMsg('أدخل تفاصيل البناء أو رقم المخطط ليتثنى لمهندسينا مراجعته.');
      return;
    }

    // Begin animated step submission
    setIsSubmitting(true);
    setSubmitStep(1);

    // After 1.2 seconds, transition to the selection overlay step (submitStep = 2)
    setTimeout(() => {
      setSubmitStep(2);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto pt-16 pb-12 md:items-center md:py-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
          ></motion.div>

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white rounded-3xl border border-gold-matte/30 shadow-2xl relative w-full max-w-4xl overflow-hidden z-20 flex flex-col md:flex-row-reverse my-auto"
          >
            {/* High-visibility Close Button - Always visible in corner with custom background adapting to dark side on theme */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-300 z-50 shadow-md active:scale-95 cursor-pointer block"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
            {/* Left/Right Sidebar Design Accent */}
            <div className="md:w-1/3 bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 p-8 text-right flex flex-col justify-between border-b md:border-b-0 md:border-l border-gold-matte/10 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#a07d2a_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-10"></div>
              
              <div className="relative z-10 space-y-6 pt-4">
                <div className="inline-flex h-12 w-12 rounded-xl bg-gold-matte/10 border border-gold-matte/40 items-center justify-center text-gold-matte mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-tajawal text-slate-900">جلسة استشارية أولى مجاناً</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light font-tajawal">
                  عند تقديم طلبك، يقوم كبار مهندسينا ومسؤولي التراخيص والرفع المساحي بمراجعة المعالم الكنتورية وكود البناء المعتمد في موقعك لإعطائك دراسة شاملة وعرض سعر دقيق لا يحمل أية تعقيدات خفية.
                </p>
                <div className="space-y-3.5 pt-4 text-xs font-light text-slate-500 font-tajawal">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Clock className="w-4 h-4 text-gold-matte shrink-0" />
                    <span>مراجعة مبدئية خلال ٢٤ ساعة</span>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <ShieldCheck className="w-4 h-4 text-gold-matte shrink-0" />
                    <span>حماية وسرية تامة لبيانات الصكوك</span>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Phone className="w-4 h-4 text-gold-matte shrink-0" />
                    <span>مكالمة هاتفية أو استضافة بالمكتب</span>
                  </div>
                </div>
              </div>

              {/* Past submissions summary */}
              {pastRequests.length > 0 && (
                <div className="relative z-10 mt-8 pt-4 border-t border-slate-200">
                  <span className="text-[11px] text-gold-dark font-black flex items-center space-x-reverse space-x-1 mb-2.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>طلباتك السابقة قيد الانتظار ({pastRequests.length}):</span>
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-thin">
                    {pastRequests.map((req) => (
                      <div key={req.id} className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-700 flex justify-between items-center text-right shadow-xs">
                        <div>
                          <p className="font-bold font-tajawal text-slate-900 truncate max-w-[120px]">{req.serviceType}</p>
                          <span className="text-slate-400 font-sans">{req.createdAt}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-gold-matte/10 border border-gold-matte/30 text-gold-dark">قيد الدرس</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Section */}
            <div className="flex-1 p-8 sm:p-10 text-right">

              <h2 className="text-2xl font-black text-slate-900 font-tajawal mb-2 pt-4">طلب استشارة هندسية وافية</h2>
              <p className="text-gray-500 text-xs sm:text-sm mb-6">أدخل البيانات الأساسية لعقارك، وسيتواصل معك مهندس متخصص خلال فترة وجيزة.</p>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-rose-550/10 border-r-4 border-rose-500 text-rose-700 text-xs sm:text-sm rounded-l-md font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Submission animation veil */}
              <AnimatePresence>
                {isSubmitting && (
                   <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
                  >
                    {submitStep === 1 && (
                      <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-gold-matte animate-spin mx-auto" />
                        <h4 className="text-lg font-bold text-slate-900 font-tajawal">جاري فحص الاشتراطات الفنية...</h4>
                        <p className="text-gray-405 text-xs">مطابقة المخطط المساحي المقترح مع لوائح الدفاع المدني وكود مواءمة بلدي.</p>
                      </div>
                    )}
                    {submitStep === 2 && (
                      <div className="space-y-6 max-w-md w-full mx-auto p-4">
                        <div className="w-14 h-14 rounded-full bg-gold-matte/10 border border-gold-matte/30 flex items-center justify-center mx-auto text-gold-matte mb-1">
                          <CheckCircle2 className="w-8 h-8 text-gold-matte" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-black text-slate-900 font-tajawal">تمت مراجعة بياناتك بنجاح!</h4>
                          <p className="text-slate-600 text-xs sm:text-sm font-tajawal leading-relaxed">
                            اختر الآن وسيلة إرسال طلبك المباشر لتسليمه لمهندسينا، يرجى تفعيل الإرسال وتأكيده للبدء فوراً:
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {/* Email Option (Primary Requested Action) */}
                          <button
                            type="button"
                            onClick={handleSendViaEmail}
                            className="flex items-center space-x-reverse space-x-4 p-4 bg-gradient-to-l from-gold-matte/10 to-transparent hover:from-gold-matte/20 border border-gold-matte/30 hover:border-gold-matte rounded-2xl transition-all group duration-300 shadow-sm cursor-pointer text-right w-full"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gold-matte text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                              <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-extrabold text-slate-900 font-tajawal block">تأكيد الإرسال عبر البريد الإلكتروني</span>
                              <span className="text-[10px] text-slate-500 font-tajawal block mt-0.5">سيتم فتح بريدك الموجه لـ ataa.consult2025@gmail.com</span>
                            </div>
                          </button>

                          {/* WhatsApp Option */}
                          <button
                            type="button"
                            onClick={handleSendViaWhatsApp}
                            className="flex items-center space-x-reverse space-x-4 p-4 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-500 rounded-2xl transition-all group duration-300 shadow-sm cursor-pointer text-right w-full"
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.074 2.875 1.222 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-extrabold text-slate-900 font-tajawal block">إرسال عبر الواتساب المباشر</span>
                              <span className="text-[10px] text-slate-500 font-tajawal block mt-0.5">محادثة فورية سريعة مع فروع وممثلي خدمة العطا</span>
                            </div>
                          </button>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => saveRequestLocallyAndProceed(null)}
                            className="text-slate-400 hover:text-slate-600 text-[11px] underline font-tajawal transition-colors cursor-pointer"
                          >
                            تخطي والحفظ في الأرشيف المحلي فقط
                          </button>
                        </div>
                      </div>
                    )}
                    {submitStep === 3 && (
                      <div className="space-y-4 max-w-sm">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                        <h4 className="text-xl font-bold text-slate-900 font-tajawal">تم إرسال وقبول استشارتك بنجاح!</h4>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                          رمز الاستشارة الخاص بك هو <span className="font-mono font-bold text-slate-900 bg-slate-50/80 border border-slate-150 px-2 py-0.5 rounded">{lastConsultNo}</span>. سنتصل بك على رقم {lastSubmittedPhone} لمطابقة الأبعاد طوبوغرافياً. شكراً لثقتكم.
                        </p>

                        <button
                          type="button"
                          onClick={onClose}
                          className="mt-4 px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold font-tajawal transition-all cursor-pointer shadow-xs border border-slate-200"
                        >
                          إغلاق النافذة
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Standard Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold text-xs font-tajawal block">الاسم الكريم بالكامل <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="عطاالله عبدالله الدخيل"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold text-xs font-tajawal block">رقم الجوال الفعال <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="501234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-16 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-sm font-sans transition-all text-right bg-slate-50/50"
                      />
                      <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-mono select-none" dir="ltr">+966</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Service dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold text-xs font-tajawal block">نوع الخدمة الاستشارية المطلوبة</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-sm font-tajawal transition-all bg-slate-50/50"
                    >
                      <option value="الخدمات المساحية وتخطيط الأراضي">الخدمات المساحية وتخطيط الأراضي</option>
                      <option value="التصاميم الهندسية المتكاملة">التصاميم الهندسية المتكاملة</option>
                      <option value="إصدار التراخيص الهندسية والبلدية">إصدار التراخيص الاستشارية ومنصة بلدي</option>
                      <option value="الإشراف الهندسي الميداني">الإشراف الهندسي الميداني والتأمين</option>
                      <option value="إدارة وتوجيه المشاريع الهندسية">إدارة وتوجيه المشاريع الهندسية</option>
                      <option value="الدراسات الاستشارية والفنية">الدراسات الاستشارية وفحص التربة</option>
                    </select>
                  </div>

                  {/* City dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold text-xs font-tajawal block">الموقع أو فرع التعميد</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-sm font-tajawal transition-all bg-slate-50/50"
                    >
                      <option value="القصيم (بريدة)">القصيم (بريدة - المقر الرئيسي)</option>
                    </select>
                  </div>
                </div>

                {/* Construction details */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold text-xs font-tajawal block">مواصفات الأرض أو تفاصيل التشييد <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أرض فضاء بمخطط بريدة، مساحتها ٦٠٠ م²، صك رقم ۱۲۳"
                    value={constructionDetails}
                    onChange={(e) => setConstructionDetails(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-sm transition-all bg-slate-50/50"
                  />
                </div>

                {/* Additional notes */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold text-xs font-tajawal block">ملاحظات إضافية (اختياري)</label>
                  <textarea
                    rows={3}
                    placeholder="التراخيص المطلوبة، مخططات الدفاع المدني، أي متطلبات إنشائية خاصة..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-sm transition-all bg-slate-50/50 resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold font-tajawal text-sm text-white shadow-lg shadow-gold-matte/25 hover:shadow-gold-matte/45 active:scale-98 transition-all flex items-center justify-center space-x-reverse space-x-2.5 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #a07d2a 0%, #c4a14d 100%)',
                    }}
                  >
                    <span>تأكيد المراجعة وإرسال لخبراء العطا</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
