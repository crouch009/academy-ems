import React, { useState } from 'react';
import { Course, JobOpportunity, Project, Student } from '../types';

interface CareerCenterProps {
  courses: Course[];
  students: Student[];
  jobs: JobOpportunity[];
  projects: Project[];
  onUpdateJobs: (jobs: JobOpportunity[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
}

const CAREER_SERVICES = [
  { icon: '📄', name: 'مراجعة السيرة الذاتية', desc: 'مراجعة احترافية من خبراء التوظيف', price: 'مجاني' },
  { icon: '🎯', name: 'التدريب على المقابلات', desc: 'محاكاة مقابلات عمل حقيقية', price: 'مجاني' },
  { icon: '💼', name: 'تطابق الوظائف', desc: 'اقتراحات وظائف تناسب مهاراتك', price: 'مجاني' },
  { icon: '🔗', name: 'ربط LinkedIn', desc: 'إضافة الشهادات لملفك المهني', price: 'مجاني' },
  { icon: '📊', name: 'تحليل المهارات', desc: 'تقرير شامل عن مهاراتك', price: 'مجاني' },
  { icon: '🤝', name: 'الإحالة الوظيفية', desc: 'توصية مباشرة للشركاء', price: 'مجاني' },
];

const CareerCenter: React.FC<CareerCenterProps> = ({ courses, students, jobs, projects, onUpdateJobs, onUpdateProjects: _onUpdateProjects }) => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    requiredSkills: '',
    location: '',
    remote: true,
    salaryRange: '',
    relatedCourseIds: [] as string[],
  });

  const handleAddJob = () => {
    if (!jobForm.title || !jobForm.company) return;
    const job: JobOpportunity = {
      id: Date.now().toString(),
      title: jobForm.title,
      company: jobForm.company,
      description: jobForm.description,
      requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim()),
      location: jobForm.location,
      remote: jobForm.remote,
      salaryRange: jobForm.salaryRange,
      postedBy: 'admin',
      postedDate: new Date().toISOString().split('T')[0],
      relatedCourseIds: jobForm.relatedCourseIds,
    };
    onUpdateJobs([job, ...jobs]);
    setJobForm({ title: '', company: '', description: '', requiredSkills: '', location: '', remote: true, salaryRange: '', relatedCourseIds: [] });
    setShowJobForm(false);
  };

  // Skills analytics
  const allSkills = courses.flatMap(c => c.skills || []);
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">💼 مركز التطوير المهني</h2>
        <p className="text-slate-500">ادعم مسيرتك المهنية من التوظيف إلى التطوير</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">💼</div>
          <p className="text-blue-100 text-sm">الوظائف المتاحة</p>
          <p className="text-3xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-emerald-100 text-sm">المشاريع المُسلمة</p>
          <p className="text-3xl font-bold">{projects.filter(p => p.status === 'تم التقييم').length}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-violet-100 text-sm">الخريجين المؤهلين</p>
          <p className="text-3xl font-bold">{students.filter(s => (s.completedCourses?.length || 0) > 0).length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🤝</div>
          <p className="text-amber-100 text-sm">الشركاء التوظيفيين</p>
          <p className="text-3xl font-bold">12</p>
        </div>
      </div>

      {/* Career Services */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">✨ الخدمات المهنية المتاحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAREER_SERVICES.map(svc => (
            <div key={svc.name} className="border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {svc.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{svc.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{svc.desc}</p>
                  <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{svc.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Skills in Demand */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">🔥 المهارات الأكثر طلباً</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {topSkills.map(([skill, count]) => (
            <div key={skill} className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-3 text-center">
              <p className="font-bold text-slate-800 text-sm">{skill}</p>
              <p className="text-xs text-slate-500 mt-1">{count} كورس</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job Board */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-bold text-slate-800">💼 لوحة الوظائف</h3>
          <button onClick={() => setShowJobForm(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-sm font-semibold">
            + إضافة وظيفة
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <div className="text-5xl mb-2">💼</div>
              <p>لا توجد وظائف منشورة بعد</p>
            </div>
          ) : jobs.map(job => {
            const relatedCourses = courses.filter(c => job.relatedCourseIds.includes(c.id));
            return (
              <div key={job.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800">{job.title}</h4>
                      {job.remote && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">عن بعد</span>}
                    </div>
                    <p className="text-sm text-blue-600 font-semibold mb-1">🏢 {job.company}</p>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {job.requiredSkills.map(skill => (
                        <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{skill}</span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>📍 {job.location || 'عن بعد'}</span>
                      {job.salaryRange && <span>💰 {job.salaryRange}</span>}
                      <span>📅 {job.postedDate}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 ml-4">
                    تقدم الآن
                  </button>
                </div>
                {relatedCourses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">🎓 الكورسات المتوافقة:</p>
                    <div className="flex flex-wrap gap-2">
                      {relatedCourses.map(c => (
                        <span key={c.id} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{c.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-slate-800">🚀 المشاريع العملية</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {projects.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-400">
              <div className="text-4xl mb-2">🚀</div>
              <p>لا توجد مشاريع مُسلمة بعد</p>
            </div>
          ) : projects.slice(0, 6).map(project => (
            <div key={project.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 text-sm">{project.title}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  project.status === 'تم التقييم' ? 'bg-emerald-100 text-emerald-700' : 
                  project.status === 'مُسلم' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-2">{project.description}</p>
              {project.grade && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">التقييم</span>
                  <span className="text-sm font-bold text-emerald-600">{project.grade}/100</span>
                </div>
              )}
              {project.industryReviewed && (
                <div className="mt-2 text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">✓ تمت المراجعة من خبير صناعي</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Job Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">إضافة فرصة وظيفية</h3>
              <button onClick={() => setShowJobForm(false)} className="text-slate-400 hover:text-red-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">المسمى الوظيفي</label>
                <input type="text" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">الشركة</label>
                <input type="text" value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">الوصف</label>
                <textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">المهارات المطلوبة (مفصولة بفاصلة)</label>
                <input type="text" value={jobForm.requiredSkills} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} placeholder="React, TypeScript, Node.js" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">الموقع</label>
                  <input type="text" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">نطاق الراتب</label>
                  <input type="text" value={jobForm.salaryRange} onChange={e => setJobForm({ ...jobForm, salaryRange: e.target.value })} placeholder="10,000 - 15,000 ر.س" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={jobForm.remote} onChange={e => setJobForm({ ...jobForm, remote: e.target.checked })} className="w-5 h-5 accent-blue-600" />
                <span className="text-sm text-slate-700">عمل عن بعد متاح</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowJobForm(false)} className="flex-1 py-3 text-slate-600 bg-slate-100 rounded-2xl font-semibold">إلغاء</button>
                <button onClick={handleAddJob} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700">نشر</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerCenter;
