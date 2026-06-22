import React, { useState, useMemo } from 'react';
import { Course, Student, Certificate, GradeRecord } from '../types';

interface CertificatesProps {
  courses: Course[];
  students: Student[];
  grades: GradeRecord[];
  certificates: Certificate[];
  onUpdateCertificates: (certificates: Certificate[]) => void;
}

const TEMPLATES = [
  { id: 'modern', name: 'عصري', color: 'from-blue-600 to-violet-600', icon: '🏆' },
  { id: 'classic', name: 'كلاسيكي', color: 'from-amber-700 to-yellow-600', icon: '🎖️' },
  { id: 'gold', name: 'ذهبي', color: 'from-yellow-500 to-amber-600', icon: '🌟' },
  { id: 'minimal', name: 'بسيط', color: 'from-slate-700 to-slate-900', icon: '📜' },
];

const Certificates: React.FC<CertificatesProps> = ({ courses, students, grades, certificates, onUpdateCertificates }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [search, setSearch] = useState('');

  const eligibleStudents = useMemo(() => {
    if (!selectedCourse) return [];
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return [];
    const passing = course.passingGrade || 70;

    return students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id && g.courseId === selectedCourse);
      if (studentGrades.length === 0) return null;
      const avg = studentGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / studentGrades.length;
      const hasCertificate = certificates.some(c => c.studentId === student.id && c.courseId === selectedCourse);
      return avg >= passing ? { student, avg: avg.toFixed(1), hasCertificate } : null;
    }).filter(Boolean);
  }, [selectedCourse, students, grades, certificates, courses]);

  const filteredCertificates = certificates.filter(c => 
    !search || 
    students.find(s => s.id === c.studentId)?.name.includes(search) ||
    courses.find(co => co.id === c.courseId)?.name.includes(search) ||
    c.certificateNumber.includes(search)
  );

  const issueCertificate = (studentId: string) => {
    if (!selectedCourse) return;
    const course = courses.find(c => c.id === selectedCourse)!;
    // FIX: removed unused 'student' variable — studentId used directly in cert object
    const studentData = eligibleStudents.find(s => s?.student.id === studentId);
    if (!studentData || !course.hasCertificate) return;

    const cert: Certificate = {
      id: Date.now().toString(),
      studentId,
      courseId: selectedCourse,
      certificateNumber: `CERT-${course.code}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      issueDate: new Date().toISOString().split('T')[0],
      grade: Number(studentData.avg),
      verificationUrl: `https://academy.com/verify/CERT-${course.code}-${Date.now()}`,
      blockchainHash: `0x${Math.random().toString(36).substr(2, 32)}`,
      institutionLogo: course.partnerInstitutionId || '🎓',
      skills: course.skills || [],
      linkedinShared: false,
    };

    onUpdateCertificates([...certificates, cert]);
    alert(`✅ تم إصدار الشهادة!\nرقم الشهادة: ${cert.certificateNumber}\nيمكن التحقق منها على: ${cert.verificationUrl}`);
  };

  const shareToLinkedIn = (cert: Certificate) => {
    // FIX: removed unused 'student' variable
    const course = courses.find(c => c.id === cert.courseId);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cert.verificationUrl)}&title=${encodeURIComponent(`حصلت على شهادة في ${course?.name}`)}`;
    window.open(linkedInUrl, '_blank');
    onUpdateCertificates(certificates.map(c => c.id === cert.id ? { ...c, linkedinShared: true } : c));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">🏆 مركز الشهادات</h2>
        <p className="text-slate-500">إصدار شهادات إكمال الكورسات مع التحقق الرقمي ودعم LinkedIn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-5 text-white">
          <p className="text-amber-100 text-sm">إجمالي الشهادات</p>
          <p className="text-3xl font-bold">{certificates.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white">
          <p className="text-blue-100 text-sm">مشاركة LinkedIn</p>
          <p className="text-3xl font-bold">{certificates.filter(c => c.linkedinShared).length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white">
          <p className="text-emerald-100 text-sm">مدعومة بمؤسسات</p>
          <p className="text-3xl font-bold">{courses.filter(c => c.hasCertificate).length}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl p-5 text-white">
          <p className="text-violet-100 text-sm">معدل الإكمال</p>
          <p className="text-3xl font-bold">{students.length > 0 ? Math.round((certificates.length / students.length) * 100) : 0}%</p>
        </div>
      </div>

      {/* Issue Certificate */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">🎓 إصدار شهادة جديدة</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">اختر الكورس</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- اختر كورس --</option>
              {courses.filter(c => c.hasCertificate).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code}) - درجة النجاح {c.passingGrade}%</option>
              ))}
            </select>

            <div className="mt-4 bg-blue-50 rounded-2xl p-4 text-sm">
              <p className="font-bold text-blue-800 mb-1">شروط الحصول على الشهادة:</p>
              <ul className="space-y-1 text-blue-700 text-xs">
                <li>✓ إكمال جميع الدروس</li>
                <li>✓ الحصول على {courses.find(c => c.id === selectedCourse)?.passingGrade || 70}% كحد أدنى</li>
                <li>✓ اجتياز الاختبار النهائي</li>
                <li>✓ دفع الرسوم كاملة</li>
              </ul>
            </div>
          </div>

          <div>
            {selectedCourse && eligibleStudents.length > 0 ? (
              <div>
                <h4 className="font-semibold text-slate-700 mb-3">الطلاب المؤهلون ({eligibleStudents.length})</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {eligibleStudents.map(item => item && (
                    <div key={item.student.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-slate-700">{item.student.name}</p>
                        <p className="text-xs text-slate-500">المعدل: <span className="font-bold text-emerald-600">{item.avg}%</span></p>
                      </div>
                      {item.hasCertificate ? (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">✓ تم الإصدار</span>
                      ) : (
                        <button onClick={() => issueCertificate(item.student.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                          إصدار
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedCourse ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                لا يوجد طلاب مؤهلون بعد
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                اختر كورساً لعرض الطلاب المؤهلين
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">🎨 قوالب الشهادات المتاحة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map(t => (
            <div key={t.id} className={`bg-gradient-to-br ${t.color} rounded-2xl p-6 text-white text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <div className="relative">
                <div className="text-4xl mb-2">{t.icon}</div>
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-[10px] opacity-80 mt-1">شهادة إكمال</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">📜 الشهادات المصدرة ({certificates.length})</h3>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث برقم الشهادة أو اسم الطالب..."
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-72"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">رقم الشهادة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الطالب</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الكورس</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">التاريخ</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الدرجة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">LinkedIn</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map(cert => {
                const stu = students.find(s => s.id === cert.studentId);
                const course = courses.find(c => c.id === cert.courseId);
                return (
                  <tr key={cert.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-xs text-blue-600">{cert.certificateNumber}</td>
                    <td className="px-4 py-2 font-medium">{stu?.name || '-'}</td>
                    <td className="px-4 py-2">{course?.name || '-'}</td>
                    <td className="px-4 py-2">{cert.issueDate}</td>
                    <td className="px-4 py-2 font-bold text-emerald-600">{cert.grade}%</td>
                    <td className="px-4 py-2">
                      {cert.linkedinShared ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">✓ تمت المشاركة</span>
                      ) : (
                        <button onClick={() => shareToLinkedIn(cert)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700">
                          مشاركة
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => window.open(cert.verificationUrl, '_blank')} className="text-emerald-600 hover:text-emerald-800 text-xs">
                        🔗 تحقق
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
