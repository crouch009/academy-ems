import React, { useMemo } from 'react';
import { Student, Course, Instructor, AttendanceRecord, GradeRecord, PaymentRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';

interface ReportsProps {
  students: Student[];
  courses: Course[];
  instructors: Instructor[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  payments: PaymentRecord[];
}

const Reports: React.FC<ReportsProps> = ({ students, courses, instructors, attendance, grades, payments }) => {
  const coursePerformance = useMemo(() => {
    return courses.map(course => {
      const courseGrades = grades.filter(g => g.courseId === course.id);
      const avgScore = courseGrades.length > 0
        ? courseGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / courseGrades.length
        : 0;
      const courseAttendance = attendance.filter(a => a.courseId === course.id);
      const attendRate = courseAttendance.length > 0
        ? (courseAttendance.filter(a => a.status === 'حاضر').length / courseAttendance.length) * 100
        : 0;
      return {
        name: course.name.substring(0, 15),
        enrolled: course.enrolledCount,
        avgScore: avgScore.toFixed(1),
        attendance: attendRate.toFixed(1),
        income: course.enrolledCount * course.price,
      };
    });
  }, [courses, grades, attendance]);

  const topStudents = useMemo(() => {
    const studentData = students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id);
      const avg = studentGrades.length > 0
        ? studentGrades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / studentGrades.length
        : 0;
      return { name: student.name, avg: avg.toFixed(1) };
    }).filter(s => Number(s.avg) > 0).sort((a, b) => Number(b.avg) - Number(a.avg)).slice(0, 5);
    return studentData;
  }, [students, grades]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">التقارير والتحليلات</h2>
        <p className="text-slate-500">تحليلات شاملة لأداء المؤسسة</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">📊</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">صحي</span>
          </div>
          <p className="text-sm text-slate-500">متوسط الحضور العام</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {attendance.length > 0 ? ((attendance.filter(a => a.status === 'حاضر').length / attendance.length) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🎯</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">جيد</span>
          </div>
          <p className="text-sm text-slate-500">متوسط الدرجات العام</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {grades.length > 0 ? (grades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / grades.length).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-sm text-slate-500">نسبة الإكمال</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {courses.length > 0 ? ((courses.filter(c => c.status === 'مكتمل').length / courses.length) * 100).toFixed(0) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-sm text-slate-500">إيرادات الكورسات</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {courses.reduce((a, c) => a + c.enrolledCount * c.price, 0).toLocaleString()} ج.م
          </p>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">أداء الكورسات</h3>
        {coursePerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="enrolled" fill="#3B82F6" name="الطلاب" radius={[6, 6, 0, 0]} />
              <Bar dataKey="avgScore" fill="#10B981" name="متوسط الدرجات" radius={[6, 6, 0, 0]} />
              <Bar dataKey="attendance" fill="#F59E0B" name="نسبة الحضور" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-slate-400"><p className="text-4xl mb-2">📊</p><p>لا توجد بيانات كافية</p></div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">🏆 أفضل 5 طلاب</h3>
          {topStudents.length > 0 ? (
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-300 text-slate-700'}`}>
                      {i + 1}
                    </div>
                    <span className="font-medium text-slate-700">{s.name}</span>
                  </div>
                  <span className={`font-bold ${Number(s.avg) >= 85 ? 'text-emerald-600' : Number(s.avg) >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {s.avg}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400"><p>لا توجد درجات مسجلة</p></div>
          )}
        </div>

        {/* Instructor Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">👨‍🏫 أداء المدرسين</h3>
          <div className="space-y-3">
            {instructors.map(instructor => {
              const instCourses = courses.filter(c => c.instructorId === instructor.id);
              const totalStudents = instCourses.reduce((a, c) => a + c.enrolledCount, 0);
              const totalRevenue = instCourses.reduce((a, c) => a + c.enrolledCount * c.price, 0);
              return (
                <div key={instructor.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold">
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">{instructor.name}</p>
                        <p className="text-xs text-slate-400">{instructor.specialty}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${instructor.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {instructor.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white rounded-lg p-2"><p className="text-slate-400">كورسات</p><p className="font-bold text-slate-700">{instCourses.length}</p></div>
                    <div className="bg-white rounded-lg p-2"><p className="text-slate-400">طلاب</p><p className="font-bold text-slate-700">{totalStudents}</p></div>
                    <div className="bg-white rounded-lg p-2"><p className="text-slate-400">إيرادات</p><p className="font-bold text-slate-700">{totalRevenue.toLocaleString()}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Radar Chart for KPIs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📐 مؤشرات الأداء الرئيسية</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={[
            { subject: 'رضا الطلاب', A: 85, full: 100 },
            { subject: 'الحضور', A: attendance.length > 0 ? (attendance.filter(a => a.status === 'حاضر').length / attendance.length) * 100 : 0, full: 100 },
            { subject: 'الدرجات', A: grades.length > 0 ? (grades.reduce((a, g) => a + (g.score / g.maxScore) * 100, 0) / grades.length) : 0, full: 100 },
            { subject: 'الإيرادات', A: payments.filter(p => p.status === 'مدفوع').length > 0 ? 75 : 0, full: 100 },
            { subject: 'نمو الطلاب', A: students.length > 0 ? Math.min((students.filter(s => s.status === 'نشط').length / students.length) * 100, 100) : 0, full: 100 },
            { subject: 'الكورسات', A: courses.length > 0 ? 80 : 0, full: 100 },
          ]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar name="الأداء" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;
