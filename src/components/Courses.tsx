import React, { useState, useMemo } from 'react';
import { Course, Instructor } from '../types';

interface CoursesProps {
  courses: Course[];
  instructors: Instructor[];
  onUpdate: (courses: Course[]) => void;
}

const initialForm: Omit<Course, 'id'> = {
  name: '', code: '', description: '', instructorId: '', capacity: 30, enrolledCount: 0,
  price: 0, currency: 'SAR', duration: 8, schedule: [{ day: 'الأحد', startTime: '09:00', endTime: '11:00', room: 'قاعة 1' }],
  status: 'نشط', startDate: '', endDate: '', color: '#3B82F6', language: 'ar',
  level: 'مبتدئ', hasCertificate: true, passingGrade: 70,
};

const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

const Courses: React.FC<CoursesProps> = ({ courses, instructors, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id'>>(initialForm);

  const filtered = useMemo(() => courses.filter(c => c.name.includes(search) || c.code.includes(search)), [courses, search]);

  const handleSubmit = () => {
    if (!form.name || !form.code) return;
    if (editingId) {
      onUpdate(courses.map(c => c.id === editingId ? { ...form, id: editingId } : c));
    } else {
      onUpdate([...courses, { ...form, id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) }]);
    }
    setForm(initialForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (course: Course) => {
    setForm({ ...course, schedule: [...course.schedule] });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكورس؟')) onUpdate(courses.filter(c => c.id !== id));
  };

  const addScheduleItem = () => setForm({ ...form, schedule: [...form.schedule, { day: DAYS[0], startTime: '09:00', endTime: '11:00', room: 'قاعة 1' }] });
  const removeScheduleItem = (i: number) => setForm({ ...form, schedule: form.schedule.filter((_, idx) => idx !== i) });
  const updateScheduleItem = (i: number, field: string, value: string) => {
    const newSchedule = [...form.schedule];
    newSchedule[i] = { ...newSchedule[i], [field]: value };
    setForm({ ...form, schedule: newSchedule });
  };

  const getInstructorName = (id: string) => instructors.find(i => i.id === id)?.name || 'غير محدد';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">إدارة الكورسات</h2>
          <p className="text-slate-500">{courses.length} كورس متاح</p>
        </div>
        <button onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          إضافة كورس
        </button>
      </div>

      <div className="relative">
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" placeholder="بحث بالكورس أو الكود..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full md:w-96 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-4xl mb-2">📚</p>
            <p className="text-slate-400">لا توجد كورسات</p>
          </div>
        ) : filtered.map(course => {
          const fillPercent = course.capacity > 0 ? (course.enrolledCount / course.capacity) * 100 : 0;
          return (
            <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-2" style={{ backgroundColor: course.color }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold" style={{ color: course.color }}>{course.code}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${course.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : course.status === 'مكتمل' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {course.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{course.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">👨‍🏫 المدرس</span>
                    <span className="text-slate-700 font-medium">{getInstructorName(course.instructorId)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">📅 المدة</span>
                    <span className="text-slate-700 font-medium">{course.duration} أسبوع</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">👥 الطلاب</span>
                    <span className="text-slate-700 font-medium">{course.enrolledCount}/{course.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">💰 السعر</span>
                    <span className="text-slate-700 font-bold">{course.price.toLocaleString()} ج.م</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>نسبة الاشغال</span><span>{fillPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(fillPercent, 100)}%`, backgroundColor: course.color }} />
                  </div>
                </div>
                <div className="space-y-1 mb-4">
                  {course.schedule.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-500">
                      <span>{s.day}</span><span>{s.startTime} - {s.endTime}</span><span>{s.room}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => handleEdit(course)} className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">تعديل</button>
                  <button onClick={() => handleDelete(course.id)} className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">حذف</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'تعديل الكورس' : 'إضافة كورس جديد'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">اسم الكورس *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">كود الكورس *</label>
                  <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المدرس</label>
                  <select value={form.instructorId} onChange={e => setForm({ ...form, instructorId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">اختر مدرس</option>
                    {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">السعر (ج.م)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">السعة</label>
                  <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المدة (أسبوع)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البداية</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ النهاية</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'نشط' | 'مكتمل' | 'معلق' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="نشط">نشط</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="معلق">معلق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">لون الكورس</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm({ ...form, color: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">مواعيد المحاضرات</label>
                  <button onClick={addScheduleItem} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ إضافة موعد</button>
                </div>
                {form.schedule.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center bg-slate-50 p-3 rounded-xl">
                    <select value={s.day} onChange={e => updateScheduleItem(i, 'day', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" value={s.startTime} onChange={e => updateScheduleItem(i, 'startTime', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="time" value={s.endTime} onChange={e => updateScheduleItem(i, 'endTime', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" value={s.room} onChange={e => updateScheduleItem(i, 'room', e.target.value)} placeholder="القاعة" className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    {form.schedule.length > 1 && <button onClick={() => removeScheduleItem(i)} className="text-red-500 hover:text-red-700 p-1">✕</button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium">إلغاء</button>
              <button onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
                {editingId ? 'تحديث' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
