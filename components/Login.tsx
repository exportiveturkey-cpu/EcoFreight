import React, { useState, useEffect } from 'react';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Ship, Truck } from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '../services/firebase';
import { Language, translations } from '../services/i18n';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  lang?: Language;
  onLangChange?: (lang: Language) => void;
}

export type DemoType = 'jury' | 'client' | 'demo';

export const createDemoProfile = (type: DemoType) => {
  if (type === 'demo') {
    return {
      uid: 'demo-account',
      email: 'demo@ecofreight.eu',
      displayName: 'EcoFreight Demo',
      isDemo: true,
      demoType: 'demo',
      isReadOnly: false,
      role: 'demo',
      daysRemaining: 30,
      totalDays: 30,
      membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
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

      if (demoParam === 'demo' || demoParam === '1') {
        handleDemoSelect('demo');
      } else if (demoParam === 'client') {
        handleDemoSelect('client');
      } else if (demoParam === 'jury' || demoParam === 'evaluator') {
        handleDemoSelect('jury');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleDemoSelect = (type: DemoType) => {
    const profile = createDemoProfile(type);
    try {
      localStorage.setItem('ecofreight_demo_user', JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    onLoginSuccess(profile);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
    <div className="min-h-[100dvh] bg-[#080e14] flex flex-col md:flex-row overflow-hidden">
      {/* ── Left hero panel: Maritime ── */}
      <div className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-end pb-16 px-12 select-none pointer-events-none">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, #0a2a1a 0%, #062018 40%, #031410 70%, #080e14 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 75%, rgba(16,185,129,0.22) 0%, transparent 65%)' }} />
        {/* Scan lines */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)' }} />
        {/* Right edge divider */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-5 inline-flex">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
              <Ship className="text-emerald-300 w-7 h-7" />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60">Vertical 01</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
            {t.verticalMaritime || 'Maritime'}
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-[220px]">
            {t.verticalMaritimeDesc || 'Emissions, ETS compliance & green corridor routing'}
          </p>
        </div>
      </div>

      {/* ── Right hero panel: Road ── */}
      <div className="hidden md:flex md:w-[calc(55%-420px)] relative overflow-hidden flex-col justify-end pb-16 px-10 select-none pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, #0a1525 0%, #071020 40%, #040d1a 70%, #080e14 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 70% 75%, rgba(59,130,246,0.18) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)' }} />

        <div className="relative z-10">
          <div className="mb-5 inline-flex">
            <div className="p-3.5 rounded-2xl bg-blue-500/15 border border-blue-500/30">
              <Truck className="text-blue-300 w-7 h-7" />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60">Vertical 02</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
            {t.verticalRoad || 'Road'}
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
            {t.verticalRoadDesc || 'Fleet carbon, CSRD reporting & route optimization'}
          </p>
        </div>
      </div>

      {/* ── Auth card ── */}
      <div className="flex-1 md:w-[420px] md:min-w-[420px] md:max-w-[420px] flex flex-col items-center justify-center relative z-10 px-6 py-10 bg-[#080e14] md:border-l md:border-white/[0.06]">
        {/* Top: logo + lang */}
        <div className="w-full max-w-sm flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/30">
              <Leaf className="text-white w-4 h-4" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">EcoFreight</span>
          </div>
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {(['en', 'el', 'tr'] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLanguageChange(l)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                  currentLang === l
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {l === 'en' ? '🇬🇧 EN' : l === 'el' ? '🇬🇷 ΕΛ' : '🇹🇷 TR'}
              </button>
            ))}
          </div>
        </div>

        {/* Card body */}
        <div className="w-full max-w-sm">
          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">
              {currentLang === 'el' ? 'Σύνδεση' : currentLang === 'tr' ? 'Giriş Yap' : 'Sign in'}
            </h1>
            <p className="text-slate-500 text-xs">
              {currentLang === 'el'
                ? 'Sustainability & Decarbonization Intelligence'
                : currentLang === 'tr'
                ? 'Sürdürülebilirlik ve Dekarbonizasyon'
                : 'Sustainability & Decarbonization Intelligence'}
            </p>
          </div>

          {/* Demo CTA */}
          <button
            type="button"
            onClick={() => handleDemoSelect('demo')}
            className="w-full mb-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-black py-3.5 px-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-between group"
          >
            <span className="flex items-center gap-2 text-left">
              <Sparkles size={16} />
              <span>
                <span className="block text-sm">{t.tryDemo}</span>
                <span className="block text-[10px] font-medium text-emerald-100/80">{t.tryDemoDesc}</span>
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Divider */}
          <div className="relative flex items-center mb-5">
            <div className="flex-grow border-t border-white/[0.08]" />
            <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
              {t.orCorporate}
            </span>
            <div className="flex-grow border-t border-white/[0.08]" />
          </div>

          {/* Sign-in form */}
          <form onSubmit={handleLogin} className="space-y-2.5">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input
                type="password"
                placeholder={t.passwordPlaceholder}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl text-xs font-medium border border-red-400/20">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-white/[0.06] hover:bg-white/[0.09] active:scale-[0.98] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all border border-white/[0.08] flex items-center justify-center gap-2 text-sm group"
            >
              {loading ? (
                <span className="opacity-60">...</span>
              ) : (
                <>
                  <span>{t.signInBtn}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Mobile: vertical badges */}
          <div className="flex md:hidden gap-3 mt-8">
            <div className="flex-1 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <Ship className="text-emerald-400 w-4 h-4 shrink-0" />
              <span className="text-emerald-300 text-[11px] font-bold">{t.verticalMaritime || 'Maritime'}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
              <Truck className="text-blue-400 w-4 h-4 shrink-0" />
              <span className="text-blue-300 text-[11px] font-bold">{t.verticalRoad || 'Road'}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-700 text-[10px] mt-10">EcoFreight Logistics Intelligence</p>
      </div>
    </div>
  );
};

export default Login;
