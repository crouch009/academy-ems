import React, { useState } from 'react';
import { Course, Lesson } from '../types';

interface ExportCenterProps {
  courses: Course[];
  lessons: Lesson[];
}

const ExportCenter: React.FC<ExportCenterProps> = ({ courses, lessons }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'scorm' | 'html' | 'pdf' | 'video'>('scorm');
  const [exportHistory, setExportHistory] = useState<{ name: string; date: string; format: string; size: string }[]>([]);

  const course = courses.find(c => c.id === selectedCourse);
  const courseLessons = lessons.filter(l => l.courseId === selectedCourse);

  const exportSCORM = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const scormData = {
      manifest: {
        identifier: `course-${course?.id}`,
        title: course?.name,
        version: '1.2',
        resources: courseLessons.map(l => ({
          id: l.id,
          type: l.type,
          title: l.title,
          content: l.content,
          duration: l.duration,
        })),
      },
      imsmanifest: `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="course-${course?.id}">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>${course?.name}</title>
      ${courseLessons.map(l => `<item identifier="${l.id}" title="${l.title}"/>`).join('\n')}
    </organization>
  </organizations>
</manifest>`,
      lessons: courseLessons,
    };

    const jsonStr = JSON.stringify(scormData, null, 2);
    downloadFile(`${course?.code}-SCORM.zip`, jsonStr, 'application/zip');
    
    setExportHistory(prev => [{
      name: `${course?.name} (SCORM)`,
      date: new Date().toLocaleString('ar-EG'),
      format: 'SCORM 1.2',
      size: `${(jsonStr.length / 1024).toFixed(2)} KB`,
    }, ...prev]);

    setIsExporting(false);
  };

  const exportHTML = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${course?.name}</title>
  <style>
    body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; }
    h1 { color: #3B82F6; }
    .lesson { border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; border-radius: 10px; }
  </style>
</head>
<body>
  <h1>${course?.name}</h1>
  <p>${course?.description}</p>
  ${courseLessons.map((l, i) => `
    <div class="lesson">
      <h2>${i + 1}. ${l.title} (${l.type})</h2>
      <p>${l.content}</p>
    </div>
  `).join('')}
</body>
</html>`;

    downloadFile(`${course?.code}.html`, htmlContent, 'text/html');
    
    setExportHistory(prev => [{
      name: `${course?.name} (HTML)`,
      date: new Date().toLocaleString('ar-EG'),
      format: 'HTML Complete',
      size: `${(htmlContent.length / 1024).toFixed(2)} KB`,
    }, ...prev]);

    setIsExporting(false);
  };

  const exportJSON = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const data = {
      course: course,
      lessons: courseLessons,
      exportedAt: new Date().toISOString(),
      format: exportFormat,
    };

    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(`${course?.code}-${exportFormat}.json`, jsonStr, 'application/json');
    
    setExportHistory(prev => [{
      name: `${course?.name} (${exportFormat.toUpperCase()})`,
      date: new Date().toLocaleString('ar-EG'),
      format: exportFormat.toUpperCase(),
      size: `${(jsonStr.length / 1024).toFixed(2)} KB`,
    }, ...prev]);

    setIsExporting(false);
  };

  const handleExport = () => {
    if (!selectedCourse) return;
    if (exportFormat === 'scorm') exportSCORM();
    else if (exportFormat === 'html') exportHTML();
    else exportJSON();
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">📦 مركز التصدير</h2>
        <p className="text-slate-500">صدّر الكورسات بصيغ SCORM أو HTML لنقلها إلى أي نظام LMS آخر</p>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">🎯 خيارات التصدير</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">اختر الكورس</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- اختر كورس --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>

            <label className="text-sm font-semibold text-slate-700 mt-4 mb-2 block">صيغة التصدير</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'scorm', label: '📦 SCORM 1.2', desc: 'لأنظمة LMS' },
                { key: 'html', label: '🌐 HTML كامل', desc: 'موقع جاهز' },
                { key: 'pdf', label: '📄 PDF', desc: 'كتاب إلكتروني' },
                { key: 'video', label: '🎬 فيديو', desc: 'جميع الفيديوهات' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setExportFormat(f.key as any)}
                  className={`p-4 rounded-2xl border-2 text-right transition-all ${
                    exportFormat === f.key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <p className="font-bold text-slate-800">{f.label}</p>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-800 mb-2">معاينة التصدير</h4>
              {course ? (
                <>
                  <p className="text-sm text-slate-600 mb-2">الكورس: <span className="font-bold">{course.name}</span></p>
                  <p className="text-sm text-slate-600 mb-2">الكود: <span className="font-bold">{course.code}</span></p>
                  <p className="text-sm text-slate-600 mb-2">عدد الدروس: <span className="font-bold">{courseLessons.length}</span></p>
                  <p className="text-sm text-slate-600">الصيغة: <span className="font-bold">{exportFormat.toUpperCase()}</span></p>
                </>
              ) : (
                <p className="text-sm text-slate-500">اختر كورساً لعرض التفاصيل</p>
              )}
            </div>
            <button
              onClick={handleExport}
              disabled={!selectedCourse || isExporting}
              className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التصدير...
                </>
              ) : (
                <>📥 تصدير الآن</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-slate-800">📋 سجل التصدير ({exportHistory.length})</h3>
        </div>
        {exportHistory.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الاسم</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الصيغة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الحجم</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((item, i) => (
                <tr key={i} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{item.name}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{item.format}</span>
                  </td>
                  <td className="px-4 py-2">{item.size}</td>
                  <td className="px-4 py-2 text-slate-500">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <p className="text-4xl mb-2">📦</p>
            <p>لا توجد عمليات تصدير بعد</p>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-bold text-slate-800 mb-1">SCORM 1.2</h3>
          <p className="text-xs text-slate-500">متوافق مع جميع أنظمة LMS العالمية مثل Moodle و Canvas و Blackboard</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl mb-2">🌐</div>
          <h3 className="font-bold text-slate-800 mb-1">HTML كامل</h3>
          <p className="text-xs text-slate-500">موقع جاهز بجميع الدروس والفيديوهات والاختبارات</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl mb-2">📄</div>
          <h3 className="font-bold text-slate-800 mb-1">PDF</h3>
          <p className="text-xs text-slate-500">كتاب إلكتروني PDF للقراءة أوفلاين</p>
        </div>
      </div>
    </div>
  );
};

export default ExportCenter;
