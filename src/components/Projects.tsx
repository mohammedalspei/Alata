/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { projectsData } from '../data';
import { Project } from '../types';
import { 
  MapPin, 
  Ruler, 
  Calendar, 
  Check, 
  ArrowLeft, 
  X, 
  Sparkles, 
  Building2,
  Laptop,
  Smartphone,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Info,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectsProps {
  onOpenConsultationWithProject: (projectTitle: string) => void;
}

type FilterCategory = 'all' | 'medical' | 'gas_station' | 'residential' | 'commercial' | 'infrastructure' | 'interior';

export default function Projects({ onOpenConsultationWithProject }: ProjectsProps) {
  // Safe helper to recursively compress canvas to keep output Base64 under Firestore 1MB limits
  const compressImageToUnderLimit = (
    img: HTMLImageElement,
    initialQuality: number = 0.8,
    maxWidth: number = 1100,
    maxHeight: number = 825
  ): string => {
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(img, 0, 0, width, height);

    let quality = initialQuality;
    let base64Str = canvas.toDataURL('image/jpeg', quality);

    let attempts = 0;
    while (base64Str.length > 900000 && attempts < 5) {
      attempts++;
      quality -= 0.15;
      if (quality < 0.2) {
        canvas.width = Math.round(canvas.width * 0.7);
        canvas.height = Math.round(canvas.height * 0.7);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        quality = 0.6;
      }
      base64Str = canvas.toDataURL('image/jpeg', quality);
    }
    return base64Str;
  };

  const [filter, setFilter] = useState<FilterCategory>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeLightboxImageIndex, setActiveLightboxImageIndex] = useState<number>(0);
  const [isFullyContained, setIsFullyContained] = useState<boolean>(true);
  const [isZoomedOpen, setIsZoomedOpen] = useState<boolean>(false);

  // Auto-reset light box image index when selecting a new project
  useEffect(() => {
    setActiveLightboxImageIndex(0);
    setIsFullyContained(true);
    setIsZoomedOpen(false);
  }, [selectedProject]);

  // Dynamic projects list loaded from server / local storage
  const [projectsList, setProjectsList] = useState<Project[]>(() => {
    try {
      const localSaved = localStorage.getItem('alata_custom_projects');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading local initial projects:", e);
    }
    return projectsData;
  });
  const [activeEditId, setActiveEditId] = useState<string>(() => {
    try {
      const localSaved = localStorage.getItem('alata_custom_projects');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          return parsed[0].id;
        }
      }
    } catch (e) {
      // ignore
    }
    return projectsData[0]?.id || '';
  });
  const [selectedShowcaseDevice, setSelectedShowcaseDevice] = useState<'laptop' | 'mobile'>('laptop');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-saving debounced state management
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'typing' | 'saving' | 'saved' | 'failed'>('idle');

  // Cancel any pending save timeout on component unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Synchronized Administration credentials check (synced globally)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Monitor Admin LoggedIn status across components instantly
  useEffect(() => {
    const checkAdminStatus = () => {
      const logged = sessionStorage.getItem('alata_admin_logged_in') === 'true';
      if (logged !== isAdminLoggedIn) {
        setIsAdminLoggedIn(logged);
      }
    };
    checkAdminStatus();
    const interval = setInterval(checkAdminStatus, 1000);
    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  const handleAdminLogout = () => {
    sessionStorage.removeItem('alata_admin_logged_in');
    setIsAdminLoggedIn(false);
    triggerAlert('success', 'تم تسجيل الخروج بنجاح من لوحة الإشراف والموقع الآن بالوضع العام للزوار! 🔓👋');
  };

  const [companyLogoAdmin, setCompanyLogoAdmin] = useState<string | null>(() => {
    try {
      return localStorage.getItem('alata_company_logo') || null;
    } catch (e) {
      return null;
    }
  });

  // Sync back company logo from server
  useEffect(() => {
    fetch('/api/custom-images')
      .then(res => res.json())
      .then(data => {
        if (data && data.company_logo) {
          setCompanyLogoAdmin(data.company_logo);
          try {
            localStorage.setItem('alata_company_logo', data.company_logo);
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveNewLogo = async (base64Str: string) => {
    try {
      setCompanyLogoAdmin(base64Str);
      try {
        localStorage.setItem('alata_company_logo', base64Str);
      } catch (e) {
        console.warn("Storage quota exceeded, skipping local storage logo save:", e);
      }
      
      // Notify other parts of the UI
      window.dispatchEvent(new CustomEvent('alata-logo-changed'));
      
      const fetchImagesRes = await fetch('/api/custom-images');
      let currentImages = {};
      if (fetchImagesRes.ok) {
        currentImages = await fetchImagesRes.json();
      }
      
      const updatedImages = {
        ...currentImages,
        company_logo: base64Str
      };
      
      await fetch('/api/custom-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedImages })
      });
      
      triggerAlert('success', 'تم تعديل صورة شعار العطا للاستشارات الهندسية بنجاح وتثبيته في كامل الموقع! 🏆✨');
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'حدث خطأ في مزامنة الشعار مع الخادم الرئيسي!');
    }
  };

  const handleResetLogo = async () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف الشعار المخصص والعودة للمظهر الهندسي الذهبي الافتراضي؟')) {
      try {
        setCompanyLogoAdmin(null);
        localStorage.removeItem('alata_company_logo');
        
        window.dispatchEvent(new CustomEvent('alata-logo-changed'));
        
        const fetchImagesRes = await fetch('/api/custom-images');
        let currentImages: Record<string, string> = {};
        if (fetchImagesRes.ok) {
          currentImages = await fetchImagesRes.json();
        }
        
        if (currentImages && currentImages.company_logo) {
          delete currentImages.company_logo;
        }
        
        await fetch('/api/custom-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: currentImages })
        });
        
        triggerAlert('success', 'تم استعادة الشعار التأسيسي الافتراضي للموقع بنجاح! 🏛️');
      } catch (err) {
        console.error(err);
        triggerAlert('error', 'فشلت عملية استعادة الشعار التأسيسي!');
      }
    }
  };

  // Load custom projects on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/custom-projects')
      .then(res => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          if (data && Array.isArray(data.projects) && data.projects.length > 0) {
            setProjectsList(data.projects);
            setActiveEditId(data.projects[0].id);
            try {
              localStorage.setItem('alata_custom_projects', JSON.stringify(data.projects));
            } catch (storageErr) {
              console.warn("Storage quota limit during mount syncer ignored", storageErr);
            }
          } else {
            // No custom projects on server yet, check local storage
            const localSaved = localStorage.getItem('alata_custom_projects');
            if (localSaved) {
              try {
                const parsed = JSON.parse(localSaved);
                if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                  setProjectsList(parsed);
                  setActiveEditId(parsed[0].id);
                  // Sync with server since server doesn't have it
                  saveProjectsToServer(parsed, false);
                }
              } catch (e) {
                console.error("Local storage parse err:", e);
              }
            } else {
              // Initialize with default
              setProjectsList(projectsData);
              setActiveEditId(projectsData[0].id);
            }
          }
        }
      })
      .catch(err => {
        console.warn("API offline, falling back directly to local storage / static defaults:", err);
        const localSaved = localStorage.getItem('alata_custom_projects');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProjectsList(parsed);
              setActiveEditId(parsed[0].id);
            }
          } catch (e) {
            // Ignore
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Self-Healing Image Compressor Hook
  // Scans for uncompressed, bloated base64 images in projects and auto-compresses them on admin load to fit Firestore limits
  useEffect(() => {
    if (!isAdminLoggedIn || projectsList.length === 0) return;

    const bloatedIds = new Set<string>();
    projectsList.forEach(proj => {
      let bloated = false;
      if (proj.image && proj.image.startsWith("data:image/") && proj.image.length > 900000) {
        bloated = true;
      }
      if (Array.isArray(proj.images)) {
        proj.images.forEach(img => {
          if (img && img.startsWith("data:image/") && img.length > 900000) {
            bloated = true;
          }
        });
      }
      if (bloated) {
        bloatedIds.add(proj.id);
      }
    });

    if (bloatedIds.size > 0) {
      console.log("Self-healing image compressor: Bloated projects detected, starting auto-compression...");
      
      const healingPromises = projectsList.map(async (proj) => {
        if (!bloatedIds.has(proj.id)) return proj;
        
        const healedProj = { ...proj };

        // Heal main image
        if (healedProj.image && healedProj.image.startsWith("data:image/") && healedProj.image.length > 900000) {
          try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const element = new Image();
              element.onload = () => resolve(element);
              element.onerror = (e) => reject(e);
              element.src = healedProj.image;
            });
            const compressed = compressImageToUnderLimit(img, 0.72, 1000, 750);
            if (compressed) healedProj.image = compressed;
          } catch (err) {
            console.error("Self-healing: failed to compress main image for project", proj.id, err);
          }
        }

        // Heal gallery images
        if (Array.isArray(healedProj.images)) {
          healedProj.images = await Promise.all(healedProj.images.map(async (img) => {
            if (img && img.startsWith("data:image/") && img.length > 900000) {
              try {
                const element = await new Promise<HTMLImageElement>((resolve, reject) => {
                  const el = new Image();
                  el.onload = () => resolve(el);
                  el.onerror = (e) => reject(e);
                  el.src = img;
                });
                const compressed = compressImageToUnderLimit(element, 0.72, 900, 675);
                return compressed || img;
              } catch (err) {
                console.error("Self-healing: failed to compress gallery image", err);
                return img;
              }
            }
            return img;
          }));
        }

        return healedProj;
      });

      Promise.all(healingPromises).then((healedList) => {
        console.log("Self-healing image compressor completed! Saving healed list to server...");
        setProjectsList(healedList);
        saveProjectsToServer(healedList, false);
        triggerAlert('info', 'تم تحسين وضغط صور التصاميم القديمة تلقائياً لتناسب معايير قواعد البيانات السحابية ومزامنتها! 💾⚡');
      }).catch(err => {
        console.error("Self-healing loop failed:", err);
      });
    }
  }, [isAdminLoggedIn, projectsList]);

  // System alert feedback states
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const triggerAlert = (type: 'success' | 'error' | 'info', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(prev => prev?.text === text ? null : prev);
    }, 4500);
  };

  // Save changes to Server API + Fallback LocalStorage
  const saveProjectsToServer = async (updatedProjects: Project[], displayToast = true) => {
    setIsSyncing(true);
    setAutoSaveStatus('saving');
    try {
      try {
        localStorage.setItem('alata_custom_projects', JSON.stringify(updatedProjects));
      } catch (storageErr) {
        console.warn("Storage Quota Exceeded on client, skipped local cache but proceeding to save to cloud server safely:", storageErr);
      }
      const res = await fetch('/api/custom-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: updatedProjects })
      });
      if (!res.ok) throw new Error("API responded with error");
      setAutoSaveStatus('saved');
      if (displayToast) {
        triggerAlert('success', 'تم حفظ ومزامنة النماذج على الخادم واستعراضها فوراً بالموقع! 💾☁️');
      }
    } catch (e) {
      console.error("Save error:", e);
      setAutoSaveStatus('failed');
      if (displayToast) {
        triggerAlert('info', 'تم حفظ التعديلات على جهازك؛ سيتم المزامنة التلقائية مع الخادم المعتمد عند عودة الاتصال 🌐');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const getActiveProjectObj = () => {
    return projectsList.find(p => p.id === activeEditId) || projectsList[0] || null;
  };

  const updateActiveProjectField = (field: keyof Project, value: string) => {
    const updated = projectsList.map(proj => {
      if (proj.id === activeEditId) {
        const item = { ...proj, [field]: value };
        // Clean category label dynamically
        if (field === 'category') {
          if (value === 'gas_station') item.categoryLabel = 'محطات وقود (عينة لوجستية)';
          else if (value === 'residential') item.categoryLabel = 'فلل وقصور سكنية (عينة نماذج)';
          else if (value === 'commercial') item.categoryLabel = 'مراكز ومشاريع تجارية (عينة تصاميم)';
          else if (value === 'infrastructure') item.categoryLabel = 'مشاريع مساحية وبنية تحتية (عينة نماذج)';
          else if (value === 'interior') item.categoryLabel = 'المشاريع الداخليه (عينة تصاميم)';
        }
        if (field === 'status') {
          item.statusLabel = value === 'completed' ? 'مثال تصميم استرشادي' : 'دراسة واصدار اشتراطات';
        }
        return item;
      }
      return proj;
    });
    setProjectsList(updated);
    setAutoSaveStatus('typing');

    // Debounce the call to avoid spamming the database with rapid keystrokes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveProjectsToServer(updated, false);
    }, 1000);
  };

  // Image upload and automatic compression for mockup screens
  const handleMockupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerAlert('info', 'جاري فحص وضغط كروكي/صورة التصميم الجديدة للمواصفات المثالية... 🔄');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const compressedBase64 = compressImageToUnderLimit(img, 0.8, 1100, 825);
        if (compressedBase64) {
          updateActiveProjectField('image', compressedBase64);
          triggerAlert('success', 'تم تجميع وتحديث صورة المنتج بنجاح داخل المعرض! 📸✨');
        } else {
          updateActiveProjectField('image', reader.result as string);
          triggerAlert('success', 'تم رفع الصورة بنجاح دون ضغط 📸');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Create a brand new project model
  const handleAddNewProject = () => {
    const uniqId = 'custom-proj-' + Date.now();
    const newProj: Project = {
      id: uniqId,
      title: 'عنوان نموذج تصميم جديد مقترح',
      description: 'وصف تفصيلي يبرز مطابقة الكود والمسح الجيولوجي وتراخيص بلدي المعتمدة للمشروع.',
      category: 'residential',
      categoryLabel: 'فلل وقصور سكنية (عينة نماذج)',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      location: 'القصيم - بريدة',
      area: '١,٢٠٠ م²',
      status: 'completed',
      statusLabel: 'مثال تصميم استرشادي',
      year: 'تجهيز وإعداد مخططات'
    };

    const updated = [newProj, ...projectsList];
    setProjectsList(updated);
    setActiveEditId(uniqId);
    saveProjectsToServer(updated, false);
    triggerAlert('success', 'تم إنشاء نموذج فارغ جديد وتثبيته بالموقع! املأ البيانات وارفع الصورة بالأسفل ➕✏️');
  };

  // Delete a project
  const handleDeleteProject = (idToDelete: string) => {
    if (projectsList.length <= 1) {
      triggerAlert('error', 'يجب الاحتفاظ بنموذج واحد على الأقل لعرضه لزوار موقع العطا للاستشارات الهندسية!');
      return;
    }
    const updated = projectsList.filter(p => p.id !== idToDelete);
    setProjectsList(updated);
    setActiveEditId(updated[0].id);
    saveProjectsToServer(updated, false);
    triggerAlert('success', 'تم شطب النموذج بنجاح وتثبيته كلياً! 🗑️');
  };

  // Reset to static defaults
  const handleResetToDefaults = () => {
    if (confirm('هل أنت متأكد من استعادة كافة تصاميم ومخرجات العطا للاستشارات الهندسية الأصلية وإلغاء التعديلات المخصصة؟')) {
      setProjectsList(projectsData);
      setActiveEditId(projectsData[0].id);
      saveProjectsToServer(projectsData, true);
      triggerAlert('success', 'تمت استعادة تصاميم المعتمدة الذهبية بنجاح 🔄🏛️');
    }
  };

  const filterButtons = [
    { value: 'all', label: 'كل المشاريع' },
    { value: 'gas_station', label: 'محطات الوقود والخدمات' },
    { value: 'residential', label: 'الفلل والقصور الفخمة' },
    { value: 'commercial', label: 'المراكز والمجمعات التجارية' },
    { value: 'interior', label: 'المشاريع الداخليه' },
    { value: 'infrastructure', label: 'الأعمال المساحية والبنية' },
  ];

  const filteredProjects = projectsList.filter((project) => {
    if (filter === 'all') return true;
    return project.category === filter;
  });

  const activeProj = getActiveProjectObj();

  // Pre-supplied sleek preset images list (Unsplash stunning architectural renderings)
  const unsplashPresets = [
    { name: 'فيلا فخمة عصرية', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
    { name: 'مستشفى صحي متطور', url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80' },
    { name: 'محطة وقود لوجستية', url: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=1200&q=80' },
    { name: 'مجمع تجاري وبلازا', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' },
    { name: 'بنية ومساحة طوبوغرافية', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80' }
  ];

  return (
    <section id="projects" className="relative py-28 bg-slate-50 overflow-hidden">
      {/* Visual layout grid accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#001f3f_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold-matte font-bold text-xs uppercase tracking-wider block mb-2 px-3 py-1 bg-gold-matte/10 rounded-full inline-block font-tajawal">
            نماذج فنيّة ومخرجات هندسية استرشادية
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#001f3f] font-tajawal">
            مشاريع نعتز بتصميمها والاشراف عليها
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold-matte to-gold-light mx-auto mt-4 rounded-full"></div>
          <p className="text-gray-500 mt-5 leading-relaxed text-sm sm:text-base font-tajawal">
            نستعرض في هذا المعرض نماذج وعينات عمل استرشادية توضيحية تبرز جودة المخططات والتصاميم والدراسات المساحية التي يتولى كادرنا إعدادها وتجهيزها بالكامل لعملائنا الكرام.
          </p>
        </div>

        {/* Global Toast Banner for Projects System */}
        <AnimatePresence>
          {alertMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="mb-8 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-tajawal text-right shadow-2xl flex items-center space-x-reverse space-x-3 max-w-2xl mx-auto text-xs sm:text-sm"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                alertMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                alertMsg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-sky-500/10 text-sky-400'
              }`}>
                {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-100">{alertMsg.text}</span>
              </div>
              <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================= */}
        {/* NEW UNIQUE CREATIVE ADMIN SHOWROOM DIRECT EDITING DESK */}
        {/* ======================================================= */}
        {isAdminLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 bg-white border-2 border-gold-matte/30 shadow-2xl rounded-3xl p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Visual background accents for workspace */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-matte/5 rounded-full filter blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-100 rounded-full filter blur-2xl pointer-events-none"></div>

            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 mb-8 gap-4">
              <div className="text-right">
                <div className="flex items-center space-x-reverse space-x-2 text-gold-dark mb-1">
                  <Sliders className="w-5 h-5" />
                  <h3 className="text-lg font-black font-tajawal">لوحة الإشراف ومعارض النماذج الذكية</h3>
                </div>
                <p className="text-xs text-slate-500 font-tajawal">
                  عدّل صور المشروعات والبيانات بشكل فني رائع، وشاهد التغييرات حيةً داخل شاشات اللابتوب والآيفون.
                </p>
                <div className="flex flex-wrap items-center space-x-reverse space-x-2 mt-2 gap-y-1">
                  <AnimatePresence mode="wait">
                    {autoSaveStatus === 'typing' && (
                      <motion.span
                        key="typing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center space-x-reverse space-x-1.5 bg-amber-50 text-amber-750 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-tajawal font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                        <span>جاري الكتابة... ✏️</span>
                      </motion.span>
                    )}
                    {autoSaveStatus === 'saving' && (
                      <motion.span
                        key="saving"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center space-x-reverse space-x-1.5 bg-sky-50 text-sky-755 border border-sky-200 px-2 py-0.5 rounded-full text-[10px] font-tajawal font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></span>
                        <span>جاري المزامنة التلقائية... ☁️💾</span>
                      </motion.span>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <motion.span
                        key="saved"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center space-x-reverse space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-250 px-2 py-0.5 rounded-full text-[10px] font-tajawal font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>تم الحفظ والمزامنة السحابية تلقائياً  ✅</span>
                      </motion.span>
                    )}
                    {autoSaveStatus === 'failed' && (
                      <motion.span
                        key="failed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center space-x-reverse space-x-1.5 bg-rose-50 text-rose-750 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-tajawal font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></span>
                        <span>فشل الاتصال؛ تم الحفظ على جهازك مؤقتاً ⚠️</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleAddNewProject}
                  className="flex items-center space-x-reverse space-x-1.5 bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-600/10"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-tajawal">إضافة نموذج جديد ➕</span>
                </button>
                <button
                  onClick={handleResetToDefaults}
                  className="flex items-center space-x-reverse space-x-1.5 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer active:scale-95 border border-slate-200"
                  title="استعادة الافتراضي"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span className="font-tajawal">القيم الافتراضية 🏛️</span>
                </button>
                <button
                  onClick={() => saveProjectsToServer(projectsList, true)}
                  disabled={isSyncing}
                  className="flex items-center space-x-reverse space-x-1.5 bg-[#001f3f] hover:bg-[#002f5f] text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-gold-matte" />
                  <span className="font-tajawal">{isSyncing ? 'جاري المزامنة...' : 'نشر وتثبيت كلي 💾'}</span>
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center space-x-reverse space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 px-3.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-xs font-tajawal"
                  title="تسجيل الخروج من لوحة الإشراف المعتمدة"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>تسجيل الخروج 🚪</span>
                </button>
              </div>
            </div>

            {/* Company Logo Identity Administration Panel */}
            <div className="mb-8 p-5 bg-gradient-to-l from-slate-50 to-white rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-reverse space-x-4 text-right">
                  <div className="relative w-16 h-16 flex items-center justify-center bg-white rounded-xl border border-gold-matte/30 shadow-xs overflow-hidden shrink-0">
                    {companyLogoAdmin ? (
                      <img src={companyLogoAdmin} alt="شعار العطا للاستشارات الهندسية الحالي" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                    ) : (
                      /* Fallback visual: Default A-frame design */
                      <svg
                        className="w-8 h-8 text-gold-matte"
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
                  <div>
                    <h4 className="text-sm font-bold text-[#001f3f] font-tajawal">إدارة هوية وشعار العطا للاستشارات الهندسية 🏆</h4>
                    <p className="text-[11px] text-slate-500 font-tajawal mt-0.5">
                      ارفع صورة شعار مخصصة (مثال: PNG ذو خلفية شفافة أو JPG) ليظهر بجانب اسم المكتب في أعلى الموقع وكافة المكونات المعتمدة.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        
                        triggerAlert('info', 'جاري معالجة وضغط الشعار الجديد للمزامنة الفورية... 🔄');
                        const reader = new FileReader();
                        reader.onload = () => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 450; // Keep optimal dimensions for lightweight transfer
                            const MAX_HEIGHT = 450;
                            let width = img.width;
                            let height = img.height;
                            if (width > height) {
                              if (width > MAX_WIDTH) {
                                height = Math.round((height * MAX_WIDTH) / width);
                                width = MAX_WIDTH;
                              }
                            } else {
                              if (height > MAX_HEIGHT) {
                                width = Math.round((width * MAX_HEIGHT) / height);
                                height = MAX_HEIGHT;
                              }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(img, 0, 0, width, height);
                              const base64Str = canvas.toDataURL('image/png', 0.88);
                              handleSaveNewLogo(base64Str);
                            }
                          };
                          img.src = reader.result as string;
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="flex items-center space-x-reverse space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    <span>رفع شعار جديد للمكتب 📁📸</span>
                  </button>

                  {companyLogoAdmin && (
                    <button
                      onClick={() => handleResetLogo()}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                      title="استعادة المظهر التأسيسي الافتراضي للموقع"
                    >
                      <span className="font-tajawal">حذف مخصص والعودة للافتراضي 🏛️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Split Screen Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Creative Device Screen Mockup Representation (The actual Laptop / Phone frame showcase) */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-6">
                
                {/* Device Selector Segment Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-250 w-full max-w-[280px]">
                  <button
                    onClick={() => setSelectedShowcaseDevice('laptop')}
                    className={`flex-1 flex items-center justify-center space-x-reverse space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 font-tajawal ${
                      selectedShowcaseDevice === 'laptop'
                        ? 'bg-[#001f3f] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>لابتوب ماكبوك</span>
                  </button>
                  <button
                    onClick={() => setSelectedShowcaseDevice('mobile')}
                    className={`flex-1 flex items-center justify-center space-x-reverse space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 font-tajawal ${
                      selectedShowcaseDevice === 'mobile'
                        ? 'bg-[#001f3f] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>آيفون ريتنا</span>
                  </button>
                </div>

                {/* Device Showcase Stage Area */}
                <div className="w-full flex items-center justify-center min-h-[350px] p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 relative group">
                  
                  {activeProj ? (
                    <>
                      {/* 1. LAPTOP MACBOOK MOCKUP */}
                      {selectedShowcaseDevice === 'laptop' ? (
                        <div className="w-full max-w-[380px] sm:max-w-[450px] transition-all duration-500 animate-fade-in relative">
                          {/* Inner Screen casing */}
                          <div className="relative aspect-[16/10] bg-slate-900 rounded-t-2xl border-[5px] border-slate-800 p-1 sm:p-2 shadow-2xl overflow-hidden group/screen cursor-pointer"
                               onClick={() => fileInputRef.current?.click()}>
                            {/* Webcam notch */}
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black rounded-b-md z-30"></div>
                            
                            {/* Glass screen active display */}
                            <div className="relative w-full h-full bg-slate-100 rounded-lg overflow-hidden border border-black/30 flex items-center justify-center">
                              <img
                                src={activeProj.image}
                                alt="عينة اللابتوب"
                                className="w-full h-full object-cover select-none group-hover/screen:scale-105 transition-transform duration-700"
                              />
                              {/* Glowing Overlay with Camera text */}
                              <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover/screen:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-4">
                                <ImageIcon className="w-8 h-8 text-white mb-2 animate-bounce animate-duration-1000" />
                                <span className="text-white text-[11px] font-bold font-tajawal">انقر لتعديل ورفع صورة جديدة للتصميم 📸</span>
                                <span className="text-slate-350 text-[9px] mt-1">تنسيق مثالي ومكتمل للمقاييس</span>
                              </div>

                              {/* Live Mini watermark tag */}
                              <div className="absolute bottom-2 right-2 scale-90 sm:scale-100 text-[9px] px-2 py-0.5 bg-slate-900/90 text-gold-light rounded font-tajawal font-bold z-20 shadow">
                                {activeProj.title}
                              </div>
                            </div>
                          </div>
                          {/* MacBook Keyboard platform bottom */}
                          <div className="relative w-[114%] -right-[7%] h-3 bg-gradient-to-b from-slate-300 via-slate-300 to-slate-400 rounded-b-xl shadow-lg border-t border-slate-200">
                            {/* Open notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-500 rounded-b-md"></div>
                          </div>
                          {/* Shadow bottom */}
                          <div className="w-[94%] mx-auto h-2.5 bg-slate-900/20 filter blur-md rounded-full mt-1.5"></div>
                        </div>
                      ) : (
                        /* 2. SMARTPHONE IPHONE MOCKUP */
                        <div className="w-[190px] sm:w-[210px] aspect-[9/19] bg-slate-900 rounded-[36px] p-2 sm:p-2.5 shadow-2xl border-[4.5px] border-slate-800 transition-all duration-500 animate-fade-in relative cursor-pointer"
                             onClick={() => fileInputRef.current?.click()}>
                          {/* Dynamic Island Notcher */}
                          <div className="absolute top-3 sm:top-3.5 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full border border-slate-900"></div>
                          </div>
                          
                          {/* Internal screen Viewport */}
                          <div className="relative w-full h-full bg-slate-50 rounded-[28px] overflow-hidden border border-slate-950/20 group/mobile flex items-center justify-center">
                            <img
                              src={activeProj.image}
                              alt="عينة الجوال المعتمد"
                              className="w-full h-full object-cover select-none group-hover/mobile:scale-105 transition-transform duration-700"
                            />
                            {/* Blurred text mask */}
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/mobile:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-3">
                              <ImageIcon className="w-5 h-5 text-white mb-1.5 animate-bounce" />
                              <span className="text-white text-[9px] font-bold font-tajawal truncate max-w-full">اضغط لاستبدال الصورة 📸</span>
                            </div>

                            {/* Mobile visual bottom Indicator bar */}
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-14 h-0.5 bg-white rounded-full z-20"></div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-tajawal">الرجاء اختيار نموذج من القائمة لتعديله.</p>
                    </div>
                  )}
                </div>

                {/* Secret Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleMockupImageUpload}
                  className="hidden"
                />

                {/* Preset Fast Unsplash Presets Picker (Uniquely Creative Experience) */}
                {activeProj && (
                  <div className="w-full p-4 bg-slate-100 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block mb-2 text-right font-tajawal">أو حدّد خلفية ممتازة بديلة فوراً:</span>
                    <div className="flex flex-wrap justify-end gap-1.5 direction-rtl">
                      {unsplashPresets.map((pr, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            updateActiveProjectField('image', pr.url);
                            triggerAlert('success', `تم تطبيق تصميم: ${pr.name} المعتمد! 🏛️✨`);
                          }}
                          className="px-2 py-1 bg-white hover:bg-gold-matte/10 hover:text-gold-dark text-slate-700 rounded-lg text-[9px] border border-slate-200 transition-all font-tajawal cursor-pointer active:scale-95"
                        >
                          {pr.name} 🏙️
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Creative Project Editing Form Workspace */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Quick horizontal List of clickable projects to select */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 block text-right font-tajawal">اختر المخرج الفني أو النموذج المراد تعديله:</label>
                  <div className="flex space-x-reverse space-x-2 pb-2 overflow-x-auto w-full scrollbar-thin">
                    {projectsList.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveEditId(p.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold font-tajawal whitespace-nowrap transition-all flex items-center space-x-reverse space-x-1 cursor-pointer shrink-0 border ${
                          activeEditId === p.id
                            ? 'bg-[#001f3f] text-gold-light border-transparent shadow shadow-[#001f3f]/10'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-250/60'
                        }`}
                      >
                        <span className="truncate max-w-[120px]">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loaded Project Input Fields */}
                {activeProj ? (
                  <div className="space-y-4 text-right">
                    
                    {/* Raw layout fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name / Title */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 font-tajawal">اسم المشروع / النموذج الهندسي المعروض :</label>
                        <input
                          type="text"
                          value={activeProj.title}
                          onChange={(e) => updateActiveProjectField('title', e.target.value)}
                          className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs font-tajawal focus:bg-white focus:ring-1 focus:ring-gold-matte/70 outline-none text-right"
                          placeholder="عنوان النموذج المعروض"
                        />
                      </div>

                      {/* Location / City */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 font-tajawal">موقع ونطاق التصميم (المنطقة) :</label>
                        <input
                          type="text"
                          value={activeProj.location}
                          onChange={(e) => updateActiveProjectField('location', e.target.value)}
                          className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs font-tajawal focus:bg-white focus:ring-1 focus:ring-gold-matte/70 outline-none text-right"
                          placeholder="مثال: القصيم - بريدة"
                        />
                      </div>

                      {/* Area size */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 font-tajawal">إجمالي المساحة م² :</label>
                        <input
                          type="text"
                          value={activeProj.area}
                          onChange={(e) => updateActiveProjectField('area', e.target.value)}
                          className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs font-tajawal focus:bg-white focus:ring-1 focus:ring-gold-matte/70 outline-none text-right"
                          placeholder="مثال: ١٨,٢٠٠ م²"
                        />
                      </div>

                      {/* Year or Deliverable Type */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 font-tajawal">طبيعة المخرج / نوعية المخطط الفني :</label>
                        <input
                          type="text"
                          value={activeProj.year}
                          onChange={(e) => updateActiveProjectField('year', e.target.value)}
                          className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs font-tajawal focus:bg-white focus:ring-1 focus:ring-gold-matte/70 outline-none text-right"
                          placeholder="مثال: تجهيز وإعداد مخططات تراخيص"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Category field */}
                      <div className="space-y-1 text-right">
                        <label className="text-[10px] font-bold text-slate-500 font-tajawal">تصنيف وقسم العرض (الفلتر المعتمد) :</label>
                        <select
                          value={activeProj.category}
                          onChange={(e) => updateActiveProjectField('category', e.target.value as any)}
                          className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 text-xs font-tajawal focus:bg-white focus:ring-1 focus:ring-gold-matte/70 outline-none text-right appearance-none"
                        >
                          <option value="gas_station">محطات الوقود والخدمات ⛽</option>
                          <option value="residential">الفلل والقصور الفخمة 🏡</option>
                          <option value="commercial">المراكز والمجمعات التجارية 🏢</option>
                          <option value="interior">المشاريع الداخليه 🛋️</option>
                          <option value="infrastructure">الأعمال المساحية والبنية التحتية 🗺️</option>
                        </select>
                      </div>

                      {/* Status select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 font-tajawal">علامة وحالة تفعيل النموذج :</label>
                        <select
                          value={activeProj.status}
                          onChange={(e) => updateActiveProjectField('status', e.target.value as any)}
                          className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 text-xs font-tajawal focus:bg-white focus:ring-1 focus:ring-gold-matte/70 outline-none text-right cursor-pointer"
                        >
                          <option value="completed">مكتمل ومعتمد (مثال للتصميم الاسترشادي)</option>
                          <option value="ongoing">تحت التجهيز (قيد الدراسة والفرز)</option>
                        </select>
                      </div>

                    </div>

                    {/* Rich description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 font-tajawal">نبذة فنية تفصيلية توضح معالم التصميم والمخطط :</label>
                      <textarea
                        value={activeProj.description}
                        onChange={(e) => updateActiveProjectField('description', e.target.value)}
                        rows={3}
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs font-tajawal focus:bg-white focus:ring-1 focus:ring-gold-matte/70 outline-none text-right leading-relaxed resize-none"
                        placeholder="ما يميز هذا العمل..."
                      ></textarea>
                    </div>

                    {/* Multi-Image Gallery Administration section */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 font-tajawal block text-right">
                        معرض صور وتفاصيل إضافية لهذا النموذج (صور متعددة يتم عرضها للعميل عند النقر) :
                      </label>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200">
                        {(activeProj.images || [activeProj.image]).map((imgStr, index) => (
                          <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-250 group/img bg-white shadow-xs">
                            <img src={imgStr} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center p-1.5 gap-1.5 text-center">
                              <button
                                onClick={() => {
                                  updateActiveProjectField('image', imgStr);
                                  triggerAlert('success', 'تم تعيين كصورة الغلاف والمعاينة الأساسية للمشروع! 🌟');
                                }}
                                className="w-full py-1 bg-gold-matte hover:bg-gold-light text-white text-[9px] font-bold font-tajawal rounded-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                                title="تعيين كغلاف أساسي"
                              >
                                الغلاف ⭐
                              </button>
                              
                              <button
                                onClick={() => {
                                  const currentArr = activeProj.images || [activeProj.image];
                                  if (currentArr.length <= 1) {
                                    triggerAlert('error', 'يجب الاحتفاظ بصورة واحدة على الأقل بالمعرض!');
                                    return;
                                  }
                                  const filtered = currentArr.filter((_, i) => i !== index);
                                  
                                  const updatedProjs = projectsList.map(proj => {
                                    if (proj.id === activeProj.id) {
                                      return {
                                        ...proj,
                                        images: filtered,
                                        image: proj.image === imgStr ? filtered[0] : proj.image
                                      };
                                    }
                                    return proj;
                                  });
                                  setProjectsList(updatedProjs);
                                  saveProjectsToServer(updatedProjs, false);
                                  triggerAlert('success', 'تم حذف الصورة من معرض الفرز! 🗑️');
                                }}
                                className="w-full py-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold font-tajawal rounded-md cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-reverse space-x-1"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>حذف 🗑️</span>
                              </button>
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/75 text-white font-mono text-[8px] px-1 rounded-sm">#{index + 1}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (!file) return;
                              triggerAlert('info', 'جاري فحص وضغط الصورة الإضافية لتسجيلها بشكل ذكي وموازن للمساحة... 🔄');
                              const reader = new FileReader();
                              reader.onload = () => {
                                const img = new Image();
                                img.onload = () => {
                                  const base64Str = compressImageToUnderLimit(img, 0.8, 1000, 750);
                                  if (base64Str) {
                                    const currentImages = activeProj.images || [activeProj.image];
                                    const updatedArr = [...currentImages, base64Str];
                                    
                                    const updatedProjs = projectsList.map(proj => {
                                       if (proj.id === activeProj.id) {
                                         return { ...proj, images: updatedArr };
                                       }
                                       return proj;
                                     });
                                     setProjectsList(updatedProjs);
                                     saveProjectsToServer(updatedProjs, false);
                                     triggerAlert('success', 'تمت إضافة الصورة بنجاح إلى المعرض المتعدد! 📸✨');
                                  } else {
                                    triggerAlert('error', 'فشل ضغط ومعالجة الصورة المرفقة ❌');
                                  }
                                };
                                img.src = reader.result as string;
                              };
                              reader.readAsDataURL(file);
                            };
                            input.click();
                          }}
                          className="flex-1 flex items-center justify-center space-x-reverse space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4 text-emerald-600 font-bold" />
                          <span className="font-tajawal">اضغط لرفع لقطة/كروكي إضافي لهذا التصميم 📁📸</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const sampleList = [
                              'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
                              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                              'https://images.unsplash.com/photo-1542441246-e5b6ac536a22?auto=format&fit=crop&w=1200&q=80',
                              'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
                            ];
                            const randomPic = sampleList[Math.floor(Math.random() * sampleList.length)];
                            const currentImages = activeProj.images || [activeProj.image];
                            if (currentImages.includes(randomPic)) {
                              triggerAlert('info', 'هذه اللقطة مضافة مسبقاً!');
                              return;
                            }
                            const updatedArr = [...currentImages, randomPic];
                             const updatedProjs = projectsList.map(proj => {
                               if (proj.id === activeProj.id) {
                                 return { ...proj, images: updatedArr };
                               }
                               return proj;
                             });
                             setProjectsList(updatedProjs);
                             saveProjectsToServer(updatedProjs, false);
                             triggerAlert('success', 'تم استيراد مظهر هندسي بديل إضافي! 🏡');
                          }}
                          className="flex items-center justify-center space-x-reverse space-x-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-gold-matte" />
                          <span className="font-tajawal text-[11px]">لقطة معمارية عشوائية 🏙️</span>
                        </button>
                      </div>
                    </div>

                    {/* Operational Danger buttons */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <button
                        onClick={() => handleDeleteProject(activeProj.id)}
                        className="flex items-center space-x-reverse space-x-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-650 text-[11px] font-bold rounded-xl transition-all border border-red-200 cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="font-tajawal">حذف هذا المشروع بالكامل 🗑️</span>
                      </button>
                      <span className="text-[10px] text-slate-400 font-tajawal">معرّف النموذج: {activeProj.id}</span>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl">
                    <p className="text-sm text-slate-500 font-tajawal">يرجى الضغط على زر "إضافة نموذج" لإنشاء عنصر جديد وملء بياناته.</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* Filter Navigation Tickers (RTL scrollable on mobile) */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12 sm:mb-16">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value as FilterCategory)}
              className={`px-5 py-2.5 rounded-xl font-tajawal text-sm font-medium transition-all duration-300 pointer-events-auto whitespace-nowrap border ${
                filter === btn.value
                  ? 'bg-gold-matte text-white border-transparent shadow-md shadow-gold-matte/15 scale-102 font-bold'
                  : 'bg-white text-slate-600 hover:text-gold-dark border-slate-200 hover:border-gold-matte/40'
              }`}
            >
              {filter === btn.value && <Check className="w-3.5 h-3.5 inline ml-1 text-white animate-fade-in" />}
              {btn.label}
            </button>
          ))}
        </div>

        {/* Grid Container */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer bg-white rounded-2xl border border-slate-200/60 hover:border-gold-matte/35 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gold-matte/5 flex flex-col justify-between transition-all duration-300"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    referrerPolicy="no-referrer"
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  {/* Category overlay */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-900/95 text-white border border-gold-matte/20 shadow-md">
                      {project.categoryLabel}
                    </span>
                  </div>

                  {/* Status overlay */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-md ${
                        project.status === 'completed'
                          ? 'bg-emerald-600/90'
                          : 'bg-amber-600/95 border border-gold-matte/30'
                      }`}
                    >
                      {project.statusLabel}
                    </span>
                  </div>
                  {/* Subtle hover gradient curtain */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Info and measurements */}
                <div className="p-5 text-right flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-md sm:text-lg font-bold font-tajawal text-[#001f3f] group-hover:text-gold-dark transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Attributes block */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-y-2 justify-between items-center text-xs text-gray-500 font-medium font-sans">
                    <div className="flex items-center space-x-reverse space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-gold-matte shrink-0" />
                      <span className="font-tajawal text-[11px] truncate max-w-[150px]">
                        {project.location}
                      </span>
                    </div>

                    <div className="flex items-center space-x-reverse space-x-1 bg-slate-50 px-2 py-1 rounded">
                      <Ruler className="w-3.5 h-3.5 text-gold-matte shrink-0" />
                      <span className="text-[10px] font-semibold text-slate-700">
                        {project.area}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state visual when search filters yield nothing */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-inner max-w-lg mx-auto">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-tajawal text-md font-medium">لا توجد مشاريع مضافة ضمن هذا التصنيف حالياً.</p>
            <p className="text-slate-400 font-tajawal text-xs mt-1">المكتب يضيف المزيد من المظاهر والفرز تباعاً.</p>
          </div>
        )}
      </div>

      {/* Expanded Project Lightbox Modal */}
      <AnimatePresence>
        {selectedProject && (() => {
          const activeSelectedProject = projectsList.find(p => p.id === selectedProject.id) || selectedProject;
          const modalImages = activeSelectedProject.images && activeSelectedProject.images.length > 0 
            ? activeSelectedProject.images 
            : [activeSelectedProject.image];
          const activeImg = modalImages[activeLightboxImageIndex] || activeSelectedProject.image;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
              {/* Slate blurred overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
                className="fixed inset-0 bg-[#0f172a]/75 backdrop-blur-md z-10"
              ></motion.div>

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="bg-white rounded-[32px] border border-gold-matte/35 shadow-2xl relative w-full max-w-4xl overflow-hidden z-20 flex flex-col my-auto max-h-[96vh]"
              >
                {/* Active Image viewing screen banner (Fully contained to prevent cropping details out on mobile) */}
                <div className="relative h-80 sm:h-[485px] w-full bg-[#080d1a] overflow-hidden flex items-center justify-center group/modalview">
                  <img
                    src={activeImg}
                    alt={activeSelectedProject.title}
                    onClick={() => setIsZoomedOpen(true)}
                    className={`transition-all duration-300 cursor-zoom-in max-w-full max-h-full ${
                      isFullyContained ? 'object-contain' : 'w-full h-full object-cover'
                    }`}
                  />

                  {/* Top Header Floating Controls */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30 select-none">
                    {/* Corner Close Button */}
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="p-2.5 rounded-full bg-slate-900/65 hover:bg-slate-900/90 text-white transition-all cursor-pointer border border-white/10 active:scale-90 shadow-md"
                      aria-label="إغلاق المعاينة"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Left Actions Suite (Contain switch & Zoom preview) */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullyContained(!isFullyContained);
                        }}
                        className="py-1.5 px-3 rounded-full bg-slate-900/65 hover:bg-slate-900/90 text-white transition-all cursor-pointer border border-white/10 active:scale-90 shadow-md flex items-center space-x-reverse space-x-1.5 text-xs font-tajawal"
                        title={isFullyContained ? 'تغيير لتعبئة الكادر' : 'إسترجاع المخطط الأصلي كاملاً'}
                      >
                        <Sliders className="w-3.5 h-3.5 text-gold-matte" />
                        <span className="text-[10px] sm:text-xs">
                          {isFullyContained ? 'كادر العرض كامل 📐' : 'تعبئة وتغطية 📺'}
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsZoomedOpen(true);
                        }}
                        className="p-2 rounded-full bg-gold-matte hover:bg-gold-light text-white transition-all cursor-pointer border border-gold-matte/25 active:scale-90 shadow-md"
                        title="تكبير لرؤية أدق التفاصيل"
                      >
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      </button>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {modalImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImageIndex(prev => (prev - 1 + modalImages.length) % modalImages.length);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white hover:text-gold-light transition-all cursor-pointer z-20 active:scale-90 border border-white/5"
                        title="الصورة السابقة"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImageIndex(prev => (prev + 1) % modalImages.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white hover:text-gold-light transition-all cursor-pointer z-20 active:scale-90 border border-white/5"
                        title="الصورة التالية"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}

                  {/* Gradient shadow backing for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent pointer-events-none z-10"></div>

                  {/* Zoom Assist Tip Overlay */}
                  <div className="absolute bottom-4 right-4 z-20 bg-slate-950/60 backdrop-blur-xs px-2.5 py-1.5 rounded-md text-white text-[10px] sm:text-xs pointer-events-none font-tajawal flex items-center gap-1.5 border border-white/5 shadow">
                    <span>انقر على الكروكي بالمنتصف لتكبيره بالكامل 🔍</span>
                  </div>

                  <div className="absolute bottom-4 left-4 z-20 bg-black/55 backdrop-blur-xs px-2 rounded-sm text-gold-matte text-[10px] font-mono select-none">
                    {activeLightboxImageIndex + 1} / {modalImages.length}
                  </div>
                </div>

                {/* DEDICATED SLIDE-DECK THUMBNAIL BAR UNDER IMAGE BANNER (Completely separates images from text, preventing overlapping) */}
                {modalImages.length > 1 && (
                  <div className="w-full bg-[#111827] px-4 py-3.5 flex items-center justify-center gap-2 overflow-x-auto scrollbar-none border-t border-b border-slate-800 shrink-0">
                    {modalImages.map((imgSrc, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImageIndex(idx);
                        }}
                        className={`w-14 sm:w-[72px] aspect-video rounded-lg overflow-hidden transition-all border-2 shrink-0 cursor-pointer ${
                          activeLightboxImageIndex === idx 
                            ? 'border-gold-matte scale-105 shadow-md shadow-gold-matte/30' 
                            : 'border-slate-800/80 hover:border-slate-600 scale-100 hover:scale-102'
                        }`}
                      >
                        <img src={imgSrc} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Primary responsive details block, scrollable when descriptors are long */}
                <div className="p-5 sm:p-8 text-right overflow-y-auto max-h-[46vh] scrollbar-thin">
                  
                  {/* Distinct Title Header */}
                  <div className="mb-6 pb-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-gold-matte/10 border border-gold-matte/20 rounded-md text-gold-dark inline-block mb-1.5 font-tajawal">
                        {activeSelectedProject.categoryLabel}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black font-tajawal text-[#001f3f] leading-snug">
                        {activeSelectedProject.title}
                      </h3>
                    </div>
                    
                    <div className="flex gap-2 shrink-0 select-none">
                      <span className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100/90 text-slate-800 border border-slate-200 rounded-lg font-tajawal">
                        {activeSelectedProject.year}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white ${
                          activeSelectedProject.status === 'completed'
                            ? 'bg-emerald-600 shadow shadow-emerald-500/10'
                            : 'bg-amber-600 shadow shadow-amber-500/10'
                        }`}
                      >
                        {activeSelectedProject.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Split body: descriptions alongside statistics panel */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    
                    {/* Left details description (take 2 columns) */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-[#001f3f] font-bold text-sm sm:text-base font-tajawal">رؤية معمارية ووصف هندسي تفصيلي:</h4>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-tajawal">
                        {activeSelectedProject.description}
                      </p>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-start space-x-reverse space-x-3">
                        <Sparkles className="w-5 h-5 text-gold-matte shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 font-tajawal leading-relaxed">
                          يمثل هذا المعمار الفني القدرة المكتملة لكامل فريق مكتب العطا الهندسي على تحقيق أعلى مستويات دقة الكروكيات ومطابقة البلدي المعيارية والمساحة والمسح الجيولوجي.
                        </p>
                      </div>
                    </div>

                    {/* Right side logistics box */}
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-150 space-y-4 text-xs font-tajawal font-medium">
                      <h5 className="text-[#001f3f] font-black text-xs border-b border-slate-200 pb-2">تفاصيل ومواصفات النموذج :</h5>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">منطقة النموذج:</span>
                        <div className="flex items-center space-x-reverse space-x-1 font-bold text-[#001f3f]">
                          <MapPin className="w-3.5 h-3.5 text-gold-matte" />
                          <span>{activeSelectedProject.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">إجمالي مقاييس المساحة:</span>
                        <div className="flex items-center space-x-reverse space-x-1 font-[#001f3f] font-sans font-bold text-sm">
                          <Ruler className="w-3.5 h-3.5 text-gold-matte" />
                          <span>{activeSelectedProject.area}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">مخرجات التصميم:</span>
                        <div className="flex items-center space-x-reverse space-x-1 font-bold text-[#001f3f]">
                          <Calendar className="w-3.5 h-3.5 text-gold-matte" />
                          <span>{activeSelectedProject.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Consultation Call to Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onOpenConsultationWithProject(activeSelectedProject.title);
                        setSelectedProject(null);
                      }}
                      className="flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-gold-matte to-gold-light hover:from-gold-light hover:to-gold-matte hover:shadow-lg transition-all cursor-pointer active:scale-98 text-center font-tajawal"
                    >
                      استفسر عن مشروع مماثل أو احجز كروكي استشاري 💬🏛️
                    </button>
                    
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-650 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-250 transition-all cursor-pointer active:scale-98 font-tajawal"
                    >
                      الرجوع لمعارض المشروعات
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ============================================================= */}
              {/* BRAND NEW EXPUB-ZOOM HIGH RESOLUTION FULLSCREEN PORTRAIT POPUP */}
              {/* ============================================================= */}
              <AnimatePresence>
                {isZoomedOpen && (
                  <div className="fixed inset-0 z-55 flex flex-col items-center justify-center bg-black/95 p-3 sm:p-5 select-none animate-fade-in">
                    {/* Dark backing click allows full screen back-out */}
                    <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsZoomedOpen(false)}></div>

                    {/* Left and Right arrows inside full-screen popup as well */}
                    {modalImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxImageIndex(prev => (prev - 1 + modalImages.length) % modalImages.length);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/11 text-white hover:text-gold-light transition-all cursor-pointer z-30 active:scale-90"
                          title="الصورة السابقة"
                        >
                          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxImageIndex(prev => (prev + 1) % modalImages.length);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/11 text-white hover:text-gold-light transition-all cursor-pointer z-30 active:scale-90"
                          title="الصورة التالية"
                        >
                          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                        </button>
                      </>
                    )}

                    {/* Top Action line */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40 select-none">
                      <span className="text-white text-xs font-tajawal bg-black/45 px-3 py-1.5 rounded-md border border-white/10">
                        كروكي رقم {activeLightboxImageIndex + 1} من {modalImages.length}
                      </span>
                      <button
                        onClick={() => setIsZoomedOpen(false)}
                        className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shadow border border-white/5"
                        title="خروج من التكبير"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Fully sharp blueprint contain layout representation */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      className="relative max-w-full max-h-[85vh] flex items-center justify-center z-10"
                    >
                      <img
                        src={activeImg}
                        alt="تكبير التصميم"
                        className="max-h-[85vh] max-w-full object-contain cursor-zoom-out select-none border border-white/5 shadow-2xl rounded-lg"
                        onClick={() => setIsZoomedOpen(false)}
                      />
                    </motion.div>

                    <p className="absolute bottom-4 text-center font-tajawal text-slate-400 text-xs z-20">
                      اضغط على الصورة أو أي مكان شاغر للرجوع ومواصلة التصفح 🏛️🔍
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
