import React, { useState, useEffect } from 'react';
import { Student, Instructor } from '../types';

/* ─── Types ──────────────────────────────────────── */
type AuthView = 'landing' | 'login' | 'register' | 'forgot' | 'otp' | 'admin-setup';
type Role = 'student' | 'instructor' | 'admin';

interface AuthProps {
  students: Student[];
  instructors: Instructor[];
  onLogin: (user: { id: string; name: string; role: Role }) => void;
  onRegister: (data: { role: string; userData: Record<string, string> }) => void;
  siteName?: string;
  siteLogo?: string;
  adminCode?: string;
  adminEmail?: string;
  adminPassword?: string;
}

/* ─── Sub-components ─────────────────────────────── */
function Field({ label, type = 'text', placeholder, value, onChange, error, ltr }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  error?: string; ltr?: boolean;
}) {
  return (
    <div>
      <label style={{ display:'block', fontSize:'0.82rem', fontWeight:600, color:'var(--gray-700)', marginBottom:5 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        dir={ltr ? 'ltr' : 'rtl'}
        style={{
          width:'100%', padding:'9px 12px',
          border: error ? '1px solid var(--red-600)' : '1px solid var(--gray-300)',
          borderRadius:8, fontFamily:'inherit', fontSize:'0.9rem',
          color:'var(--gray-900)', background:'var(--white)',
          outline:'none', transition:'border-color .15s',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--navy-400)'; e.target.style.boxShadow = '0 0 0 3px var(--navy-50)'; }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--red-600)' : 'var(--gray-300)'; e.target.style.boxShadow = 'none'; }}
      />
      {error && <p style={{ color:'var(--red-600)', fontSize:'0.75rem', marginTop:4 }}>{error}</p>}
    </div>
  );
}

function Btn({ children, onClick, type = 'button', color = 'navy', loading, fullWidth }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button'|'submit';
  color?: 'navy'|'orange'|'ghost'; loading?: boolean; fullWidth?: boolean;
}) {
  const bg = color === 'navy' ? 'var(--navy-700)' : color === 'orange' ? 'var(--orange-500)' : 'var(--white)';
  const fg = color === 'ghost' ? 'var(--gray-600)' : 'white';
  const border = color === 'ghost' ? '1px solid var(--gray-300)' : 'none';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding:'10px 20px',
        background: loading ? 'var(--gray-300)' : bg,
        color: fg, border, borderRadius:8,
        fontSize:'0.88rem', fontWeight:700,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily:'inherit',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'opacity .15s',
      }}
    >
      {loading && (
        <span className="spin" style={{ width:15, height:15, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }} />
      )}
      {children}
    </button>
  );
}

function RoleTabs({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ key: string; label: string }>;
}) {
  return (
    <div style={{ display:'flex', background:'var(--gray-100)', borderRadius:8, padding:3, gap:2, marginBottom:22 }}>
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          style={{
            flex:1, padding:'8px 0', borderRadius:6, border:'none',
            cursor:'pointer', fontFamily:'inherit', fontSize:'0.82rem', fontWeight:700,
            background: value === opt.key ? 'var(--white)' : 'transparent',
            color: value === opt.key ? 'var(--navy-700)' : 'var(--gray-400)',
            boxShadow: value === opt.key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            transition:'all .15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
const Auth: React.FC<AuthProps> = ({
  students, instructors, onLogin, onRegister,
  siteName = 'أكاديمية المعرفة',
  adminCode = 'ADMIN2025',
  adminEmail = 'admin@academy.com',
  adminPassword = 'admin',
}) => {
  const [view, setView]     = useState<AuthView>('landing');
  const [role, setRole]     = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState<{ msg: string; type: string } | null>(null);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpCode, setOtpCode] = useState(['','','','','','']);
  const [pwStrength, setPwStrength] = useState(0);

  // Form fields
  const [fEmail, setFEmail] = useState('');
  const [fPassword, setFPassword] = useState('');
  const [fAdminCode, setFAdminCode] = useState('');
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fGender, setFGender] = useState('ذكر');
  const [fSpecialty, setFSpecialty] = useState('');
  const [fBio, setFBio] = useState('');
  const [fConfirm, setFConfirm] = useState('');
  const [fUsername, setFUsername] = useState('');

  // Errors
  const [eEmail, setEEmail] = useState('');
  const [ePassword, setEPassword] = useState('');
  const [eName, setEName] = useState('');
  const [eAdminCode, setEAdminCode] = useState('');
  const [eConfirm, setEConfirm] = useState('');

  const clearErrors = () => { setEEmail(''); setEPassword(''); setEName(''); setEAdminCode(''); setEConfirm(''); };

  const flash = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const score =
      (fPassword.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(fPassword) ? 1 : 0) +
      (/[0-9]/.test(fPassword) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(fPassword) ? 1 : 0) +
      (fPassword.length >= 12 ? 1 : 0);
    setPwStrength(score);
  }, [fPassword]);

  useEffect(() => {
    if (view !== 'otp') return;
    const t = setInterval(() => setOtpTimer(n => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [view]);

  /* ── Login handler ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    let hasErr = false;
    if (!fEmail) { setEEmail('هذا الحقل مطلوب'); hasErr = true; }
    if (role !== 'student' && !fPassword) { setEPassword('أدخل كلمة المرور'); hasErr = true; }
    if (hasErr) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    if (role === 'admin') {
      if (fEmail === adminEmail && fPassword === adminPassword && fAdminCode === adminCode) {
        onLogin({ id: 'admin-1', name: 'المدير العام', role: 'admin' });
      } else {
        setEEmail('بيانات المدير غير صحيحة');
      }
      setLoading(false);
      return;
    }

    if (role === 'instructor') {
      const inp = fEmail.toLowerCase().trim();
      const inst = instructors.find(i => i.email?.toLowerCase() === inp || i.phone === inp);
      if (inst) {
        if (inst.password && fPassword && inst.password !== fPassword) { setEPassword('كلمة المرور غير صحيحة'); setLoading(false); return; }
        onLogin({ id: inst.id, name: inst.name, role: 'instructor' });
      } else {
        setEEmail('المدرس غير موجود');
      }
      setLoading(false);
      return;
    }

    // student
    const inp = fEmail.toLowerCase().trim();
    const st = students.find(s => s.email?.toLowerCase() === inp || s.phone === inp || s.name.toLowerCase().includes(inp));
    if (st) {
      if (st.password && fPassword && st.password !== fPassword) { setEPassword('كلمة المرور غير صحيحة'); setLoading(false); return; }
      onLogin({ id: st.id, name: st.name, role: 'student' });
    } else {
      setEEmail('المستخدم غير موجود — تأكد من البيانات');
    }
    setLoading(false);
  };

  /* ── Register handler ── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    let hasErr = false;
    if (!fName) { setEName('الاسم مطلوب'); hasErr = true; }
    if (!fEmail) { setEEmail('البريد مطلوب'); hasErr = true; }
    if (!fPassword || fPassword.length < 6) { setEPassword('6 أحرف على الأقل'); hasErr = true; }
    if (fPassword !== fConfirm) { setEConfirm('كلمة المرور غير متطابقة'); hasErr = true; }
    if (hasErr) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const newId = 'reg_' + Date.now();
    const userData: Record<string, string> = {
      id: newId, name: fName, email: fEmail, phone: fPhone,
      password: fPassword, username: fUsername,
      gender: fGender, specialty: fSpecialty, bio: fBio,
    };
    onRegister({ role, userData });
    onLogin({ id: newId, name: fName, role });
    setLoading(false);
  };

  /* ── Admin setup handler ── */
  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (fAdminCode !== adminCode) { setEAdminCode('كود المدير غير صحيح'); return; }
    if (!fName) { setEName('الاسم مطلوب'); return; }
    if (!fEmail) { setEEmail('البريد مطلوب'); return; }
    if (fPassword !== fConfirm) { setEConfirm('كلمة المرور غير متطابقة'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    onLogin({ id: 'admin-1', name: fName, role: 'admin' });
    setLoading(false);
  };

  /* ── Social login ── */
  const handleSocial = (provider: string) => {
    const names: Record<string,string> = { google: 'مستخدم Google', facebook: 'مستخدم Facebook', apple: 'مستخدم Apple' };
    const newId = 'social_' + Date.now();
    onRegister({ role: 'student', userData: { id: newId, name: names[provider] || provider, email: provider + '@social.com', phone: '', password: '' } });
    onLogin({ id: newId, name: names[provider] || provider, role: 'student' });
  };

  /* ── Shared nav bar ── */
  const NavBar = ({ rightSlot }: { rightSlot?: React.ReactNode }) => (
    <nav style={{ background:'var(--navy-800)', padding:'0 28px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, background:'var(--orange-500)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg style={{ width:17, height:17, color:'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
          </svg>
        </div>
        <span style={{ color:'white', fontWeight:800, fontSize:'0.95rem' }}>{siteName}</span>
      </div>
      {rightSlot}
    </nav>
  );

  /* ── Brand panel (desktop left column) ── */
  const BrandPanel = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="auth-brand-panel" style={{ width:'42%', background:'linear-gradient(160deg,var(--navy-800) 0%,var(--navy-900) 100%)', flexDirection:'column', justifyContent:'center', padding:'60px 48px', position:'relative', overflow:'hidden', minHeight:'100vh' }}>
      <div style={{ position:'absolute', top:-80, left:-80, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,.03)' }} />
      <div style={{ position:'absolute', bottom:50, right:-50, width:200, height:200, borderRadius:'50%', border:'1px solid rgba(255,255,255,.05)' }} />
      <div style={{ position:'relative' }}>
        <div style={{ display:'inline-block', background:'var(--orange-500)', color:'white', fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:4, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:18 }}>
          منصة تعليمية متكاملة
        </div>
        <h2 style={{ color:'white', fontSize:'2rem', fontWeight:800, lineHeight:1.3, marginBottom:10 }}>{title}</h2>
        <p style={{ color:'rgba(255,255,255,.5)', fontSize:'0.88rem', lineHeight:1.7, marginBottom:32 }}>{subtitle}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {['شهادات معتمدة وقابلة للتحقق', 'فصول مباشرة تفاعلية', 'مساعد ذكاء اصطناعي 24/7', 'تقارير تفصيلية للأداء'].map(t => (
            <div key={t} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'rgba(255,255,255,.06)', borderRadius:8 }}>
              <div style={{ width:17, height:17, background:'var(--orange-500)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg style={{ width:9, height:9, color:'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span style={{ color:'rgba(255,255,255,.72)', fontSize:'0.84rem' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════
     LANDING PAGE
  ═══════════════════════════════════ */
  if (view === 'landing') {
    return (
      <div dir="rtl" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--gray-50)' }}>
        <NavBar rightSlot={
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => { setView('login'); clearErrors(); }}
              style={{ padding:'6px 16px', background:'transparent', border:'1px solid rgba(255,255,255,.25)', borderRadius:6, color:'rgba(255,255,255,.8)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              تسجيل الدخول
            </button>
            <button onClick={() => { setView('register'); clearErrors(); }}
              style={{ padding:'6px 16px', background:'var(--orange-500)', border:'none', borderRadius:6, color:'white', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              إنشاء حساب
            </button>
          </div>
        } />

        <div style={{ display:'flex', flex:1 }}>
          {/* Left: navy hero */}
          <div style={{ width:'45%', background:'linear-gradient(160deg,var(--navy-800) 0%,var(--navy-900) 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 48px', position:'relative', overflow:'hidden', minHeight:500 }}>
            <div style={{ position:'absolute', top:-60, left:-60, width:250, height:250, borderRadius:'50%', background:'rgba(255,255,255,.03)' }} />
            <div style={{ position:'relative' }}>
              <div style={{ display:'inline-block', background:'var(--orange-500)', color:'white', fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:4, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:18 }}>
                منظومة تعليمية متكاملة
              </div>
              <h1 style={{ color:'white', fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:800, lineHeight:1.25, marginBottom:14 }}>
                إدارة أكاديميتك<br />
                <span style={{ color:'var(--orange-400)' }}>بكفاءة واحتراف</span>
              </h1>
              <p style={{ color:'rgba(255,255,255,.55)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:28, maxWidth:360 }}>
                منصة إدارة تعليمية شاملة للطلاب والمدرسين والمحتوى — مصممة للسوق المصري والعربي.
              </p>
              <div style={{ display:'flex', gap:24, marginBottom:32 }}>
                {[['5,000+','طالب مسجل'],['200+','كورس'],['98%','رضا العملاء']].map(item => (
                  <div key={item[1]}>
                    <div style={{ color:'var(--orange-400)', fontWeight:800, fontSize:'1.3rem' }}>{item[0]}</div>
                    <div style={{ color:'rgba(255,255,255,.4)', fontSize:'0.72rem', marginTop:2 }}>{item[1]}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => { setView('register'); clearErrors(); }}
                  style={{ padding:'10px 22px', background:'var(--orange-500)', border:'none', borderRadius:6, color:'white', fontSize:'0.88rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  ابدأ مجاناً
                </button>
                <button onClick={() => setView('admin-setup')}
                  style={{ padding:'10px 22px', background:'transparent', border:'1px solid rgba(255,255,255,.2)', borderRadius:6, color:'rgba(255,255,255,.7)', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  إعداد المدير
                </button>
              </div>
            </div>
          </div>

          {/* Right: quick login */}
          <div style={{ flex:1, background:'var(--white)', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 40px' }}>
            <div style={{ width:'100%', maxWidth:380 }}>
              <h2 style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--gray-900)', marginBottom:4 }}>تسجيل الدخول</h2>
              <p style={{ color:'var(--gray-500)', fontSize:'0.84rem', marginBottom:22 }}>أدخل بياناتك للوصول إلى لوحة التحكم</p>

              <RoleTabs value={role} onChange={v => setRole(v as Role)}
                options={[{key:'student',label:'طالب'},{key:'instructor',label:'مدرس'},{key:'admin',label:'مدير'}]} />

              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <Field label={role === 'student' ? 'البريد / الرقم' : 'البريد الإلكتروني'} value={fEmail} onChange={setFEmail} error={eEmail} ltr placeholder="أدخل بياناتك" />
                <Field label="كلمة المرور" type="password" value={fPassword} onChange={setFPassword} error={ePassword} ltr placeholder="••••••••" />
                {role === 'admin' && <Field label="كود المدير" type="password" value={fAdminCode} onChange={setFAdminCode} error={eAdminCode} ltr placeholder="••••••••" />}
                <Btn type="submit" color="navy" loading={loading} fullWidth>تسجيل الدخول</Btn>
              </form>

              <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid var(--gray-200)', display:'flex', justifyContent:'center', gap:14, fontSize:'0.82rem' }}>
                <button onClick={() => { setView('register'); clearErrors(); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--navy-600)', fontWeight:600, fontFamily:'inherit' }}>إنشاء حساب</button>
                <span style={{ color:'var(--gray-300)' }}>|</span>
                <button onClick={() => setView('forgot')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', fontFamily:'inherit' }}>نسيت كلمة المرور؟</button>
              </div>

              <div style={{ display:'flex', gap:10, marginTop:24, paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>
                {['SIS','LMS','SMS'].map(tag => (
                  <div key={tag} style={{ flex:1, textAlign:'center' }}>
                    <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--navy-600)', background:'var(--navy-50)', padding:'2px 6px', borderRadius:4, display:'inline-block', marginBottom:3 }}>{tag}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer style={{ background:'var(--navy-900)', color:'rgba(255,255,255,.3)', padding:'10px 32px', fontSize:'0.72rem', display:'flex', justifyContent:'space-between' }}>
          <span>© 2025 {siteName} — جميع الحقوق محفوظة</span>
          <span>E-Learning Engine v3.0</span>
        </footer>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    );
  }

  /* ═══════════════════════════════════
     ADMIN SETUP
  ═══════════════════════════════════ */
  if (view === 'admin-setup') {
    return (
      <div dir="rtl" style={{ minHeight:'100vh', background:'var(--gray-100)', display:'flex', flexDirection:'column' }}>
        <NavBar />
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ background:'var(--white)', borderRadius:12, border:'1px solid var(--gray-200)', width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'var(--shadow-md)' }}>
            <div style={{ background:'var(--navy-800)', padding:'20px 24px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, background:'var(--orange-500)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg style={{ width:20, height:20, color:'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 style={{ color:'white', fontWeight:800, fontSize:'1rem' }}>إعداد حساب المدير</h2>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'0.75rem', marginTop:1 }}>أدخل كود المدير لإنشاء الحساب</p>
              </div>
            </div>
            <div style={{ padding:'22px 24px' }}>
              <div style={{ background:'var(--amber-100)', border:'1px solid var(--amber-600)', borderRadius:7, padding:'9px 12px', marginBottom:18, fontSize:'0.8rem', color:'var(--amber-600)', fontWeight:600, display:'flex', alignItems:'center', gap:7 }}>
                <svg style={{ width:15, height:15, flexShrink:0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                أدخل كود المدير الخاص بك للوصول
              </div>
              <form onSubmit={handleAdminSetup} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <Field label="كود المدير" type="password" value={fAdminCode} onChange={setFAdminCode} error={eAdminCode} ltr placeholder="••••••••" />
                <Field label="الاسم الكامل" value={fName} onChange={setFName} error={eName} placeholder="اسم المدير" />
                <Field label="البريد الإلكتروني" type="email" value={fEmail} onChange={setFEmail} error={eEmail} ltr placeholder="admin@academy.com" />
                <Field label="كلمة المرور" type="password" value={fPassword} onChange={setFPassword} error={ePassword} ltr placeholder="6 أحرف على الأقل" />
                <Field label="تأكيد كلمة المرور" type="password" value={fConfirm} onChange={setFConfirm} error={eConfirm} ltr placeholder="أعد الكتابة" />
                {fPassword && <PwStrengthBar strength={pwStrength} />}
                <Btn type="submit" color="orange" loading={loading} fullWidth>إنشاء حساب المدير</Btn>
              </form>
              <button onClick={() => setView('landing')} style={{ width:'100%', marginTop:10, background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', fontSize:'0.8rem', fontFamily:'inherit', padding:8 }}>
                ← العودة
              </button>
            </div>
          </div>
        </div>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    );
  }

  /* ═══════════════════════════════════
     AUTH FORMS (login / register / forgot / otp)
  ═══════════════════════════════════ */
  return (
    <div dir="rtl" style={{ minHeight:'100vh', display:'flex' }}>
      <BrandPanel
        title={view === 'login' ? 'مرحباً بعودتك' : view === 'register' ? 'انضم إلينا اليوم' : 'استرجاع الحساب'}
        subtitle="منصة تعليمية شاملة للإدارة والتدريس والتعلم — مصممة للأكاديميات العربية."
      />

      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--white)' }}>
        {/* mini-nav */}
        <div style={{ padding:'12px 28px', borderBottom:'1px solid var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => setView('landing')} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', fontSize:'0.8rem', fontFamily:'inherit' }}>
            ← الرئيسية
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, background:'var(--orange-500)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg style={{ width:13, height:13, color:'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <span style={{ fontWeight:800, color:'var(--gray-800)', fontSize:'0.88rem' }}>{siteName}</span>
          </div>
          <div style={{ fontSize:'0.8rem' }}>
            {view === 'login' && (
              <span style={{ color:'var(--gray-500)' }}>ليس لديك حساب؟{' '}
                <button onClick={() => { setView('register'); clearErrors(); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--navy-600)', fontWeight:700, fontFamily:'inherit' }}>سجّل</button>
              </span>
            )}
            {view === 'register' && (
              <span style={{ color:'var(--gray-500)' }}>لديك حساب؟{' '}
                <button onClick={() => { setView('login'); clearErrors(); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--navy-600)', fontWeight:700, fontFamily:'inherit' }}>ادخل</button>
              </span>
            )}
          </div>
        </div>

        {/* form area */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 28px', overflowY:'auto' }}>
          <div style={{ width:'100%', maxWidth:410 }}>

            {/* LOGIN */}
            {view === 'login' && (
              <div>
                <h1 style={{ fontSize:'1.55rem', fontWeight:800, color:'var(--gray-900)', marginBottom:4 }}>تسجيل الدخول</h1>
                <p style={{ color:'var(--gray-500)', fontSize:'0.84rem', marginBottom:22 }}>أدخل بياناتك للوصول إلى حسابك</p>
                <RoleTabs value={role} onChange={v => setRole(v as Role)}
                  options={[{key:'student',label:'طالب'},{key:'instructor',label:'مدرس'},{key:'admin',label:'مدير'}]} />
                <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:15 }}>
                  <Field label={role === 'student' ? 'البريد / الرقم / الاسم' : 'البريد الإلكتروني'} value={fEmail} onChange={setFEmail} error={eEmail} ltr placeholder="أدخل بياناتك" />
                  <Field label="كلمة المرور" type="password" value={fPassword} onChange={setFPassword} error={ePassword} ltr placeholder="••••••••" />
                  {role === 'admin' && <Field label="كود المدير" type="password" value={fAdminCode} onChange={setFAdminCode} error={eAdminCode} ltr placeholder="••••••••" />}
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button type="button" onClick={() => setView('forgot')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--navy-600)', fontSize:'0.78rem', fontFamily:'inherit' }}>نسيت كلمة المرور؟</button>
                  </div>
                  <Btn type="submit" color="navy" loading={loading} fullWidth>تسجيل الدخول</Btn>
                </form>
                {role === 'student' && (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0', color:'var(--gray-400)', fontSize:'0.78rem' }}>
                      <div style={{ flex:1, height:1, background:'var(--gray-200)' }} /><span>أو الدخول بواسطة</span><div style={{ flex:1, height:1, background:'var(--gray-200)' }} />
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      {['Google','Facebook','Apple'].map(p => (
                        <button key={p} onClick={() => handleSocial(p.toLowerCase())}
                          style={{ flex:1, padding:'8px 0', border:'1px solid var(--gray-200)', borderRadius:7, background:'var(--white)', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, color:'var(--gray-700)', fontFamily:'inherit' }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* REGISTER */}
            {view === 'register' && (
              <div>
                <h1 style={{ fontSize:'1.45rem', fontWeight:800, color:'var(--gray-900)', marginBottom:4 }}>إنشاء حساب</h1>
                <p style={{ color:'var(--gray-500)', fontSize:'0.84rem', marginBottom:20 }}>اختر نوع الحساب وأدخل بياناتك</p>
                <RoleTabs value={role} onChange={v => setRole(v as Role)}
                  options={[{key:'student',label:'طالب'},{key:'instructor',label:'مدرس'}]} />
                <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  <Field label="الاسم الكامل" value={fName} onChange={setFName} error={eName} placeholder="أدخل اسمك الكامل" />
                  <Field label="البريد الإلكتروني" type="email" value={fEmail} onChange={setFEmail} error={eEmail} ltr placeholder="example@email.com" />
                  <Field label="رقم الهاتف" type="tel" value={fPhone} onChange={setFPhone} ltr placeholder="01XXXXXXXXX" />
                  <Field label="اسم المستخدم" value={fUsername} onChange={setFUsername} ltr placeholder="اختر اسم مستخدم" />
                  {role === 'student' && (
                    <div>
                      <label style={{ display:'block', fontSize:'0.82rem', fontWeight:600, color:'var(--gray-700)', marginBottom:5 }}>الجنس</label>
                      <select value={fGender} onChange={e => setFGender(e.target.value)}
                        style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--gray-300)', borderRadius:8, fontFamily:'inherit', fontSize:'0.9rem', color:'var(--gray-900)', background:'var(--white)' }}>
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>
                  )}
                  {role === 'instructor' && (
                    <>
                      <Field label="التخصص" value={fSpecialty} onChange={setFSpecialty} placeholder="مثال: تصميم جرافيك" />
                      <Field label="نبذة مختصرة" value={fBio} onChange={setFBio} placeholder="اكتب نبذة عنك" />
                    </>
                  )}
                  <Field label="كلمة المرور" type="password" value={fPassword} onChange={setFPassword} error={ePassword} ltr placeholder="6 أحرف على الأقل" />
                  <Field label="تأكيد كلمة المرور" type="password" value={fConfirm} onChange={setFConfirm} error={eConfirm} ltr placeholder="أعد الكتابة" />
                  {fPassword && <PwStrengthBar strength={pwStrength} />}
                  <Btn type="submit" color="orange" loading={loading} fullWidth>إنشاء الحساب</Btn>
                </form>
              </div>
            )}

            {/* FORGOT */}
            {view === 'forgot' && (
              <div>
                <h1 style={{ fontSize:'1.45rem', fontWeight:800, color:'var(--gray-900)', marginBottom:4 }}>نسيت كلمة المرور؟</h1>
                <p style={{ color:'var(--gray-500)', fontSize:'0.84rem', marginBottom:22 }}>أدخل بريدك وسنرسل رابط الاسترجاع</p>
                <div style={{ marginBottom:16 }}>
                  <Field label="البريد الإلكتروني" type="email" value={fEmail} onChange={setFEmail} error={eEmail} ltr placeholder="example@email.com" />
                </div>
                <Btn color="navy" loading={loading} fullWidth onClick={() => {
                  if (!fEmail) { setEEmail('أدخل البريد الإلكتروني'); return; }
                  flash('تم إرسال رابط الاسترجاع', 'success');
                  setView('login');
                }}>إرسال رابط الاسترجاع</Btn>
                <button onClick={() => setView('login')} style={{ width:'100%', marginTop:10, background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', fontSize:'0.8rem', fontFamily:'inherit', padding:8 }}>
                  ← العودة لتسجيل الدخول
                </button>
              </div>
            )}

            {/* OTP */}
            {view === 'otp' && (
              <div style={{ textAlign:'center' }}>
                <div style={{ width:60, height:60, background:'var(--navy-50)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                  <svg style={{ width:26, height:26, color:'var(--navy-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h1 style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--gray-900)', marginBottom:6 }}>تحقق من بريدك</h1>
                <p style={{ color:'var(--gray-500)', fontSize:'0.84rem', marginBottom:26 }}>أرسلنا الكود إلى <strong>{fEmail}</strong></p>
                <OtpInput value={otpCode} onChange={setOtpCode} />
                <Btn color="navy" loading={loading} fullWidth onClick={async () => {
                  if (otpCode.join('').length < 6) return;
                  setLoading(true);
                  await new Promise(r => setTimeout(r, 800));
                  flash('تم التحقق بنجاح', 'success');
                  setView('login');
                  setLoading(false);
                }}>تأكيد الكود</Btn>
                <p style={{ fontSize:'0.8rem', color:'var(--gray-500)', marginTop:12 }}>
                  {otpTimer > 0 ? <>إعادة الإرسال خلال <strong style={{ color:'var(--navy-600)' }}>{otpTimer}s</strong></> : (
                    <button onClick={() => { setOtpTimer(60); flash('تمت إعادة الإرسال', 'info'); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--navy-600)', fontWeight:700, fontFamily:'inherit' }}>إعادة الإرسال</button>
                  )}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

/* ─── Helper components ──────────────────────────── */
function PwStrengthBar({ strength }: { strength: number }) {
  const colors = ['','var(--red-600)','var(--red-600)','var(--amber-600)','var(--green-600)','var(--green-600)'];
  const labels = ['','ضعيف جداً','ضعيف','متوسط','جيد','قوي جداً'];
  return (
    <div>
      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height:4, flex:1, borderRadius:2, background: i <= strength ? colors[strength] : 'var(--gray-200)', transition:'background .2s' }} />
        ))}
      </div>
      <p style={{ fontSize:'0.73rem', fontWeight:600, color: colors[strength] }}>{labels[strength]}</p>
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center', direction:'ltr', marginBottom:22 }}>
      {value.map((d, i) => (
        <input
          key={i}
          id={'otp-' + i}
          type="text"
          maxLength={1}
          value={d}
          onChange={e => {
            const v = [...value];
            v[i] = e.target.value.slice(-1);
            onChange(v);
            if (e.target.value) {
              const next = document.getElementById('otp-' + (i + 1));
              if (next) (next as HTMLInputElement).focus();
            }
          }}
          className="otp-box"
          style={{ width:46, height:52, textAlign:'center', fontSize:'1.2rem', fontWeight:700, border:'1.5px solid var(--gray-300)', borderRadius:8, background:'var(--white)', fontFamily:'inherit' }}
        />
      ))}
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: string }) {
  const bg = type === 'success' ? 'var(--green-600)' : type === 'error' ? 'var(--red-600)' : 'var(--navy-600)';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'i';
  return (
    <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:200, padding:'10px 20px', borderRadius:8, color:'white', fontSize:'0.84rem', fontWeight:700, display:'flex', alignItems:'center', gap:8, boxShadow:'var(--shadow-lg)', background:bg, whiteSpace:'nowrap' }}>
      {icon} {msg}
    </div>
  );
}

export default Auth;
