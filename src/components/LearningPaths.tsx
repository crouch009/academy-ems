import React, { useState } from 'react';
import { Course, LearningPath } from '../types';

interface LearningPathsProps {
  courses: Course[];
  paths: LearningPath[];
  onUpdatePaths: (paths: LearningPath[]) => void;
}

const PATH_COLORS = ['from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500'];

const LearningPaths: React.FC<LearningPathsProps> = ({ courses, paths, onUpdatePaths }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    courseIds: [] as string[],
    difficulty: 'مبتدئ' as 'مبتدئ' | 'متوسط' | 'متقدم',
    estimatedHours: 40,
    certificateOnCompletion: true,
    industryRecognition: true,
  });

  const handleCreate = () => {
    if (!form.name) return;
    const path: LearningPath = {
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      courseIds: form.courseIds,
      difficulty: form.difficulty,
      estimatedHours: form.estimatedHours,
      certificateOnCompletion: form.certificateOnCompletion,
      industryRecognition: form.industryRecognition,
    };
    onUpdatePaths([...paths, path]);
    setForm({
      name: '', description: '', courseIds: [], difficulty: 'مبتدئ',
      estimatedHours: 40, certificateOnCompletion: true, industryRecognition: true,
    });
    setShowForm(false);
  };

  const toggleCourse = (courseId: string) => {
    setForm(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId) 
        ? prev.courseIds.filter(c => c !== courseId) 
        : [...prev.courseIds, courseId]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">🛤️ مسارات التعلم</h2>
        <p className="text-slate-500">برامج تعليمية منظمة تقود الطالب من المبتدئ حتى الاحتراف</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🛤️</div>
          <p className="text-blue-100 text-sm">المسارات</p>
          <p className="text-3xl font-bold">{paths.length}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">📚</div>
          <p className="text-violet-100 text-sm">الكورسات في المسارات</p>
          <p className="text-3xl font-bold">{paths.reduce((a, p) => a + p.courseIds.length, 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-emerald-100 text-sm">شهادات مسار</p>
          <p className="text-3xl font-bold">{paths.filter(p => p.certificateOnCompletion).length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">⏱️</div>
          <p className="text-amber-100 text-sm">متوسط الساعات</p>
          <p className="text-3xl font-bold">
            {paths.length > 0 ? Math.round(paths.reduce((a, p) => a + p.estimatedHours, 0) / paths.length) : 0}
          </p>
        </div>
      </div>

      {/* Featured Path */}
      {paths.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 rounded-3xl p-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-xs font-bold mb-3">
              ⭐ المسار المميز
            </div>
            <h3 className="text-2xl font-bold mb-2">{paths[0].name}</h3>
            <p className="text-white/70 mb-4 max-w-2xl">{paths[0].description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {paths[0].courseIds.slice(0, 4).map(id => {
                const course = courses.find(c => c.id === id);
                return course ? (
                  <span key={id} className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs">{course.name}</span>
                ) : null;
              })}
            </div>
            <div className="flex gap-4 text-sm">
              <span>⏱️ {paths[0].estimatedHours} ساعة</span>
              <span>📊 {paths[0].difficulty}</span>
              {paths[0].certificateOnCompletion && <span>🏆 شهادة</span>}
              {paths[0].industryRecognition && <span>🌟 معتمد صناعياً</span>}
            </div>
          </div>
        </div>
      )}

      {/* All Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400">
            <div className="text-5xl mb-2">🛤️</div>
            <p>لا توجد مسارات تعلم بعد</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold">
              إنشاء أول مسار
            </button>
          </div>
        ) : paths.map((path, idx) => {
          const colorClass = PATH_COLORS[idx % PATH_COLORS.length];
          const pathCourses = courses.filter(c => path.courseIds.includes(c.id));
          return (
            <div key={path.id} className={`bg-gradient-to-br ${colorClass} rounded-3xl p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{path.difficulty}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{path.name}</h3>
                <p className="text-sm text-white/80 line-clamp-2 mb-4">{path.description}</p>
                <div className="space-y-2 mb-4">
                  {pathCourses.slice(0, 3).map(course => (
                    <div key={course.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-xs flex items-center justify-between">
                      <span className="truncate">{course.name}</span>
                      <span className="text-white/60">{course.code}</span>
                    </div>
                  ))}
                  {pathCourses.length > 3 && (
                    <p className="text-xs text-white/60 text-center">+{pathCourses.length - 3} كورس آخر</p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>⏱️ {path.estimatedHours} ساعة</span>
                  <div className="flex gap-2">
                    {path.certificateOnCompletion && <span title="شهادة">🏆</span>}
                    {path.industryRecognition && <span title="معتمد صناعياً">🌟</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Card */}
        <button
          onClick={() => setShowForm(true)}
          className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-6 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 min-h-[300px]"
        >
          <div className="text-5xl mb-2">➕</div>
          <p className="font-bold">مسار جديد</p>
          <p className="text-xs mt-1">أنشئ مسار تعلم متكامل</p>
        </button>
      </div>

      {/* Add Path Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">إنشاء مسار تعلم جديد</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">اسم المسار</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: مسار تطوير الويب الكامل" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">الوصف</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">المستوى</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option>مبتدئ</option>
                    <option>متوسط</option>
                    <option>متقدم</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">الساعات التقديرية</label>
                  <input type="number" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">اختر الكورسات ({form.courseIds.length} محدد)</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl p-2 space-y-1">
                  {courses.map(course => (
                    <label key={course.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={form.courseIds.includes(course.id)} onChange={() => toggleCourse(course.id)} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm flex-1">{course.name}</span>
                      <span className="text-xs text-slate-400">{course.code}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.certificateOnCompletion} onChange={e => setForm({ ...form, certificateOnCompletion: e.target.checked })} className="w-5 h-5 accent-blue-600" />
                <span className="text-sm">منح شهادة عند إكمال المسار</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.industryRecognition} onChange={e => setForm({ ...form, industryRecognition: e.target.checked })} className="w-5 h-5 accent-blue-600" />
                <span className="text-sm">معتمد من الصناعة / الشركاء</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-2xl font-semibold">إلغاء</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700">إنشاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
