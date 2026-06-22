import React, { useState, useMemo } from 'react';
import { Course, Lesson } from '../types';

interface LessonsProps {
  courses: Course[];
  lessons: Lesson[];
  onUpdate: (lessons: Lesson[]) => void;
}

const Lessons: React.FC<LessonsProps> = ({ courses, lessons, onUpdate }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    type: 'فيديو' as Lesson['type'],
    content: '',
    duration: '15 دقيقة',
    isPublished: true,
  });

  const courseLessons = useMemo(() => {
    if (!selectedCourse) return [];
    return lessons
      .filter(l => l.courseId === selectedCourse)
      .sort((a, b) => a.order - b.order);
  }, [lessons, selectedCourse]);

  const selectedCourseObj = courses.find(c => c.id === selectedCourse);

  const handleSubmit = () => {
    if (!selectedCourse || !form.title.trim()) return;

    const newLesson: Lesson = {
      id: editingId || (Math.random().toString(36).substr(2, 9) + Date.now().toString(36)),
      courseId: selectedCourse,
      title: form.title.trim(),
      type: form.type,
      content: form.content.trim(),
      duration: form.duration,
      order: editingId
        ? lessons.find(l => l.id === editingId)!.order
        : Math.max(0, ...courseLessons.map(l => l.order)) + 1,
      isPublished: form.isPublished,
      isLocked: true,
      createdAt: editingId ? lessons.find(l => l.id === editingId)!.createdAt : new Date().toISOString().split('T')[0],
    };

    let newLessons;
    if (editingId) {
      newLessons = lessons.map(l => (l.id === editingId ? newLesson : l));
    } else {
      newLessons = [...lessons, newLesson];
    }

    onUpdate(newLessons);
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({ title: '', type: 'فيديو', content: '', duration: '15 دقيقة', isPublished: true });
  };

  const handleEdit = (lesson: Lesson) => {
    setForm({
      title: lesson.title,
      type: lesson.type,
      content: lesson.content,
      duration: lesson.duration,
      isPublished: lesson.isPublished,
    });
    setEditingId(lesson.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('حذف هذا الدرس؟')) {
      onUpdate(lessons.filter(l => l.id !== id));
    }
  };

  const moveLesson = (id: string, direction: 'up' | 'down') => {
    const idx = courseLessons.findIndex(l => l.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === courseLessons.length - 1)) return;

    const newOrder = [...courseLessons];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    const temp = newOrder[idx].order;
    newOrder[idx].order = newOrder[targetIdx].order;
    newOrder[targetIdx].order = temp;

    const updated = lessons.map(l => {
      const found = newOrder.find(n => n.id === l.id);
      return found ? { ...l, order: found.order } : l;
    });

    onUpdate(updated);
  };

  const getTypeIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'فيديو': return '🎥';
      case 'شرح نصي': return '📝';
      case 'تمرين': return '✏️';
      case 'اختبار': return '📋';
      default: return '📄';
    }
  };

  const getTypeColor = (type: Lesson['type']) => {
    switch (type) {
      case 'فيديو': return 'bg-red-100 text-red-700';
      case 'شرح نصي': return 'bg-blue-100 text-blue-700';
      case 'تمرين': return 'bg-emerald-100 text-emerald-700';
      case 'اختبار': return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">الدروس والمحتوى التعليمي</h2>
          <p className="text-slate-500">إدارة فيديوهات وشروحات وتمارين كل كورس</p>
        </div>
        {selectedCourse && (
          <button
            onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-lg shadow-blue-600/20"
          >
            + إضافة درس جديد
          </button>
        )}
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <label className="block text-sm font-semibold text-slate-600 mb-2">اختر الكورس</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-[420px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- اختر كورس لإدارة محتواه --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      {!selectedCourse ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-5">
            <span className="text-5xl">📚</span>
          </div>
          <h3 className="font-bold text-xl text-slate-700 mb-1">اختر كورساً لبدء إضافة الدروس</h3>
          <p className="text-slate-500">يمكنك إضافة فيديوهات، شروحات، تمارين واختبارات</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-bold text-xl text-slate-800">{selectedCourseObj?.name}</h3>
              <p className="text-sm text-slate-500">{courseLessons.length} درس • {selectedCourseObj?.duration} أسبوع</p>
            </div>
            <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
              {courseLessons.filter(l => l.isPublished).length} منشور
            </div>
          </div>

          {/* Lessons List */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {courseLessons.length === 0 ? (
              <div className="py-14 px-6 text-center">
                <p className="text-5xl mb-3">📖</p>
                <p className="text-lg font-medium text-slate-700 mb-1">لا توجد دروس بعد</p>
                <p className="text-slate-500">ابدأ بإضافة أول درس لهذا الكورس</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {courseLessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-4 hover:bg-slate-50 group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="text-3xl flex-shrink-0">{getTypeIcon(lesson.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-[15px]">{lesson.title}</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getTypeColor(lesson.type)}`}>
                            {lesson.type}
                          </span>
                          {lesson.isPublished ? (
                            <span className="text-[10px] px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">منشور</span>
                          ) : (
                            <span className="text-[10px] px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold">مسودة</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex gap-x-3">
                          <span>{lesson.duration}</span>
                          {lesson.content && <span className="truncate max-w-[240px]">• {lesson.content}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
                      <button onClick={() => moveLesson(lesson.id, 'up')} disabled={index === 0} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl disabled:opacity-30 transition-colors">↑</button>
                      <button onClick={() => moveLesson(lesson.id, 'down')} disabled={index === courseLessons.length - 1} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl disabled:opacity-30 transition-colors">↓</button>

                      <button onClick={() => handleEdit(lesson)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="تعديل">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(lesson.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl" title="حذف">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="text-xs bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-amber-700">
            💡 يمكنك سحب الدروس لإعادة ترتيبها بالأسهم ↑↓. الدروس غير المنشورة لا تظهر للطلاب.
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'تعديل الدرس' : 'درس جديد'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-red-500">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">عنوان الدرس</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: مقدمة في بايثون"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">نوع المحتوى</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as Lesson['type'] })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="فيديو">🎥 فيديو</option>
                    <option value="شرح نصي">📝 شرح نصي</option>
                    <option value="تمرين">✏️ تمرين عملي</option>
                    <option value="اختبار">📋 اختبار</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">المدة</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="25 دقيقة"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                  {form.type === 'فيديو' ? 'رابط الفيديو (YouTube / Vimeo)' : 'المحتوى أو الرابط'}
                </label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={3}
                  placeholder={form.type === 'فيديو' ? 'https://youtube.com/watch?v=...' : 'اكتب الشرح أو رابط الملف...'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">نشر الدرس للطلاب فوراً</span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t bg-slate-50">
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 py-3 rounded-2xl font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">إلغاء</button>
              <button onClick={handleSubmit} className="flex-1 py-3 rounded-2xl font-semibold bg-blue-600 text-white hover:bg-blue-700">
                {editingId ? 'حفظ التعديلات' : 'إضافة الدرس'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
