import React, { useState, useMemo } from 'react';
import { Student, Course, GradeRecord } from '../types';

interface GradesProps {
  students: Student[];
  courses: Course[];
  grades: GradeRecord[];
  onUpdate: (grades: GradeRecord[]) => void;
}

const Grades: React.FC<GradesProps> = ({ students, courses, grades, onUpdate }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', examName: '', maxScore: 100, score: 0, date: new Date().toISOString().split('T')[0], notes: '' });

  const courseStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return students.filter(s => s.courseId === selectedCourse);
  }, [students, selectedCourse]);

  const courseGrades = useMemo(() => {
    if (!selectedCourse) return [];
    return grades.filter(g => g.courseId === selectedCourse);
  }, [grades, selectedCourse]);

  const handleSubmit = () => {
    if (!form.studentId || !form.examName) return;
    onUpdate([...grades, { ...form, id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36), courseId: selectedCourse }]);
    setForm({ studentId: '', examName: '', maxScore: 100, score: 0, date: new Date().toISOString().split('T')[0], notes: '' });
    setShowForm(false);
  };

  const getGrade = (studentId: string, examName: string) => {
    return grades.find(g => g.studentId === studentId && g.courseId === selectedCourse && g.examName === examName);
  };

  const getStudentAvg = (studentId: string) => {
    const sGrades = grades.filter(g => g.studentId === studentId && g.courseId === selectedCourse);
    if (sGrades.length === 0) return null;
    const avg = sGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / sGrades.length;
    return avg.toFixed(1);
  };

  const getGradeColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600';
    if (pct >= 70) return 'text-blue-600';
    if (pct >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getGradeBadge = (pct: number) => {
    if (pct >= 85) return 'bg-emerald-100 text-emerald-700';
    if (pct >= 70) return 'bg-blue-100 text-blue-700';
    if (pct >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const examNames = [...new Set(grades.filter(g => g.courseId === selectedCourse).map(g => g.examName))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">إدارة الدرجات</h2>
          <p className="text-slate-500">تسجيل ومتابعة درجات الطلاب</p>
        </div>
        {selectedCourse && (
          <button onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            إضافة درجة
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-1">اختر الكورس</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
          <option value="">-- اختر كورس --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!selectedCourse ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
          <p className="text-4xl mb-2">📝</p>
          <p>اختر كورس لعرض الدرجات</p>
        </div>
      ) : courseStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
          <p className="text-4xl mb-2">👥</p>
          <p>لا يوجد طلاب في هذا الكورس</p>
        </div>
      ) : (
        <>
          {/* Grades Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">الطالب</th>
                    {examNames.map(name => (
                      <th key={name} className="px-6 py-4 text-center font-semibold text-slate-600">{name}</th>
                    ))}
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">المتوسط</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">التقدير</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStudents.map(student => {
                    const avg = getStudentAvg(student.id);
                    return (
                      <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${student.gender === 'ذكر' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{student.name}</span>
                          </div>
                        </td>
                        {examNames.map(name => {
                          const grade = getGrade(student.id, name);
                          if (!grade) return <td key={name} className="px-6 py-3 text-center text-slate-300">-</td>;
                          const pct = (grade.score / grade.maxScore) * 100;
                          return (
                            <td key={name} className="px-6 py-3 text-center">
                              <span className={`font-bold ${getGradeColor(pct)}`}>{grade.score}/{grade.maxScore}</span>
                            </td>
                          );
                        })}
                        <td className="px-6 py-3 text-center">
                          {avg ? <span className={`font-bold ${getGradeColor(Number(avg))}`}>{avg}%</span> : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {avg ? <span className={`text-xs px-3 py-1 rounded-full font-medium ${getGradeBadge(Number(avg))}`}>
                            {Number(avg) >= 85 ? 'ممتاز' : Number(avg) >= 70 ? 'جيد جداً' : Number(avg) >= 60 ? 'جيد' : 'ضعيف'}
                          </span> : <span className="text-slate-300">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grade Summary */}
          {courseGrades.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examNames.map(name => {
                const examGrades = courseGrades.filter(g => g.examName === name);
                const avg = examGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / examGrades.length;
                const max = Math.max(...examGrades.map(g => (g.score / g.maxScore) * 100));
                const min = Math.min(...examGrades.map(g => (g.score / g.maxScore) * 100));
                return (
                  <div key={name} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-3">{name}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400">المتوسط</p>
                        <p className={`text-lg font-bold ${getGradeColor(avg)}`}>{avg.toFixed(1)}%</p>
                      </div>
                      <div className="text-center bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400">أعلى درجة</p>
                        <p className="text-lg font-bold text-emerald-600">{max.toFixed(1)}%</p>
                      </div>
                      <div className="text-center bg-red-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400">أقل درجة</p>
                        <p className="text-lg font-bold text-red-600">{min.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grade Records List */}
          {courseGrades.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200"><h4 className="font-bold text-slate-700">سجل الدرجات ({courseGrades.length})</h4></div>
              <div className="divide-y divide-slate-100">
                {courseGrades.map(g => {
                  const s = students.find(st => st.id === g.studentId);
                  const pct = (g.score / g.maxScore) * 100;
                  return (
                    <div key={g.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-700 text-sm">{s?.name || 'غير محدد'}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{g.examName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${getGradeColor(pct)}`}>{g.score}/{g.maxScore}</span>
                        <span className="text-xs text-slate-400">{g.date}</span>
                        <button onClick={() => { if (confirm('حذف هذه الدرجة؟')) onUpdate(grades.filter(gr => gr.id !== g.id)); }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded" title="حذف">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">إضافة درجة جديدة</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الطالب</label>
                <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">اختر طالب</option>
                  {courseStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الامتحان</label>
                <input type="text" value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })} placeholder="مثال: امتحان نصفي"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الدرجة</label>
                  <input type="number" value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الدرجة الكلية</label>
                  <input type="number" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium">إلغاء</button>
              <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
