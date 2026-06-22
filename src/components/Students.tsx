import React, { useState, useMemo } from 'react';
import { Student, Course } from '../types';

interface StudentsProps {
  students: Student[];
  courses: Course[];
  onUpdate: (students: Student[]) => void;
}

const initialForm: Omit<Student, 'id'> = {
  name: '', email: '', phone: '', dateOfBirth: '', gender: 'ذكر', address: '',
  enrollDate: new Date().toISOString().split('T')[0], courseId: '', status: 'نشط', photo: '', notes: '',
};

const Students: React.FC<StudentsProps> = ({ students, courses, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Student, 'id'>>(initialForm);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.includes(search) || s.email.includes(search) || s.phone.includes(search);
      const matchStatus = !filterStatus || s.status === filterStatus;
      const matchCourse = !filterCourse || s.courseId === filterCourse;
      return matchSearch && matchStatus && matchCourse;
    });
  }, [students, search, filterStatus, filterCourse]);

  const handleSubmit = () => {
    if (!form.name || !form.phone) return;
    if (editingId) {
      onUpdate(students.map(s => s.id === editingId ? { ...form, id: editingId } : s));
    } else {
      const newStudent: Student = { ...form, id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) };
      onUpdate([...students, newStudent]);
    }
    setForm(initialForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (student: Student) => {
    setForm({ name: student.name, email: student.email, phone: student.phone, dateOfBirth: student.dateOfBirth, gender: student.gender, address: student.address, enrollDate: student.enrollDate, courseId: student.courseId, status: student.status, photo: student.photo, notes: student.notes });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      onUpdate(students.filter(s => s.id !== id));
    }
  };

  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || 'غير محدد';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">إدارة الطلاب</h2>
          <p className="text-slate-500">{students.length} طالب مسجل</p>
        </div>
        <button onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          إضافة طالب
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="بحث بالاسم أو البريد أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">كل الحالات</option>
            <option value="نشط">نشط</option>
            <option value="متوقف">متوقف</option>
            <option value="متخرج">متخرج</option>
          </select>
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">كل الكورسات</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف *</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الميلاد</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">النوع</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as 'ذكر' | 'أنثى' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                  <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الكورس</label>
                  <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">اختر كورس</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'نشط' | 'متوقف' | 'متخرج' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="نشط">نشط</option>
                    <option value="متوقف">متوقف</option>
                    <option value="متخرج">متخرج</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
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

      {/* View Student Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">بيانات الطالب</h3>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{viewingStudent.name}</h4>
                  <span className={`text-xs px-3 py-1 rounded-full ${viewingStudent.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : viewingStudent.status === 'متوقف' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {viewingStudent.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-slate-400 mb-1">البريد</p><p className="font-medium text-slate-700">{viewingStudent.email || 'غير محدد'}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-slate-400 mb-1">الهاتف</p><p className="font-medium text-slate-700">{viewingStudent.phone}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-slate-400 mb-1">النوع</p><p className="font-medium text-slate-700">{viewingStudent.gender}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-slate-400 mb-1">تاريخ الميلاد</p><p className="font-medium text-slate-700">{viewingStudent.dateOfBirth || 'غير محدد'}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-slate-400 mb-1">العنوان</p><p className="font-medium text-slate-700">{viewingStudent.address || 'غير محدد'}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl"><p className="text-slate-400 mb-1">تاريخ التسجيل</p><p className="font-medium text-slate-700">{viewingStudent.enrollDate}</p></div>
                <div className="bg-slate-50 p-3 rounded-xl col-span-2"><p className="text-slate-400 mb-1">الكورس</p><p className="font-medium text-slate-700">{getCourseName(viewingStudent.courseId)}</p></div>
                {viewingStudent.notes && <div className="bg-slate-50 p-3 rounded-xl col-span-2"><p className="text-slate-400 mb-1">ملاحظات</p><p className="font-medium text-slate-700">{viewingStudent.notes}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">الطالب</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">الهاتف</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">الكورس</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">الحالة</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                  <p className="text-4xl mb-2">🔍</p>
                  <p>لا توجد نتائج</p>
                </td></tr>
              ) : filtered.map(student => (
                <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingStudent(student)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${student.gender === 'ذكر' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.email || 'لا يوجد بريد'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{student.phone}</td>
                  <td className="px-6 py-4 text-slate-600">{getCourseName(student.courseId)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${student.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : student.status === 'متوقف' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{student.enrollDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500 bg-slate-50">
            عرض {filtered.length} من أصل {students.length} طالب
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
