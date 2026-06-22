import React, { useState, useMemo } from 'react';
import { Student, Course, GradeRecord, AttendanceRecord, Certificate, Lesson } from '../types';

interface ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: number; }

interface StudentProfileProps {
  student: Student;
  courses: Course[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  certificates: Certificate[];
  lessons: Lesson[];
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onUpdateStudent: (student: Student) => void;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  student, courses, grades, attendance, certificates, lessons, chatMessages, onSendMessage, onUpdateStudent, onNavigate, onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'grades' | 'attendance' | 'chat' | 'settings'>('home');
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [formData, setFormData] = useState({ name: student.name, email: student.email, phone: student.phone, address: student.address, dateOfBirth: student.dateOfBirth });
  const [toast, setToast] = useState('');

  const myCourses = useMemo(() => {
    const ids = student.enrolledCourses || (student.courseId ? [student.courseId] : []);
    return courses.filter(c => ids.includes(c.id));
  }, [courses, student]);

  const myGrades = useMemo(() => grades.filter(g => g.studentId === student.id), [grades, student.id]);
  const myAttendance = useMemo(() => attendance.filter(a => a.studentId === student.id), [attendance, student.id]);
  const myCerts = useMemo(() => certificates.filter(c => c.studentId === student.id), [certificates, student.id]);

  const avg = useMemo(() => myGrades.length ? (myGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / myGrades.length).toFixed(1) : '0', [myGrades]);
  const attRate = useMemo(() => myAttendance.length ? ((myAttendance.filter(a => a.status === 'حاضر').length / myAttendance.length) * 100).toFixed(0) : '0', [myAttendance]);
  const totalLessons = useMemo(() => myCourses.reduce((a, c) => a + lessons.filter(l => l.courseId === c.id).length, 0), [myCourses, lessons]);
  const completedLessons = useMemo(() => myCourses.reduce((a, c) => a + lessons.filter(l => l.courseId === c.id && !l.isLocked).length, 0), [myCourses, lessons]);

  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const show = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const getGradeLabel = (pct: number) => pct >= 85 ? 'ممتاز' : pct >= 70 ? 'جيد جداً' : pct >= 60 ? 'جيد' : pct >= 50 ? 'مقبول' : 'راسب';
  const getGradeColor = (pct: number) => pct >= 85 ? 'text-emerald-600 bg-emerald-50' : pct >= 70 ? 'text-blue-600 bg-blue-50' : pct >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  const tabs = [
    { key: 'home', label: 'الرئيسية', icon: '🏠' },
    { key: 'courses', label: 'كورساتي', icon: '📚' },
    { key: 'grades', label: 'الدرجات', icon: '📝' },
    { key: 'attendance', label: 'الحضور', icon: '✅' },
    { key: 'chat', label: 'المعلم الذكي', icon: '🤖' },
    { key: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl">☰</button>
            <span className="text-xl">🎓</span>
            <span className="font-black text-slate-800 hidden sm:block">لوحة الطالب</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer" onClick={() => setActiveTab('settings')}>
                {student.name.charAt(0)}
              </div>
            </div>
            <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-xl transition-colors">خروج</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-0 lg:gap-6 p-4 lg:p-6">
        {/* Sidebar - Mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Left Sidebar */}
        <aside className={`fixed lg:sticky top-14 lg:top-20 right-0 h-[calc(100vh-56px)] w-64 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto z-50 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex-shrink-0`}>
          {/* Profile Mini */}
          <div className="p-5 text-center border-b border-slate-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-lg shadow-blue-500/20">{student.name.charAt(0)}</div>
            <h3 className="font-bold text-slate-800">{student.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs text-emerald-600 font-medium">{student.status}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 p-3">
            {[
              [`${myCourses.length}`, 'كورس'],
              [`${avg}%`, 'المعدل'],
              [`${attRate}%`, 'الحضور'],
              [`${myCerts.length}`, 'شهادة'],
            ].map(([v, l], i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800">{v}</p>
                <p className="text-[10px] text-slate-500 font-medium">{l}</p>
              </div>
            ))}
          </div>

          {/* Nav */}
          <nav className="p-2 space-y-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="text-lg">{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* HOME */}
          {activeTab === 'home' && (
            <>
              {/* Welcome Banner */}
              <div className="bg-gradient-to-l from-blue-600 via-violet-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-black mb-2">مرحباً {student.name.split(' ')[0]}! 👋</h2>
                  <p className="text-white/80 mb-4">تابع تقدمك واستمر في رحلة التعلم</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveTab('courses')} className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-white/90">تابع التعلم</button>
                    <button onClick={() => onNavigate('marketplace')} className="px-5 py-2.5 bg-white/20 backdrop-blur-sm font-bold rounded-xl text-sm hover:bg-white/30">تصفح الكورسات</button>
                  </div>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center col-span-1">
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <svg className="w-28 h-28 -rotate-90">
                      <circle cx="56" cy="56" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle cx="56" cy="56" r="50" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${progress * 3.14 * 2} ${(100 - progress) * 3.14 * 2}`} />
                      <defs><linearGradient id="grad"><stop stopColor="#3B82F6" /><stop offset="1" stopColor="#8B5CF6" /></linearGradient></defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-800">{progress}%</span>
                    </div>
                  </div>
                  <p className="font-bold text-slate-700">التقدم العام</p>
                  <p className="text-xs text-slate-400 mt-1">{completedLessons}/{totalLessons} درس</p>
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { label: 'المعدل', value: `${avg}%`, icon: '🎯', sub: getGradeLabel(Number(avg)), color: 'from-blue-500 to-blue-700' },
                    { label: 'الحضور', value: `${attRate}%`, icon: '📋', sub: `${myAttendance.filter(a => a.status === 'حاضر').length} يوم`, color: 'from-emerald-500 to-emerald-700' },
                    { label: 'الشهادات', value: myCerts.length, icon: '🎓', sub: 'شهادة معتمدة', color: 'from-violet-500 to-violet-700' },
                    { label: 'الكورسات', value: myCourses.length, icon: '📚', sub: 'كورس نشط', color: 'from-amber-500 to-amber-700' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-lg shadow-lg`}>{s.icon}</div>
                        <span className="text-2xl font-black text-slate-800">{s.value}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{s.label}</p>
                      <p className="text-xs text-slate-400">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Learning */}
              {myCourses.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">📚 واصل التعلم</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myCourses.slice(0, 4).map(c => {
                      const cLessons = lessons.filter(l => l.courseId === c.id);
                      const cProg = cLessons.length > 0 ? Math.round((cLessons.filter(l => !l.isLocked).length / cLessons.length) * 100) : 0;
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ backgroundColor: c.color }}>{c.code}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">{c.name}</p>
                            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                              <div className="h-2 rounded-full transition-all" style={{ width: `${cProg}%`, backgroundColor: c.color }} />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-slate-500">{cProg}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">📚 كورساتي ({myCourses.length})</h2>
              {myCourses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
                  <p className="text-5xl mb-3">📚</p>
                  <p className="font-bold text-slate-700 mb-2">ليس لديك كورسات بعد</p>
                  <button onClick={() => onNavigate('marketplace')} className="mt-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700">تصفح المتجر</button>
                </div>
              ) : myCourses.map(c => {
                const cLessons = lessons.filter(l => l.courseId === c.id);
                const cProg = cLessons.length > 0 ? Math.round((cLessons.filter(l => !l.isLocked).length / cLessons.length) * 100) : 0;
                const inst = courses.find(co => co.id === c.id);
                return (
                  <div key={c.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-2" style={{ backgroundColor: c.color }} />
                    <div className="p-6 flex flex-col md:flex-row gap-5">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg" style={{ backgroundColor: c.color }}>{c.code}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800">{c.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                          <span>⏱️ {c.duration} أسبوع</span>
                          <span>📖 {cLessons.length} درس</span>
                          <span>👨‍🏫 {inst?.code}</span>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">التقدم</span><span className="font-bold">{cProg}%</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div className="h-2.5 rounded-full transition-all" style={{ width: `${cProg}%`, backgroundColor: c.color }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* GRADES */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">📝 درجاتي</h2>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الامتحان</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الكورس</th>
                        <th className="px-4 py-3 text-center font-bold text-slate-600">الدرجة</th>
                        <th className="px-4 py-3 text-center font-bold text-slate-600">التقدير</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myGrades.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-12 text-slate-400">لا توجد درجات بعد</td></tr>
                      ) : myGrades.map(g => {
                        const pct = (g.score / g.maxScore) * 100;
                        const crs = courses.find(c => c.id === g.courseId);
                        return (
                          <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-bold">{g.examName}</td>
                            <td className="px-4 py-3 text-slate-600">{crs?.name || '—'}</td>
                            <td className="px-4 py-3 text-center font-black text-slate-800">{g.score}/{g.maxScore}</td>
                            <td className="px-4 py-3 text-center"><span className={`text-xs px-3 py-1.5 rounded-full font-bold ${getGradeColor(pct)}`}>{getGradeLabel(pct)}</span></td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{g.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {myGrades.length > 0 && (
                  <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
                    <span className="text-sm text-slate-500">المعدل العام</span>
                    <span className="font-black text-lg text-slate-800">{avg}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">✅ سجل الحضور</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ['حاضر', myAttendance.filter(a => a.status === 'حاضر').length, '🟢'],
                  ['غائب', myAttendance.filter(a => a.status === 'غائب').length, '🔴'],
                  ['متأخر', myAttendance.filter(a => a.status === 'متأخر').length, '🟡'],
                  ['بعذر', myAttendance.filter(a => a.status === 'بعذر').length, '🔵'],
                ].map(([label, count, ic], i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                    <p className="text-2xl mb-1">{ic}</p>
                    <p className="text-2xl font-black text-slate-800">{count}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">التاريخ</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الكورس</th>
                        <th className="px-4 py-3 text-center font-bold text-slate-600">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-12 text-slate-400">لا يوجد سجل حضور</td></tr>
                      ) : myAttendance.slice().reverse().map(a => {
                        const crs = courses.find(c => c.id === a.courseId);
                        const stColor = a.status === 'حاضر' ? 'bg-emerald-100 text-emerald-700' : a.status === 'غائب' ? 'bg-red-100 text-red-700' : a.status === 'متأخر' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';
                        return (
                          <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="px-4 py-3">{a.date}</td>
                            <td className="px-4 py-3 text-slate-600">{crs?.name || '—'}</td>
                            <td className="px-4 py-3 text-center"><span className={`text-xs px-3 py-1.5 rounded-full font-bold ${stColor}`}>{a.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AI CHAT */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
              <div className="bg-gradient-to-l from-violet-600 to-fuchsia-600 p-4 flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
                <div>
                  <p className="font-bold text-sm">المعلم الذكي</p>
                  <p className="text-xs text-white/80">متاح 24/7 • مدرّب على محتوى كورساتك</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-3">👋</p>
                    <p className="font-bold text-slate-700">مرحباً! أنا مساعدك الذكي</p>
                    <p className="text-sm text-slate-500 mt-1">اسألني أي شيء عن محتوى الكورسات</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['اشرح لي الدرس الأول', 'أعطني مثال عملي', 'كيف أستعد للاختبار؟'].map(s => (
                        <button key={s} onClick={() => { setChatInput(s); onSendMessage(s); }} className="text-xs bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-violet-300 transition-colors">{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tl-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tr-sm shadow-sm'}`}>
                      {m.role === 'assistant' && <span className="ml-1">🤖</span>}
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { onSendMessage(chatInput); setChatInput(''); } }}
                  placeholder="اكتب سؤالك..." className="flex-1 px-4 py-3 bg-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all" />
                <button onClick={() => { if (chatInput.trim()) { onSendMessage(chatInput); setChatInput(''); } }}
                  className="px-5 py-3 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 text-sm">إرسال</button>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-xl font-black text-slate-800">⚙️ إعدادات الحساب</h2>
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">البيانات الشخصية</h3>
                  <button onClick={() => { if (editMode) { onUpdateStudent({ ...student, ...formData }); show('تم الحفظ ✅'); } setEditMode(!editMode); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${editMode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {editMode ? '💾 حفظ' : '✏️ تعديل'}
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'name', label: 'الاسم', val: formData.name, key: 'name' as const },
                    { id: 'email', label: 'البريد', val: formData.email, key: 'email' as const },
                    { id: 'phone', label: 'الهاتف', val: formData.phone, key: 'phone' as const },
                  ].map(f => (
                    <div key={f.id}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{f.label}</label>
                      <input disabled={!editMode} value={f.val} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        className={`w-full px-4 py-3 rounded-2xl border-2 text-sm ${editMode ? 'border-slate-200 focus:border-blue-500 bg-white' : 'border-transparent bg-slate-50'}`} />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={onLogout} className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">🚪 تسجيل الخروج</button>
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}
    </div>
  );
};

export default StudentProfile;
