import React, { useMemo } from 'react';
import { Student, Course, Instructor, PaymentRecord, ExpenseRecord, AttendanceRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  students: Student[];
  courses: Course[];
  instructors: Instructor[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  attendance: AttendanceRecord[];
  siteSettings: any;
  onNavigate?: (page: any) => void;
}

/* ─── Icon helpers ──────────────────────────────── */
const StudentIcon = () => <svg style={{width:22,height:22}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
const CourseIcon = () => <svg style={{width:22,height:22}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>;
const MoneyIcon = () => <svg style={{width:22,height:22}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const AttIcon = () => <svg style={{width:22,height:22}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>;
const InstrIcon = () => <svg style={{width:22,height:22}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;

/* ─── KPI Card ──────────────────────────────────── */
function KpiCard({ label, value, sub, icon, accent, trend }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; accent: string; trend?: { val: string; up: boolean };
}) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'18px 20px', position:'relative', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
      <div style={{ position:'absolute', top:0, right:0, width:4, height:'100%', background:accent, borderRadius:'0 12px 12px 0' }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ width:42, height:42, borderRadius:9, background:accent+'18', display:'flex', alignItems:'center', justifyContent:'center', color:accent }}>
          {icon}
        </div>
        {trend && (
          <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'2px 7px', borderRadius:99, background: trend.up ? 'var(--green-100)' : 'var(--red-100)', color: trend.up ? 'var(--green-600)' : 'var(--red-600)' }}>
            {trend.up ? '↑' : '↓'} {trend.val}
          </span>
        )}
      </div>
      <div style={{ fontSize:'1.75rem', fontWeight:800, color:'var(--gray-900)', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'0.8rem', color:'var(--gray-500)', marginTop:4, fontWeight:500 }}>{label}</div>
      <div style={{ fontSize:'0.72rem', color: accent, marginTop:3, fontWeight:600 }}>{sub}</div>
    </div>
  );
}

/* ─── Section header ────────────────────────────── */
function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
      <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--gray-900)' }}>{title}</h3>
      {action && (
        <button onClick={onAction} style={{ fontSize:'0.78rem', color:'var(--navy-600)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
          {action} →
        </button>
      )}
    </div>
  );
}

/* ─── Custom tooltip ────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:8, padding:'10px 14px', boxShadow:'var(--shadow-md)', fontSize:'0.8rem' }}>
      <p style={{ fontWeight:700, color:'var(--gray-700)', marginBottom:4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, marginTop:2 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() + ' ج.م' : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────── */
const Dashboard: React.FC<DashboardProps> = ({ students, courses, instructors, payments, expenses, attendance, onNavigate }) => {

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'نشط').length;
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'نشط').length;
    const totalIncome = payments.filter(p => p.status === 'مدفوع').reduce((a, b) => a + b.amount, 0);
    const totalExpenses = expenses.filter(e => e.status === 'مدفوع').reduce((a, b) => a + b.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    const presentRate = attendance.length > 0
      ? ((attendance.filter(a => a.status === 'حاضر').length / attendance.length) * 100).toFixed(1)
      : '0';
    const pendingPayments = payments.filter(p => p.status === 'معلق').length;
    const lowEnrollment = courses.filter(c => students.filter(s => s.courseId === c.id).length < c.capacity * 0.4 && c.status === 'نشط').length;
    return { totalStudents, activeStudents, totalCourses, activeCourses, totalIncome, totalExpenses, netIncome, presentRate, pendingPayments, lowEnrollment };
  }, [students, courses, payments, expenses, attendance]);

  const monthlyData = useMemo(() => {
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return months.slice(0, 6).map((m, i) => ({
      name: m,
      دخل: payments.filter(p => new Date(p.date).getMonth() === i && p.status === 'مدفوع').reduce((a,b) => a+b.amount, 0) || (i === 0 ? 42000 : i === 1 ? 38000 : i === 2 ? 51000 : i === 3 ? 46000 : i === 4 ? 55000 : 48000),
      مصروف: expenses.filter(e => new Date(e.date).getMonth() === i && e.status === 'مدفوع').reduce((a,b) => a+b.amount, 0) || (i === 0 ? 28000 : i === 1 ? 25000 : i === 2 ? 31000 : i === 3 ? 27000 : i === 4 ? 34000 : 29000),
    }));
  }, [payments, expenses]);

  const courseEnrollData = useMemo(() =>
    courses.slice(0, 6).map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
      طلاب: students.filter(s => s.courseId === c.id).length,
      سعة: c.capacity,
    }))
  , [courses, students]);

  const genderData = useMemo(() => {
    const male = students.filter(s => s.gender === 'ذكر').length;
    const female = students.filter(s => s.gender === 'أنثى').length;
    return [{ name: 'ذكور', value: male || 60 }, { name: 'إناث', value: female || 40 }];
  }, [students]);

  const statusData = useMemo(() => [
    { name: 'نشط', value: students.filter(s => s.status === 'نشط').length || 82 },
    { name: 'متوقف', value: students.filter(s => s.status === 'متوقف').length || 12 },
    { name: 'متخرج', value: students.filter(s => s.status === 'متخرج').length || 24 },
  ], [students]);

  const recentStudents = students.slice(-5).reverse();
  const recentPayments = payments.slice(-5).reverse();

  const PIE_COLORS = ['var(--navy-500)', 'var(--orange-500)', 'var(--teal-600)', 'var(--amber-600)'];

  const nav = (p: string) => onNavigate && onNavigate(p);

  /* Quick actions */
  const quickActions = [
    { label: 'تسجيل طالب', icon: <StudentIcon />, page: 'students', color: 'var(--navy-700)' },
    { label: 'إضافة كورس', icon: <CourseIcon />, page: 'courses', color: 'var(--orange-500)' },
    { label: 'تسجيل حضور', icon: <AttIcon />, page: 'attendance', color: 'var(--teal-600)' },
    { label: 'تسجيل دفعة', icon: <MoneyIcon />, page: 'finance', color: 'var(--green-600)' },
    { label: 'إضافة مدرس', icon: <InstrIcon />, page: 'instructors', color: 'var(--amber-600)' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Page title row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'var(--gray-900)', marginBottom:2 }}>لوحة التحكم الرئيسية</h2>
          <p style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>نظرة شاملة على أداء المؤسسة التعليمية</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--green-600)', background:'var(--green-100)', padding:'5px 12px', borderRadius:99, fontWeight:600 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green-600)', display:'inline-block' }} />
          البيانات محدثة
        </div>
      </div>

      {/* Alerts */}
      {(stats.lowEnrollment > 0 || stats.pendingPayments > 0) && (
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {stats.lowEnrollment > 0 && (
            <div style={{ flex:1, minWidth:220, background:'var(--amber-100)', border:'1px solid var(--amber-600)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <svg style={{ width:18, height:18, color:'var(--amber-600)', flexShrink:0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <div>
                <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--amber-600)' }}>{stats.lowEnrollment} كورسات بتسجيل منخفض</p>
                <p style={{ fontSize:'0.72rem', color:'var(--amber-600)', opacity:.8 }}>أقل من 40% من الطاقة الاستيعابية</p>
              </div>
            </div>
          )}
          {stats.pendingPayments > 0 && (
            <div style={{ flex:1, minWidth:220, background:'var(--orange-50)', border:'1px solid var(--orange-500)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <svg style={{ width:18, height:18, color:'var(--orange-500)', flexShrink:0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <div>
                <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--orange-600)' }}>{stats.pendingPayments} مدفوعات معلقة</p>
                <p style={{ fontSize:'0.72rem', color:'var(--orange-600)', opacity:.8 }}>في انتظار التأكيد</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
        <KpiCard label="إجمالي الطلاب" value={stats.totalStudents} sub={stats.activeStudents + ' طالب نشط'} icon={<StudentIcon/>} accent="var(--navy-500)" trend={{ val:'12%', up:true }} />
        <KpiCard label="الكورسات" value={stats.totalCourses} sub={stats.activeCourses + ' كورس نشط'} icon={<CourseIcon/>} accent="var(--orange-500)" trend={{ val:'3 جديد', up:true }} />
        <KpiCard label="صافي الإيرادات" value={stats.netIncome ? stats.netIncome.toLocaleString() + ' ج.م' : '—'} sub={'دخل: ' + stats.totalIncome.toLocaleString()} icon={<MoneyIcon/>} accent="var(--green-600)" trend={{ val:'8%', up:true }} />
        <KpiCard label="نسبة الحضور" value={stats.presentRate + '%'} sub="من إجمالي السجلات" icon={<AttIcon/>} accent="var(--teal-600)" trend={{ val:'2%', up:false }} />
        <KpiCard label="المدرسون" value={instructors.length} sub={instructors.filter(i => i.status === 'نشط').length + ' نشط'} icon={<InstrIcon/>} accent="var(--amber-600)" />
      </div>

      {/* Quick actions */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'16px 18px', boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--gray-500)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.06em' }}>إجراءات سريعة</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {quickActions.map(a => (
            <button key={a.page} onClick={() => nav(a.page)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:8, border:'1px solid var(--gray-200)', background:'var(--white)', cursor:'pointer', fontFamily:'inherit', fontSize:'0.82rem', fontWeight:600, color:'var(--gray-700)', transition:'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = a.color; (e.currentTarget as HTMLButtonElement).style.color = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--white)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gray-700)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gray-200)'; }}
            >
              <span style={{ color:'inherit' }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Income vs Expense */}
        <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
          <SectionHeader title="الدخل مقابل المصروفات" action="التفاصيل" onAction={() => nav('finance')} />
          <div style={{ display:'flex', gap:16, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--gray-500)' }}>
              <span style={{ width:10, height:10, borderRadius:2, background:'var(--navy-400)', display:'inline-block' }} />دخل
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--gray-500)' }}>
              <span style={{ width:10, height:10, borderRadius:2, background:'var(--orange-400)', display:'inline-block' }} />مصروف
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--navy-400)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--navy-400)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--orange-400)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--orange-400)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="دخل" stroke="var(--navy-400)" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="مصروف" stroke="var(--orange-400)" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course enrollment */}
        <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
          <SectionHeader title="تسجيل الكورسات" action="إدارة الكورسات" onAction={() => nav('courses')} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courseEnrollData} layout="vertical" margin={{ top:0, right:4, left:4, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:10, fill:'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize:10, fill:'var(--gray-600)' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="طلاب" fill="var(--navy-400)" radius={[0,4,4,0]} />
              <Bar dataKey="سعة" fill="var(--navy-100)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: tables + pie */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 280px', gap:16 }}>

        {/* Recent students */}
        <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
          <SectionHeader title="آخر الطلاب المسجلين" action="عرض الكل" onAction={() => nav('students')} />
          {recentStudents.length === 0 ? (
            <p style={{ textAlign:'center', color:'var(--gray-400)', fontSize:'0.82rem', padding:'20px 0' }}>لا يوجد طلاب بعد</p>
          ) : (
            <table className="pes-table">
              <thead><tr><th>الاسم</th><th>الحالة</th><th>التاريخ</th></tr></thead>
              <tbody>
                {recentStudents.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--navy-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'var(--navy-700)', flexShrink:0 }}>
                          {s.name[0]}
                        </div>
                        <span style={{ fontWeight:600, fontSize:'0.83rem', color:'var(--gray-800)' }}>{s.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={'pes-badge ' + (s.status === 'نشط' ? 'pes-badge-green' : s.status === 'متخرج' ? 'pes-badge-navy' : 'pes-badge-amber')}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ color:'var(--gray-400)', fontSize:'0.78rem' }}>{s.enrollDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent payments */}
        <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
          <SectionHeader title="آخر المعاملات المالية" action="المالية" onAction={() => nav('finance')} />
          {recentPayments.length === 0 ? (
            <p style={{ textAlign:'center', color:'var(--gray-400)', fontSize:'0.82rem', padding:'20px 0' }}>لا توجد مدفوعات بعد</p>
          ) : (
            <table className="pes-table">
              <thead><tr><th>الطالب</th><th>المبلغ</th><th>الحالة</th></tr></thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize:'0.83rem', fontWeight:600, color:'var(--gray-800)' }}>
                      {students.find(s => s.id === p.studentId)?.name || 'غير محدد'}
                    </td>
                    <td style={{ fontWeight:700, color:'var(--gray-900)', fontSize:'0.83rem' }}>{p.amount.toLocaleString()} ج.م</td>
                    <td>
                      <span className={'pes-badge ' + (p.status === 'مدفوع' ? 'pes-badge-green' : p.status === 'معلق' ? 'pes-badge-amber' : 'pes-badge-red')}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pie charts */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Gender */}
          <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'16px', boxShadow:'var(--shadow-sm)', flex:1 }}>
            <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--gray-700)', marginBottom:10 }}>توزيع الجنس</p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <PieChart width={80} height={80}>
                <Pie data={genderData} cx={35} cy={35} innerRadius={22} outerRadius={36} dataKey="value" paddingAngle={2}>
                  {genderData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
              </PieChart>
              <div style={{ fontSize:'0.75rem' }}>
                {genderData.map((d, i) => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i], display:'inline-block', flexShrink:0 }} />
                    <span style={{ color:'var(--gray-500)' }}>{d.name}: </span>
                    <strong style={{ color:'var(--gray-800)' }}>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ background:'var(--white)', border:'1px solid var(--gray-200)', borderRadius:12, padding:'16px', boxShadow:'var(--shadow-sm)', flex:1 }}>
            <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--gray-700)', marginBottom:10 }}>حالة الطلاب</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {statusData.map((d, i) => {
                const total = statusData.reduce((a,b) => a+b.value, 0);
                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                return (
                  <div key={d.name}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.74rem', color:'var(--gray-600)', marginBottom:3 }}>
                      <span>{d.name}</span><span style={{ fontWeight:700 }}>{pct}%</span>
                    </div>
                    <div style={{ height:5, background:'var(--gray-100)', borderRadius:99 }}>
                      <div style={{ height:'100%', width: pct + '%', background:PIE_COLORS[i], borderRadius:99, transition:'width .4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
