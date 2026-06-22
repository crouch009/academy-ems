import React, { useState } from 'react';
import { Course, LiveClass, Instructor } from '../types';

interface LiveClassesProps {
  courses: Course[];
  liveClasses: LiveClass[];
  instructors: Instructor[];
  onUpdateLiveClasses: (classes: LiveClass[]) => void;
}

const LiveClasses: React.FC<LiveClassesProps> = ({ courses, liveClasses, instructors, onUpdateLiveClasses }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '19:00',
    endTime: '20:00',
    meetingUrl: '',
    isRecorded: true,
  });
  const [activeLive, setActiveLive] = useState<LiveClass | null>(null);

  const handleCreate = () => {
    if (!form.title || !selectedCourse || !form.date) return;
    
    const newClass: LiveClass = {
      id: Date.now().toString(),
      courseId: selectedCourse,
      title: form.title,
      description: form.description,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      meetingUrl: form.meetingUrl || `https://meet.academy.com/${Math.random().toString(36).substr(2, 9)}`,
      recordingUrl: '',
      isRecorded: form.isRecorded,
      instructorId: courses.find(c => c.id === selectedCourse)?.instructorId || '',
      attendeesCount: 0,
      materialsUrls: [],
      status: 'مجدول',
    };

    onUpdateLiveClasses([...liveClasses, newClass]);
    setForm({ title: '', description: '', date: '', startTime: '19:00', endTime: '20:00', meetingUrl: '', isRecorded: true });
    setShowForm(false);
  };

  const startClass = (liveClass: LiveClass) => {
    setActiveLive({ ...liveClass, status: 'جاري' });
    onUpdateLiveClasses(liveClasses.map(c => c.id === liveClass.id ? { ...c, status: 'جاري' } : c));
  };

  const endClass = (liveClass: LiveClass) => {
    onUpdateLiveClasses(liveClasses.map(c => c.id === liveClass.id ? { ...c, status: 'منتهى' } : c));
    setActiveLive(null);
  };

  const getInstructorName = (id: string) => instructors.find(i => i.id === id)?.name || 'غير محدد';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">🎥 الفصول الافتراضية المباشرة</h2>
          <p className="text-slate-500">اجتماعات Zoom-like مع تسجيل تلقائي وتكامل Google</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-violet-700">
          + فصل مباشر جديد
        </button>
      </div>

      {/* Virtual Classroom (Active) */}
      {activeLive && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                🔴 مباشر
              </div>
              <h3 className="text-xl font-bold mt-2">{activeLive.title}</h3>
              <p className="text-slate-300 text-sm">{activeLive.description}</p>
            </div>
            <button onClick={() => endClass(activeLive)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold">
              إنهاء الفصل
            </button>
          </div>

          {/* Simulated Video Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-slate-800 rounded-2xl aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full mx-auto flex items-center justify-center text-xl font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <p className="text-xs mt-1">طالب {i}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center">🎤</button>
            <button className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center">📹</button>
            <button className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center">🖥️</button>
            <button className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center">✋</button>
            <button className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center">💬</button>
            <button className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center">📝</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-blue-100 text-sm">المجدولة</p>
          <p className="text-3xl font-bold">{liveClasses.filter(c => c.status === 'مجدول').length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🔴</div>
          <p className="text-rose-100 text-sm">جارية الآن</p>
          <p className="text-3xl font-bold">{liveClasses.filter(c => c.status === 'جاري').length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">✓</div>
          <p className="text-emerald-100 text-sm">منتهية</p>
          <p className="text-3xl font-bold">{liveClasses.filter(c => c.status === 'منتهى').length}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">💾</div>
          <p className="text-violet-100 text-sm">مُسجلة</p>
          <p className="text-3xl font-bold">{liveClasses.filter(c => c.recordingUrl).length}</p>
        </div>
      </div>

      {/* New Live Class Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">فصل مباشر جديد</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">الكورس</label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
                >
                  <option value="">اختر كورس</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">عنوان الفصل</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: محاضرة 5 - البرمجة الكائنية"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">وصف</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">التاريخ</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">من</label>
                  <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">إلى</label>
                  <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">رابط الاجتماع (اختياري)</label>
                <input
                  type="text"
                  value={form.meetingUrl}
                  onChange={e => setForm({ ...form, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
                  dir="ltr"
                />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isRecorded} onChange={e => setForm({ ...form, isRecorded: e.target.checked })} className="w-5 h-5 accent-blue-600" />
                <span className="text-sm text-slate-700">تسجيل الفصل تلقائياً</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-2xl font-semibold">إلغاء</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700">إنشاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Classes */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-slate-800">📅 الفصول المجدولة ({liveClasses.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {liveClasses.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <div className="text-5xl mb-2">🎥</div>
              <p>لا توجد فصول مباشرة مجدولة</p>
            </div>
          ) : liveClasses.map(cls => {
            const course = courses.find(c => c.id === cls.courseId);
            return (
              <div key={cls.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                    cls.status === 'جاري' ? 'bg-red-100 animate-pulse' : cls.status === 'منتهى' ? 'bg-slate-100' : 'bg-blue-100'
                  }`}>
                    {cls.status === 'جاري' ? '🔴' : cls.status === 'منتهى' ? '✓' : '📅'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800">{cls.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-1">{cls.description}</p>
                  <div className="flex gap-3 text-xs text-slate-500 mt-1">
                    <span>📚 {course?.name}</span>
                    <span>👨‍🏫 {getInstructorName(cls.instructorId)}</span>
                    <span>📅 {cls.date}</span>
                    <span>🕐 {cls.startTime} - {cls.endTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cls.status === 'مجدول' && (
                    <button onClick={() => startClass(cls)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                      بدء الفصل
                    </button>
                  )}
                  <button onClick={() => window.open(cls.meetingUrl, '_blank')} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
                    رابط الدخول
                  </button>
                  {cls.recordingUrl && (
                    <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-200">
                      📼 التسجيل
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl mb-2">🔴</div>
          <h3 className="font-bold text-slate-800 mb-1">بث مباشر عالي الجودة</h3>
          <p className="text-xs text-slate-500">دقة HD مع دعم حتى 1000 مشاهد متزامن</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl mb-2">💾</div>
          <h3 className="font-bold text-slate-800 mb-1">تسجيل تلقائي</h3>
          <p className="text-xs text-slate-500">يُحفظ تلقائياً على Google Drive</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-bold text-slate-800 mb-1">غرف جانبية</h3>
          <p className="text-xs text-slate-500">تقسيم الطلاب لمجموعات مناقشة</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-bold text-slate-800 mb-1">سبورة تفاعلية</h3>
          <p className="text-xs text-slate-500">كتابة وتعليق تفاعلي أثناء الشرح</p>
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;
