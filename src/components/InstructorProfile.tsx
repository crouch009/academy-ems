import React, { useState, useMemo } from 'react';
import { Instructor, Course, Student, AttendanceRecord, GradeRecord } from '../types';

interface InstructorProfileProps {
  instructor: Instructor;
  courses: Course[];
  students: Student[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  onUpdateInstructor: (instructor: Instructor) => void;
  onLogout: () => void;
}

const InstructorProfile: React.FC<InstructorProfileProps> = ({ instructor, courses, students, attendance, grades, onUpdateInstructor, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'students' | 'analytics' | 'settings'>('home');
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState({ name: instructor.name, email: instructor.email, phone: instructor.phone, specialty: instructor.specialty, bio: instructor.bio });

  const myCourses = useMemo(() => courses.filter(c => c.instructorId === instructor.id), [courses, instructor.id]);
  const myStudents = useMemo(() => students.filter(s => myCourses.some(c => c.id === s.courseId)), [students, myCourses]);
  const myAtt = useMemo(() => attendance.filter(a => myCourses.some(c => c.id === a.courseId)), [attendance, myCourses]);
  const myGrades = useMemo(() => grades.filter(g => myCourses.some(c => c.id === g.courseId)), [grades, myCourses]);

  const avgAtt = myAtt.length ? ((myAtt.filter(a => a.status === 'حاضر').length / myAtt.length) * 100).toFixed(1) : '0';
  const avgGrade = myGrades.length ? (myGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / myGrades.length).toFixed(1) : '0';
  const totalRevenue = myCourses.reduce((a, c) => a + (students.filter(s => s.courseId === c.id).length * c.price), 0);
  const topCourse = myCourses.length > 0 ? myCourses.reduce((best, c) => students.filter(s => s.courseId === c.id).length > students.filter(s => s.courseId === best.id).length ? c : best) : null;

  const show = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const tabs = [
    { key: 'home', label: 'الرئيسية', icon: '🏠' },
    { key: 'courses', label: 'كورساتي', icon: '📚' },
    { key: 'students', label: 'طلابي', icon: '👨‍🎓' },
    { key: 'analytics', label: 'التحليلات', icon: '📊' },
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
            <span className="font-black text-slate-800 hidden sm:block">لوحة المدرب</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('settings')} className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{instructor.name.charAt(0)}</button>
            <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-xl transition-colors">خروج</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-6 p-4 lg:p-6">
        {/* Sidebar Mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <aside className={`fixed lg:sticky top-14 lg:top-20 right-0 h-[calc(100vh-56px)] w-64 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto z-50 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex-shrink-0`}>
          <div className="p-5 text-center border-b border-slate-100">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-lg shadow-violet-500/20">{instructor.name.charAt(0)}</div>
            <h3 className="font-bold text-slate-800">{instructor.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{instructor.specialty}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">✓ {instructor.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {[[`${myCourses.length}`, 'كورس'], [`${myStudents.length}`, 'طالب'], [`${totalRevenue.toLocaleString()}`, 'ج.م'], [`${myAtt.length}`, 'جلسة']].map(([v, l], i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800">{v}</p>
                <p className="text-[10px] text-slate-500 font-medium">{l}</p>
              </div>
            ))}
          </div>
          <nav className="p-2 space-y-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="text-lg">{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 space-y-6">
          {/* HOME */}
          {activeTab === 'home' && (
            <>
              <div className="bg-gradient-to-l from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-black mb-2">مرحباً أستاذ {instructor.name.split(' ').pop()}! 👋</h2>
                  <p className="text-white/80 mb-4">{myCourses.length} كورس • {myStudents.length} طالب مسجّل</p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-5 py-2.5 bg-white text-violet-700 font-bold rounded-xl text-sm">📊 عرض التقارير</button>
                    <button className="px-5 py-2.5 bg-white/20 backdrop-blur-sm font-bold rounded-xl text-sm">➕ كورس جديد</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'إجمالي الطلاب', value: myStudents.length, icon: '👨‍🎓', color: 'from-blue-500 to-blue-700' },
                  { label: 'متوسط الحضور', value: `${avgAtt}%`, icon: '📋', color: 'from-emerald-500 to-emerald-700' },
                  { label: 'متوسط الدرجات', value: `${avgGrade}%`, icon: '🎯', color: 'from-violet-500 to-violet-700' },
                  { label: 'الإيرادات', value: `${totalRevenue.toLocaleString()} ج.م`, icon: '💰', color: 'from-amber-500 to-amber-700' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200 p-5">
                    <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-xl shadow-lg mb-3`}>{s.icon}</div>
                    <p className="text-2xl font-black text-slate-800">{s.value}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {topCourse && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-3">🏆 الأكثر طلباً</h3>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: topCourse.color }}>{topCourse.code}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{topCourse.name}</p>
                      <p className="text-sm text-slate-500">{students.filter(s => s.courseId === topCourse.id).length} طالب مسجّل</p>
                    </div>
                    <span className="text-sm font-bold text-violet-600">{topCourse.price.toLocaleString()} ج.م</span>
                  </div>
                </div>
              )}

              {myGrades.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">📋 آخر الدرجات</h3>
                  <div className="space-y-2">
                    {myGrades.slice(-5).reverse().map(g => {
                      const st = students.find(s => s.id === g.studentId);
                      const pct = (g.score / g.maxScore) * 100;
                      return (
                        <div key={g.id} className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">{st?.name?.charAt(0) || '؟'}</div>
                            <div><p className="text-sm font-bold">{st?.name || '—'}</p><p className="text-xs text-slate-400">{g.examName}</p></div>
                          </div>
                          <span className={`text-sm font-black px-3 py-1 rounded-full ${pct >= 85 ? 'bg-emerald-100 text-emerald-700' : pct >= 70 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{g.score}/{g.maxScore}</span>
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">📚 كورساتي ({myCourses.length})</h2>
                <button className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl text-sm hover:bg-violet-700">+ كورس جديد</button>
              </div>
              {myCourses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center"><p className="text-5xl mb-3">📚</p><p className="font-bold text-slate-700">ليس لديك كورسات بعد</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {myCourses.map(c => {
                    const enrolled = students.filter(s => s.courseId === c.id).length;
                    const fillPct = (enrolled / c.capacity) * 100;
                    const cAtt = attendance.filter(a => a.courseId === c.id);
                    const cGrades = grades.filter(g => g.courseId === c.id);
                    const cAvg = cGrades.length ? (cGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / cGrades.length).toFixed(0) : '—';
                    return (
                      <div key={c.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-2" style={{ backgroundColor: c.color }} />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ backgroundColor: c.color }}>{c.code}</div>
                              <div>
                                <h3 className="font-bold text-slate-800">{c.name}</h3>
                                <p className="text-xs text-slate-500">{c.duration} أسبوع • {c.schedule.length} جلسة أسبوعياً</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${c.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                            <div className="bg-slate-50 rounded-xl py-2"><p className="font-bold text-slate-800">{enrolled}</p><p className="text-slate-400">طالب</p></div>
                            <div className="bg-slate-50 rounded-xl py-2"><p className="font-bold text-slate-800">{cAvg}%</p><p className="text-slate-400">المعدل</p></div>
                            <div className="bg-slate-50 rounded-xl py-2"><p className="font-bold text-slate-800">{cAtt.length}</p><p className="text-slate-400">جلسة</p></div>
                            <div className="bg-slate-50 rounded-xl py-2"><p className="font-bold text-slate-800">{fillPct.toFixed(0)}%</p><p className="text-slate-400">اشغال</p></div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(fillPct, 100)}%`, backgroundColor: c.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">👨‍🎓 طلابي ({myStudents.length})</h2>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الطالب</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">البريد</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الكورس</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myStudents.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-12 text-slate-400">لا يوجد طلاب مسجّلون</td></tr>
                      ) : myStudents.map(s => {
                        const c = courses.find(co => co.id === s.courseId);
                        return (
                          <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${s.gender === 'ذكر' ? 'bg-blue-500' : 'bg-pink-500'}`}>{s.name.charAt(0)}</div>
                                <span className="font-bold">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{s.email}</td>
                            <td className="px-4 py-3 text-slate-600">{c?.name || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-3 py-1 rounded-full font-bold ${s.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{s.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-800">📊 التحليلات</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'الكورسات', value: myCourses.length, sub: `${myCourses.filter(c => c.status === 'نشط').length} نشط`, color: 'from-violet-500 to-purple-600' },
                  { title: 'الطلاب', value: myStudents.length, sub: `${myStudents.filter(s => s.status === 'نشط').length} نشط`, color: 'from-blue-500 to-cyan-600' },
                  { title: 'الإيرادات', value: `${totalRevenue.toLocaleString()} ج.م`, sub: `متوسط ${(totalRevenue / Math.max(myCourses.length, 1)).toLocaleString()}`, color: 'from-emerald-500 to-teal-600' },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${c.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg mb-3`}>📊</div>
                    <p className="text-3xl font-black text-slate-800">{c.value}</p>
                    <p className="text-sm text-slate-500 font-medium">{c.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">🎯 توزيع الدرجات</h3>
                  <div className="space-y-3">
                    {[['ممتاز (85%+)', myGrades.filter(g => (g.score / g.maxScore) * 100 >= 85).length, 'bg-emerald-500'],
                      ['جيد جداً (70-84%)', myGrades.filter(g => { const p = (g.score / g.maxScore) * 100; return p >= 70 && p < 85; }).length, 'bg-blue-500'],
                      ['جيد (60-69%)', myGrades.filter(g => { const p = (g.score / g.maxScore) * 100; return p >= 60 && p < 70; }).length, 'bg-amber-500'],
                      ['ضعيف (<60%)', myGrades.filter(g => (g.score / g.maxScore) * 100 < 60).length, 'bg-red-500'],
                    ].map(([label, count, color]) => (
                      <div key={String(label)}>
                        <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{String(label)}</span><span className="font-bold">{String(count)}</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div className={`h-3 rounded-full ${color}`} style={{ width: `${myGrades.length > 0 ? (Number(count) / myGrades.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">📋 توزيع الحضور</h3>
                  <div className="space-y-3">
                    {[['حاضر', myAtt.filter(a => a.status === 'حاضر').length, 'bg-emerald-500'],
                      ['غائب', myAtt.filter(a => a.status === 'غائب').length, 'bg-red-500'],
                      ['متأخر', myAtt.filter(a => a.status === 'متأخر').length, 'bg-amber-500'],
                      ['بعذر', myAtt.filter(a => a.status === 'بعذر').length, 'bg-blue-500'],
                    ].map(([label, count, color]) => (
                      <div key={String(label)}>
                        <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{String(label)}</span><span className="font-bold">{String(count)}</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div className={`h-3 rounded-full ${color}`} style={{ width: `${myAtt.length > 0 ? (Number(count) / myAtt.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  <button onClick={() => { if (editMode) { onUpdateInstructor({ ...instructor, ...formData }); show('تم الحفظ ✅'); } setEditMode(!editMode); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${editMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {editMode ? '💾 حفظ' : '✏️ تعديل'}
                  </button>
                </div>
                <div className="space-y-4">
                  {[['name', 'الاسم', formData.name], ['email', 'البريد', formData.email], ['phone', 'الهاتف', formData.phone], ['specialty', 'التخصص', formData.specialty]].map(([k, l, v]) => (
                    <div key={k}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{l}</label>
                      <input disabled={!editMode} value={v as string} onChange={e => setFormData({ ...formData, [k as string]: e.target.value })}
                        className={`w-full px-4 py-3 rounded-2xl border-2 text-sm ${editMode ? 'border-slate-200 focus:border-violet-500' : 'border-transparent bg-slate-50'}`} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">النبذة</label>
                    <textarea disabled={!editMode} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3}
                      className={`w-full px-4 py-3 rounded-2xl border-2 text-sm resize-none ${editMode ? 'border-slate-200 focus:border-violet-500' : 'border-transparent bg-slate-50'}`} />
                  </div>
                </div>
              </div>
              <button onClick={onLogout} className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">🚪 تسجيل الخروج</button>
            </div>
          )}
        </main>
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl">{toast}</div>}
    </div>
  );
};

export default InstructorProfile;
