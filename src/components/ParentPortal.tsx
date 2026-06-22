import React, { useState, useMemo } from 'react';
import { Parent, Student, Course, GradeRecord, AttendanceRecord } from '../types';

interface ParentPortalProps {
  parents: Parent[];
  students: Student[];
  courses: Course[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  onUpdateParents: (parents: Parent[]) => void;
}

const ParentPortal: React.FC<ParentPortalProps> = ({ parents, students, courses, grades, attendance, onUpdateParents }) => {
  const [selectedParent, setSelectedParent] = useState('');

  const parentData = useMemo(() => {
    const parent = parents.find(p => p.id === selectedParent);
    if (!parent) return null;
    const children = students.filter(s => parent.childrenIds.includes(s.id));
    
    const childrenDetails = children.map(child => {
      const childCourses = courses.filter(c => child.enrolledCourses?.includes(c.id) || c.id === child.courseId);
      const childGrades = grades.filter(g => g.studentId === child.id);
      const avgGrade = childGrades.length > 0 
        ? (childGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / childGrades.length).toFixed(1) 
        : '0';
      const childAttendance = attendance.filter(a => a.studentId === child.id);
      const attendanceRate = childAttendance.length > 0
        ? ((childAttendance.filter(a => a.status === 'حاضر').length / childAttendance.length) * 100).toFixed(1)
        : '0';
      return { child, childCourses, avgGrade, attendanceRate, childGrades };
    });

    return { parent, childrenDetails };
  }, [selectedParent, parents, students, courses, grades, attendance]);

  const handleCreateParent = () => {
    const name = prompt('اسم ولي الأمر:');
    const email = prompt('البريد الإلكتروني:');
    const phone = prompt('رقم الهاتف:');
    if (!name || !email) return;

    const newParent: Parent = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      childrenIds: [],
      notificationPreferences: {
        weeklyProgress: true,
        gradeUpdates: true,
        attendanceAlerts: true,
      },
    };
    onUpdateParents([...parents, newParent]);
    alert('تم إضافة ولي الأمر');
  };

  const linkChild = (parentId: string) => {
    const childEmail = prompt('ادخل بريد الطالب لربطه:');
    if (!childEmail) return;
    const child = students.find(s => s.email === childEmail);
    if (!child) {
      alert('لم يتم العثور على طالب بهذا البريد');
      return;
    }
    onUpdateParents(parents.map(p => p.id === parentId ? { ...p, childrenIds: [...p.childrenIds, child.id] } : p));
    alert('تم ربط الطالب بولي الأمر');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">👨‍👩‍👧‍👦 بوابة أولياء الأمور</h2>
        <p className="text-slate-500">تابع تقدم أبنائك وتواصل مع المدرسين - شراكة تعليمية فعالة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">👨‍👩‍👦</div>
          <p className="text-pink-100 text-sm">أولياء الأمور</p>
          <p className="text-3xl font-bold">{parents.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">👶</div>
          <p className="text-blue-100 text-sm">الأبناء المرتبطين</p>
          <p className="text-3xl font-bold">{parents.reduce((a, p) => a + p.childrenIds.length, 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">📈</div>
          <p className="text-emerald-100 text-sm">متوسط التقدم</p>
          <p className="text-3xl font-bold">85%</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-3xl p-5 text-white">
          <div className="text-3xl mb-2">🔔</div>
          <p className="text-violet-100 text-sm">إشعارات الأسبوع</p>
          <p className="text-3xl font-bold">24</p>
        </div>
      </div>

      {/* Parent Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">اختر ولي الأمر</h3>
          <button onClick={handleCreateParent} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl text-sm font-semibold">
            + إضافة ولي أمر
          </button>
        </div>
        <select
          value={selectedParent}
          onChange={e => setSelectedParent(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500"
        >
          <option value="">-- اختر ولي أمر --</option>
          {parents.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.childrenIds.length} أبناء)</option>
          ))}
        </select>
      </div>

      {selectedParent && parentData && (
        <>
          {/* Parent Info & Notification Preferences */}
          <div className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-3xl border border-pink-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {parentData.parent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{parentData.parent.name}</h3>
                  <p className="text-sm text-slate-500">{parentData.parent.email}</p>
                  <p className="text-xs text-slate-500">{parentData.parent.phone}</p>
                </div>
              </div>
              <button onClick={() => linkChild(parentData.parent.id)} className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-semibold">
                ربط طالب
              </button>
            </div>

            {/* Notification Preferences */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-3 rounded-2xl flex items-center gap-2 ${parentData.parent.notificationPreferences.weeklyProgress ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${parentData.parent.notificationPreferences.weeklyProgress ? 'bg-emerald-500 text-white' : 'bg-slate-300'}`}>
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm">تقرير أسبوعي</p>
                  <p className="text-xs text-slate-500">تقدم الأبناء أسبوعياً</p>
                </div>
              </div>
              <div className={`p-3 rounded-2xl flex items-center gap-2 ${parentData.parent.notificationPreferences.gradeUpdates ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${parentData.parent.notificationPreferences.gradeUpdates ? 'bg-blue-500 text-white' : 'bg-slate-300'}`}>
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm">تحديثات الدرجات</p>
                  <p className="text-xs text-slate-500">عند نزول درجة جديدة</p>
                </div>
              </div>
              <div className={`p-3 rounded-2xl flex items-center gap-2 ${parentData.parent.notificationPreferences.attendanceAlerts ? 'bg-amber-100' : 'bg-slate-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${parentData.parent.notificationPreferences.attendanceAlerts ? 'bg-amber-500 text-white' : 'bg-slate-300'}`}>
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm">تنبيهات الحضور</p>
                  <p className="text-xs text-slate-500">الغياب والتأخر</p>
                </div>
              </div>
            </div>
          </div>

          {/* Children Progress */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span className="text-2xl">👶</span>
              الأبناء ({parentData.childrenDetails.length})
            </h3>
            {parentData.childrenDetails.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                <div className="text-5xl mb-2">👶</div>
                <p>لا يوجد أبناء مرتبطين بهذا الحساب</p>
                <button onClick={() => linkChild(parentData.parent.id)} className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-xl font-semibold">
                  ربط طالب الآن
                </button>
              </div>
            ) : (
              parentData.childrenDetails.map(({ child, childCourses, avgGrade, attendanceRate, childGrades }) => (
                <div key={child.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{child.name}</h4>
                        <p className="text-xs text-slate-500">{child.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      child.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {child.status}
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-2xl p-3 text-center">
                      <p className="text-xs text-slate-500">الدرجة المتوسطة</p>
                      <p className="text-xl font-bold text-blue-700">{avgGrade}%</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                      <p className="text-xs text-slate-500">نسبة الحضور</p>
                      <p className="text-xl font-bold text-emerald-700">{attendanceRate}%</p>
                    </div>
                    <div className="bg-violet-50 rounded-2xl p-3 text-center">
                      <p className="text-xs text-slate-500">الكورسات</p>
                      <p className="text-xl font-bold text-violet-700">{childCourses.length}</p>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">الكورسات المسجلة:</p>
                    <div className="flex flex-wrap gap-2">
                      {childCourses.map(c => (
                        <span key={c.id} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recent Grades */}
                  {childGrades.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">آخر الدرجات:</p>
                      <div className="space-y-2">
                        {childGrades.slice(-3).reverse().map(grade => (
                          <div key={grade.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                            <div>
                              <p className="font-medium text-sm">{grade.examName}</p>
                              <p className="text-xs text-slate-500">{grade.date}</p>
                            </div>
                            <div className="text-right">
                              <span className={`font-bold text-sm ${
                                (grade.score / grade.maxScore) * 100 >= 85 ? 'text-emerald-600' :
                                (grade.score / grade.maxScore) * 100 >= 70 ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                {grade.score}/{grade.maxScore}
                              </span>
                              <p className="text-xs text-slate-500">
                                {((grade.score / grade.maxScore) * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                      📧 مراسلة المدرس
                    </button>
                    <button className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                      📥 تحميل التقرير
                    </button>
                    <button className="flex-1 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700">
                      📅 جدولة اجتماع
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Communication */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">💬 التواصل مع المدرسين</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    أ
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-800">د. أحمد محمد</p>
                    <p className="text-xs text-slate-500 mb-1">مدرس - أساسيات البرمجة</p>
                    <p className="text-sm text-slate-700">تم تقييم ابنكم محمد في آخر اختبار بنسبة ممتازة. أحيك على متابعتكم له.</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <textarea 
                  placeholder="اكتب رسالة للمدرسين..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button className="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-semibold hover:bg-pink-700">
                    إرسال
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!selectedParent && parents.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">مرحباً بك في بوابة أولياء الأمور</h3>
          <p className="text-slate-500 mb-4">يمكنك متابعة تقدم أبنائك في الكورسات والتواصل مع المدرسين</p>
          <button onClick={handleCreateParent} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-2xl font-semibold hover:from-pink-600 hover:to-violet-600">
            إضافة ولي أمر جديد
          </button>
        </div>
      )}
    </div>
  );
};

export default ParentPortal;
