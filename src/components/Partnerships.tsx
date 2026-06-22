import React, { useState } from 'react';
import { Course, Institution } from '../types';

interface PartnershipsProps {
  institutions: Institution[];
  courses: Course[];
  onUpdateInstitutions: (institutions: Institution[]) => void;
}

const PARTNER_TYPES = [
  { value: 'university', label: 'جامعة', icon: '🏛️' },
  { value: 'company', label: 'شركة', icon: '🏢' },
  { value: 'organization', label: 'منظمة', icon: '🏆' },
];

const COUNTRIES = ['السعودية', 'الإمارات', 'مصر', 'الأردن', 'الكويت', 'قطر', 'البحرين', 'عمان', 'لبنان', 'المغرب', 'العالمية'];

const Partnerships: React.FC<PartnershipsProps> = ({ institutions, courses, onUpdateInstitutions }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'university' as 'university' | 'company' | 'organization',
    description: '',
    country: 'السعودية',
    website: '',
    logo: '🏛️',
  });

  const handleAdd = () => {
    if (!form.name) return;
    const inst: Institution = {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      logo: form.logo,
      description: form.description,
      country: form.country,
      website: form.website,
      partneredCourses: [],
      verified: false,
    };
    onUpdateInstitutions([...institutions, inst]);
    setForm({ name: '', type: 'university', description: '', country: 'السعودية', website: '', logo: '🏛️' });
    setShowForm(false);
  };

  const toggleVerification = (id: string) => {
    onUpdateInstitutions(institutions.map(i => i.id === id ? { ...i, verified: !i.verified } : i));
  };

  const toggleCoursePartner = (instId: string, courseId: string) => {
    onUpdateInstitutions(institutions.map(i => {
      if (i.id !== instId) return i;
      const has = i.partneredCourses.includes(courseId);
      return {
        ...i,
        partneredCourses: has ? i.partneredCourses.filter(c => c !== courseId) : [...i.partneredCourses, courseId]
      };
    }));
  };

  const stats = {
    total: institutions.length,
    verified: institutions.filter(i => i.verified).length,
    universities: institutions.filter(i => i.type === 'university').length,
    companies: institutions.filter(i => i.type === 'company').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">🤝 الشراكات المؤسسية</h2>
          <p className="text-slate-500">شراكات مع جامعات وشركات مرموقة لشهادات معتمدة عالمياً</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold hover:from-amber-600 hover:to-orange-600">
          + إضافة مؤسسة شريكة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🏛️</div>
          <p className="text-blue-100 text-sm">إجمالي الشراكات</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">✓</div>
          <p className="text-emerald-100 text-sm">مؤسسات موثقة</p>
          <p className="text-3xl font-bold">{stats.verified}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🏛️</div>
          <p className="text-violet-100 text-sm">جامعات</p>
          <p className="text-3xl font-bold">{stats.universities}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🏢</div>
          <p className="text-amber-100 text-sm">شركات</p>
          <p className="text-3xl font-bold">{stats.companies}</p>
        </div>
      </div>

      {/* Featured Partners */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 rounded-3xl p-8 text-white">
        <h3 className="text-xl font-bold mb-4">🌟 شركاؤنا المرموقون</h3>
        <p className="text-white/70 mb-6">نفتخر بالشراكة مع أفضل المؤسسات التعليمية والمهنية</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {institutions.slice(0, 6).map(inst => (
            <div key={inst.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/20 transition-colors">
              <div className="text-4xl mb-2">{inst.logo}</div>
              <p className="font-bold text-sm">{inst.name}</p>
              {inst.verified && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full mt-2 inline-block">✓ موثق</span>}
            </div>
          ))}
        </div>
      </div>

      {/* All Institutions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-slate-800">📋 جميع المؤسسات ({institutions.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {institutions.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400">
              <div className="text-5xl mb-2">🤝</div>
              <p>لا توجد مؤسسات شريكة بعد</p>
            </div>
          ) : institutions.map(inst => (
            <div key={inst.id} className="border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-2xl">
                    {inst.logo}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{inst.name}</h4>
                    <p className="text-xs text-slate-500">{PARTNER_TYPES.find(t => t.value === inst.type)?.label} • {inst.country}</p>
                  </div>
                </div>
                {inst.verified ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ موثق</span>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">غير موثق</span>
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">{inst.description}</p>
              {inst.website && (
                <a href={inst.website} target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline">
                  🌐 {inst.website.replace('https://', '')}
                </a>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{inst.partneredCourses.length} كورس</span>
                <button onClick={() => toggleVerification(inst.id)} className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100">
                  {inst.verified ? 'إلغاء التوثيق' : 'توثيق'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Partnership */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4">🔗 ربط الكورسات بالمؤسسات</h3>
        {institutions.length > 0 && courses.length > 0 ? (
          <div className="space-y-4">
            {institutions.map(inst => (
              <div key={inst.id} className="border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{inst.logo}</span>
                  <div>
                    <h4 className="font-bold text-slate-800">{inst.name}</h4>
                    <p className="text-xs text-slate-500">{inst.partneredCourses.length} كورس مرتبط</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courses.map(course => {
                    const isLinked = inst.partneredCourses.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        onClick={() => toggleCoursePartner(inst.id, course.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          isLinked ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isLinked ? '✓ ' : ''}{course.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            أضف مؤسسات وكورسات أولاً
          </div>
        )}
      </div>

      {/* Add Institution Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">إضافة مؤسسة شريكة</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">اسم المؤسسة</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">النوع</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">الدولة</label>
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">الشعار (إيموجي)</label>
                <input type="text" value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} className="w-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">الوصف</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">الموقع الإلكتروني (اختياري)</label>
                <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} dir="ltr" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-2xl font-semibold">إلغاء</button>
                <button onClick={handleAdd} className="flex-1 py-3 bg-amber-600 text-white rounded-2xl font-semibold hover:bg-amber-700">إضافة</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partnerships;
