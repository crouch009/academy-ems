import React, { useState, useMemo } from 'react';
import { Student, Course, AttendanceRecord } from '../types';

interface AttendanceProps {
  students: Student[];
  courses: Course[];
  attendance: AttendanceRecord[];
  onUpdate: (attendance: AttendanceRecord[]) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ students, courses, attendance, onUpdate }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'take' | 'records'>('take');

  const courseStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return students.filter(s => s.courseId === selectedCourse);
  }, [students, selectedCourse]);

  const handleMarkAttendance = (studentId: string, status: 'حاضر' | 'غائب' | 'متأخر' | 'بعذر') => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.courseId === selectedCourse && a.date === selectedDate);
    let newAttendance = [...attendance];
    if (existingIndex >= 0) {
      newAttendance[existingIndex] = { ...newAttendance[existingIndex], status };
    } else {
      newAttendance.push({
        id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
        studentId, courseId: selectedCourse, date: selectedDate, status, notes: '',
      });
    }
    onUpdate(newAttendance);
  };

  const getStudentStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.courseId === selectedCourse && a.date === selectedDate);
    return record?.status || '';
  };

  const attendanceStats = useMemo(() => {
    if (!selectedCourse) return { حاضر: 0, غائب: 0, متأخر: 0, بعذر: 0, total: 0 };
    const records = attendance.filter(a => a.courseId === selectedCourse && a.date === selectedDate);
    return {
      حاضر: records.filter(r => r.status === 'حاضر').length,
      غائب: records.filter(r => r.status === 'غائب').length,
      متأخر: records.filter(r => r.status === 'متأخر').length,
      بعذر: records.filter(r => r.status === 'بعذر').length,
      total: records.length,
    };
  }, [attendance, selectedCourse, selectedDate]);

  const statusColors: Record<string, string> = {
    'حاضر': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'غائب': 'bg-red-100 text-red-700 border-red-300',
    'متأخر': 'bg-amber-100 text-amber-700 border-amber-300',
    'بعذر': 'bg-blue-100 text-blue-700 border-blue-300',
  };

  const statusBtnColors: Record<string, string> = {
    'حاضر': 'bg-emerald-500 text-white',
    'غائب': 'bg-red-500 text-white',
    'متأخر': 'bg-amber-500 text-white',
    'بعذر': 'bg-blue-500 text-white',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">تسجيل الحضور والغياب</h2>
        <p className="text-slate-500">تتبع حضور الطلاب يومياً</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setViewMode('take')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === 'take' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          تسجيل الحضور
        </button>
        <button onClick={() => setViewMode('records')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === 'records' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          السجلات
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اختر الكورس</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">-- اختر كورس --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          {selectedCourse && (
            <div className="flex items-end gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400">حاضر</p>
                <p className="text-lg font-bold text-emerald-600">{attendanceStats.حاضر}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">غائب</p>
                <p className="text-lg font-bold text-red-600">{attendanceStats.غائب}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">متأخر</p>
                <p className="text-lg font-bold text-amber-600">{attendanceStats.متأخر}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">بعذر</p>
                <p className="text-lg font-bold text-blue-600">{attendanceStats.بعذر}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'take' && (
        <>
          {!selectedCourse ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
              <p className="text-4xl mb-2">📋</p>
              <p>اختر كورس لتسجيل الحضور</p>
            </div>
          ) : courseStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
              <p className="text-4xl mb-2">👥</p>
              <p>لا يوجد طلاب مسجلين في هذا الكورس</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseStudents.map(student => {
                const currentStatus = getStudentStatus(student.id);
                return (
                  <div key={student.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${student.gender === 'ذكر' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(['حاضر', 'غائب', 'متأخر', 'بعذر'] as const).map(status => (
                          <button key={status} onClick={() => handleMarkAttendance(student.id, status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentStatus === status ? statusBtnColors[status] + ' shadow-md scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {viewMode === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">التاريخ</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">الكورس</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">الطالب</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400"><p className="text-4xl mb-2">📊</p><p>لا توجد سجلات حضور</p></td></tr>
                ) : attendance.slice().reverse().map(record => {
                  const student = students.find(s => s.id === record.studentId);
                  const course = courses.find(c => c.id === record.courseId);
                  return (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-6 py-3 text-slate-600">{record.date}</td>
                      <td className="px-6 py-3 text-slate-600">{course?.name || 'غير محدد'}</td>
                      <td className="px-6 py-3 font-medium text-slate-700">{student?.name || 'غير محدد'}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${statusColors[record.status]}`}>{record.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
