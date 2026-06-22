import React, { useState, useMemo } from 'react';
import { Instructor } from '../types';

interface InstructorsProps {
  instructors: Instructor[];
  onUpdate: (instructors: Instructor[]) => void;
}

const initialForm: Omit<Instructor, 'id'> = {
  name: '', email: '', phone: '', specialty: '', hireDate: new Date().toISOString().split('T')[0],
  salary: 0, status: 'نشط', photo: '', bio: '',
};

const Instructors: React.FC<InstructorsProps> = ({ instructors, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Instructor, 'id'>>(initialForm);

  const filtered = useMemo(() => instructors.filter(i => i.name.includes(search) || i.specialty.includes(search)), [instructors, search]);

  const handleSubmit = () => {
    if (!form.name) return;
    if (editingId) {
      onUpdate(instructors.map(i => i.id === editingId ? { ...form, id: editingId } : i));
    } else {
      onUpdate([...instructors, { ...form, id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) }]);
    }
    setForm(initialForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (instructor: Instructor) => {
    setForm({ ...instructor });
    setEditingId(instructor.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المدرس؟')) onUpdate(instructors.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">إدارة المدرسين</h2>
          <p className="text-slate-500">{instructors.length} مدرس</p>
        </div>
        <button onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          إضافة مدرس
        </button>
      </div>

      <div className="relative">
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" placeholder="بحث بالاسم أو التخصص..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full md:w-96 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(instructor => (
          <div key={instructor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
            <div className="h-20 bg-gradient-to-l from-blue-600 to-violet-600" />
            <div className="px-6 pb-6">
              <div className="-mt-10 mb-4 flex justify-between items-end">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-slate-100">
                  {instructor.name.charAt(0)}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${instructor.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {instructor.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{instructor.name}</h3>
              <p className="text-sm text-blue-600 font-medium mb-3">{instructor.specialty}</p>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{instructor.bio}</p>
              <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between"><span className="text-slate-400">📧 البريد</span><span className="text-slate-700">{instructor.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">📱 الهاتف</span><span className="text-slate-700" dir="ltr">{instructor.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">📅 تاريخ التعيين</span><span className="text-slate-700">{instructor.hireDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">💰 الراتب</span><span className="text-slate-700 font-bold">{instructor.salary.toLocaleString()} ج.م</span></div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => handleEdit(instructor)} className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">تعديل</button>
                <button onClick={() => handleDelete(instructor.id)} className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'تعديل بيانات المدرس' : 'إضافة مدرس جديد'}</h3>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">التخصص</label>
                  <input type="text" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الراتب</label>
                  <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التعيين</label>
                  <input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'نشط' | 'متوقف' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="نشط">نشط</option>
                    <option value="متوقف">متوقف</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نبذة</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium">إلغاء</button>
              <button onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">{editingId ? 'تحديث' : 'حفظ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructors;
