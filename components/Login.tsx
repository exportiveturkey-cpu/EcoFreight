import React, { useState, useEffect } from 'react';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Sparkles, Building2, Award, Copy, Check, Info, Languages } from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '../services/firebase';
import { Language, translations } from '../services/i18n';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  lang?: Language;
  onLangChange?: (lang: Language) => void;
}

export const createDemoProfile = (type: 'jury' | 'client') => {
  if (type === 'jury') {
    return {
      uid: 'demo-nbg-seeds-jury-14d',
      email: 'jury.evaluator@nbgseeds.demo',
      displayName: 'NBG Seeds Jury & Evaluator',
      isDemo: true,
      demoType: 'jury',
      isReadOnly: false,
      role: 'evaluator',
      daysRemaining: 14,
      totalDays: 14,
      membershipExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
  } else {
    return {
      uid: 'demo-client-preview-3d',
      email: 'client.preview@ecofreight.eu',
      displayName: 'Corporate Client Preview',
      isDemo: true,
      demoType: 'client',
      isReadOnly: true,
      role: 'client_readonly',
      daysRemaining: 3,
      totalDays: 3,
      membershipExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess, lang: initialLang = 'en', onLangChange }) => {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ecofreight_lang') as Language;
    if (saved === 'el' || saved === 'tr' || saved === 'en') return saved;
    return initialLang;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<'jury' | 'client' | null>(null);

  const t = translations[currentLang] || translations.en;

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLang(newLang);
    localStorage.setItem('ecofreight_lang', newLang);
    if (onLangChange) onLangChange(newLang);
  };

  // Auto-login if ?demo=client or ?demo=jury is in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const demoParam = params.get('demo') || params.get('mode');
      const langParam = params.get('lang');
      if (langParam === 'el' || langParam === 'gr') handleLanguageChange('el');
      else if (langParam === 'tr') handleLanguageChange('tr');
      else if (langParam === 'en') handleLanguageChange('en');

      if (demoParam === 'client') {
        handleDemoSelect('client');
      } else if (demoParam === 'jury' || demoParam === 'evaluator') {
        handleDemoSelect('jury');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleDemoSelect = (type: 'jury' | 'client') => {
    const profile = createDemoProfile(type);
    try {
      localStorage.setItem('ecofreight_demo_user', JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    onLoginSuccess(profile);
  };

  const copyShareLink = (type: 'jury' | 'client') => {
    const url = new URL(window.location.href);
    url.searchParams.set('demo', type);
    if (currentLang !== 'en') url.searchParams.set('lang', currentLang);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLink(type);
      setTimeout(() => setCopiedLink(null), 2500);
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-configured quick demo emails shortcut (works with or without Firebase Auth)
    const trimmedEmail = email.trim().toLowerCase();
    if (
      trimmedEmail === 'jury@nbgseeds.demo' ||
      trimmedEmail === 'jury@nbgseeds.dem' ||
      trimmedEmail === 'evaluator@nbgseeds.demo' ||
      trimmedEmail.includes('nbgseeds')
    ) {
      handleDemoSelect('jury');
      setLoading(false);
      return;
    }
    if (
      trimmedEmail === 'client@ecofreight.eu' ||
      trimmedEmail === 'demo@client.com' ||
      trimmedEmail === 'client.preview@ecofreight.eu'
    ) {
      handleDemoSelect('client');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess(userCredential.user);
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError(
          currentLang === 'el'
            ? 'Εσφαλμένο email ή κωδικός πρόσβασης. Παρακαλώ ελέγξτε τα στοιχεία σας.'
            : currentLang === 'tr'
              ? 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.'
              : 'Invalid email address or password. Please verify your credentials.'
        );
      } else if (code === 'auth/user-disabled') {
        setError(
          currentLang === 'el'
            ? 'Αυτός ο λογαριασμός χρήστη έχει απενεργοποιηθεί.'
            : currentLang === 'tr'
              ? 'Bu kullanıcı hesabı devre dışı bırakılmış.'
              : 'This user account has been disabled.'
        );
      } else if (code === 'auth/too-many-requests') {
        setError(
          currentLang === 'el'
            ? 'Πάρα πολλές αποτυχημένες προσπάθειες. Παρακαλώ περιμένετε.'
            : currentLang === 'tr'
              ? 'Çok fazla başarısız giriş denemesi yapıldı. Lütfen bekleyin.'
              : 'Too many unsuccessful attempts. Please try again shortly.'
        );
      } else {
        setError(err.message || (
          currentLang === 'el'
            ? 'Παρουσιάστηκε σφάλμα κατά τη σύνδεση.'
            : currentLang === 'tr'
              ? 'Giriş yapılırken bir hata oluştu.'
              : 'An error occurred during authentication.'
        ));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-xl z-10 animate-in fade-in zoom-in duration-500 py-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
          {/* Top header with Language Switcher */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                EcoFreight System v2.4
              </span>
            </div>

            {/* Language Selection Buttons */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentLang === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('el')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentLang === 'el'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🇬🇷 ΕΛ
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('tr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentLang === 'tr'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🇹🇷 TR
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="bg-emerald-500 p-4 rounded-3xl mb-3 shadow-lg shadow-emerald-500/20">
              <Leaf className="text-white w-9 h-9" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">EcoFreight</h1>
            <p className="text-slate-400 mt-1 text-xs font-semibold uppercase tracking-widest text-center">
              Sustainability & Decarbonization Intelligence
            </p>
          </div>

          {/* Demonstration Accounts Section */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={14} /> {t.quickDemoAccess}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{t.instantAccess}</span>
            </div>

            {/* Option 1: 14-Day NBG Seeds Competition Jury Access */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {t.juryCardTitle}
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        14 {t.days}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">{t.juryCardDesc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyShareLink('jury')}
                  className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-white/5 transition-all text-xs flex items-center gap-1"
                  title={currentLang === 'el' ? 'Αντιγραφή συνδέσμου κριτή' : 'Copy jury link'}
                >
                  {copiedLink === 'jury' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleDemoSelect('jury')}
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-between text-xs group active:scale-98"
              >
                <span>{t.startJury}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Option 2: 3-Day Potential Client Read-Only Demo */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-sky-500/10 to-teal-500/15 border border-blue-500/30 hover:border-blue-500/50 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {t.clientCardTitle}
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white">
                        3 {t.days} • {t.readOnly}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">{t.clientCardDesc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyShareLink('client')}
                  className="text-slate-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-white/5 transition-all text-xs flex items-center gap-1"
                  title={currentLang === 'el' ? 'Αντιγραφή συνδέσμου πελάτη' : 'Copy client link'}
                >
                  {copiedLink === 'client' ? <Check size={14} className="text-blue-400" /> : <Copy size={14} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleDemoSelect('client')}
                className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-blue-400/30 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-between text-xs group active:scale-98"
              >
                <span>{t.startClient}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {copiedLink && (
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-[11px] bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20 animate-in fade-in">
                <Check size={12} />
                <span>{t.linkCopied}</span>
              </div>
            )}
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              {t.orCorporate}
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-2.5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl text-xs font-medium border border-red-400/20">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-white font-bold py-3 rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 text-xs group"
            >
              {loading ? (
                <span>...</span>
              ) : (
                <>
                  <span>{t.signInBtn}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>TLS 1.3 • Firebase Auth Verified</span>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-[11px] mt-4">
          EcoFreight Logistics Intelligence • NBG Seeds Cohort
        </p>
      </div>
    </div>
  );
};

export default Login;
