/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { X, Shield, Mail, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminLoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Monitor for custom event from the Footer key icon
  useEffect(() => {
    const handleOpenLogin = () => {
      setIsOpen(true);
      setErrorMsg('');
      setIsSuccess(false);
      setEmail('');
      setPassword('');
    };

    window.addEventListener('open-alata-admin-login', handleOpenLogin);
    return () => {
      window.removeEventListener('open-alata-admin-login', handleOpenLogin);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // Simulate database credentials verify
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanEmail === 'ataa.consult2025@gmail.com' && cleanPassword === '55555301') {
        setIsSuccess(true);
        sessionStorage.setItem('alata_admin_logged_in', 'true');
        
        // Dispatch custom storage event for sync
        window.dispatchEvent(new Event('storage'));

        // Short success delay to show the beautiful celebration
        setTimeout(() => {
          setIsSuccess(false);
          setIsOpen(false);
          setIsLoading(false);
        }, 1500);
      } else {
        setErrorMsg('البريد الإلكتروني للإدارة أو كلمة المرور غير صحيحة! 🔒');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          ></motion.div>

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl border border-gold-matte/30 shadow-2xl relative w-full max-w-md overflow-hidden z-20 p-6 sm:p-8 text-right"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer block"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Intro */}
            <div className="text-center mb-6 pt-4">
              <div className="inline-flex h-12 w-12 rounded-2xl bg-gold-matte/10 border border-gold-matte/40 items-center justify-center text-gold-matte mb-3 animate-pulse">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold font-tajawal text-slate-900">بوابة الإدارة وصيانة معرض النماذج</h3>
              <p className="text-xs text-slate-500 mt-1.5 font-tajawal">
                الرجاء تسجيل الدخول ببياناتك المعتمدة لتعديل المخططات ومعارض العمل.
              </p>
            </div>

            {/* Success Animation or Form */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <h4 className="text-emerald-600 font-black text-lg font-tajawal">مرحباً بك مهندس عطاالله</h4>
                <p className="text-slate-500 text-xs font-tajawal">تم تفعيل لوحة الإشراف والتعديل المباشر بنجاح! 🏛️🔑</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-650 text-xs font-bold leading-relaxed font-tajawal text-right"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                {/* Email Field */}
                <div>
                  <label className="text-slate-700 font-bold text-xs font-tajawal block mb-2">البريد الإلكتروني المعتمد</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="username@ataa-consult.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-xs sm:text-sm font-sans transition-all text-left bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-slate-700 font-bold text-xs font-tajawal block mb-2">كلمة المرور السرية</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 focus:border-gold-matte/80 focus:ring-1 focus:ring-gold-matte/80 outline-none text-xs sm:text-sm font-sans transition-all text-left bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Submission Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#001f3f] hover:bg-[#002b56] text-white rounded-xl font-bold font-tajawal text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-reverse space-x-2 cursor-pointer select-none active:scale-98 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    ></motion.div>
                  ) : (
                    <>
                      <span>تسجيل الدخول الفني المعتمد</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Note & Security Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-tajawal">
                🔒 اتصال مشفر وآمن. يخضع النظام لقانون مكافحة الجرائم المعلوماتية بالهيئة الوطنية للأمن السيبراني.
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
