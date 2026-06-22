import React, { useState, useRef } from 'react';
import { Course, Lesson } from '../types';

interface AICourseBuilderProps {
  courses: Course[];
  lessons: Lesson[];
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateLessons: (lessons: Lesson[]) => void;
}

const CURRENCIES = ['SAR', 'AED', 'USD', 'EGP', 'JOD', 'KWD'];

const AICourseBuilder: React.FC<AICourseBuilderProps> = ({ courses, lessons, onUpdateCourses, onUpdateLessons }) => {
  const [activeMethod, setActiveMethod] = useState<'pdf' | 'idea' | 'manual'>('idea');
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<{ course: Partial<Course>; lessons: Partial<Lesson>[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [difficulty, setDifficulty] = useState<'مبتدئ' | 'متوسط' | 'متقدم'>('مبتدئ');
  const [lessonCount, setLessonCount] = useState(8);

  const generateFromIdea = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    
    // محاكاة الذكاء الاصطناعي مع توليد محتوى واقعي
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const courseName = idea.split(' ').slice(0, 5).join(' ');
    const lessonsData = generateLessonsFromTopic(courseName, lessonCount);
    
    setGeneratedCourse({
      course: {
        name: `احترف ${courseName}`,
        code: `AI${Date.now().toString().slice(-4)}`,
        description: `كورس شامل في ${idea} - تم إنشاؤه بالذكاء الاصطناعي`,
        price: 299,
        currency: currency as any,
        duration: lessonCount,
        language: language,
        aiGenerated: true,
        aiSourceType: 'idea',
        aiSourceContent: idea,
        hasAIChatbot: true,
        hasFlashcards: true,
        hasAIVideos: true,
        status: 'نشط',
      },
      lessons: lessonsData,
    });
    
    setIsGenerating(false);
  };

  const generateFromPDF = async (file: File) => {
    setIsGenerating(true);
    setUploadedFileName(file.name);
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const topic = file.name.replace('.pdf', '').replace(/[_-]/g, ' ');
    const lessonsData = generateLessonsFromTopic(topic, lessonCount);
    
    setGeneratedCourse({
      course: {
        name: `كورس ${topic}`,
        code: `PDF${Date.now().toString().slice(-4)}`,
        description: `تم استخراج هذا الكورس من ملف ${file.name}`,
        price: 199,
        currency: currency as any,
        duration: lessonCount,
        language: language,
        aiGenerated: true,
        aiSourceType: 'pdf',
        aiSourceContent: file.name,
        hasAIChatbot: true,
        hasFlashcards: true,
        hasAIVideos: true,
        status: 'نشط',
      },
      lessons: lessonsData,
    });
    
    setIsGenerating(false);
  };

  const saveCourse = () => {
    if (!generatedCourse) return;
    
    const courseId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    
    const newCourse: Course = {
      id: courseId,
      name: generatedCourse.course.name || '',
      code: generatedCourse.course.code || '',
      description: generatedCourse.course.description || '',
      instructorId: '',
      capacity: 50,
      enrolledCount: 0,
      price: generatedCourse.course.price || 0,
      currency: generatedCourse.course.currency || 'SAR',
      duration: generatedCourse.course.duration || 8,
      schedule: [{ day: 'الأحد', startTime: '19:00', endTime: '20:30', room: 'عبر الإنترنت' }],
      status: 'نشط',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][Math.floor(Math.random() * 5)],
      language: language,
      aiGenerated: true,
      aiSourceType: generatedCourse.course.aiSourceType,
      aiSourceContent: generatedCourse.course.aiSourceContent,
      hasAIChatbot: generatedCourse.course.hasAIChatbot,
      hasFlashcards: generatedCourse.course.hasFlashcards,
      hasAIVideos: generatedCourse.course.hasAIVideos,
      // FIX: missing required Course fields — caused TS2739
      level: generatedCourse.course.level || 'مبتدئ',
      hasCertificate: generatedCourse.course.hasCertificate ?? true,
      passingGrade: generatedCourse.course.passingGrade ?? 60,
    };
    
    onUpdateCourses([...courses, newCourse]);
    
    const newLessons: Lesson[] = generatedCourse.lessons.map((l, idx) => ({
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) + idx,
      courseId,
      title: l.title || '',
      type: (l.type as Lesson['type']) || 'شرح نصي',
      content: l.content || '',
      duration: l.duration || '15 دقيقة',
      order: idx + 1,
      isPublished: true,
      isLocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      aiGenerated: true,
    }));
    
    onUpdateLessons([...lessons, ...newLessons]);
    setGeneratedCourse(null);
    setIdea('');
    setUploadedFileName('');
    alert(`✅ تم إنشاء الكورس بنجاح!\n${newCourse.name}\n${newLessons.length} درس`); 
   };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">🤖 منشئ الكورس بالذكاء الاصطناعي</h2>
        <p className="text-slate-500">حوّل أفكارك أو ملفات PDF إلى كورسات جاهزة في ثوانٍ</p>
      </div>

      {/* Method Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveMethod('idea')}
            className={`p-5 rounded-2xl border-2 text-center transition-all ${
              activeMethod === 'idea' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-3">💡</div>
            <h3 className="font-bold text-slate-800 mb-1">اكتب فكرة</h3>
            <p className="text-xs text-slate-500">صف الكورس بجملة واحدة</p>
          </button>
          
          <button
            onClick={() => setActiveMethod('pdf')}
            className={`p-5 rounded-2xl border-2 text-center transition-all ${
              activeMethod === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-bold text-slate-800 mb-1">ارفع PDF</h3>
            <p className="text-xs text-slate-500">استخراج المحتوى تلقائياً</p>
          </button>
          
          <button
            onClick={() => setActiveMethod('manual')}
            className={`p-5 rounded-2xl border-2 text-center transition-all ${
              activeMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-3">✍️</div>
            <h3 className="font-bold text-slate-800 mb-1">إنشاء يدوي</h3>
            <p className="text-xs text-slate-500">بدون الذكاء الاصطناعي</p>
          </button>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">إعدادات التوليد</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">اللغة</label>
            <select value={language} onChange={e => setLanguage(e.target.value as 'ar' | 'en')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">العملة</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">عدد الدروس</label>
            <input type="number" min="3" max="20" value={lessonCount} onChange={e => setLessonCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">المستوى</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option>مبتدئ</option>
              <option>متوسط</option>
              <option>متقدم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input Area */}
      {activeMethod === 'idea' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3">💡 اكتب فكرة الكورس</h3>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="مثال: كورس شامل لتعليم تطوير تطبيقات الموبايل باستخدام React Native من الصفر حتى الاحتراف"
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={generateFromIdea}
            disabled={!idea.trim() || isGenerating}
            className="mt-4 w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري إنشاء الكورس...
              </>
            ) : (
              <>
                <span className="text-xl">✨</span>
                إنشاء الكورس بالذكاء الاصطناعي
              </>
            )}
          </button>
        </div>
      )}

      {activeMethod === 'pdf' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3">📄 ارفع ملف PDF</h3>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={e => e.target.files?.[0] && generateFromPDF(e.target.files[0])} className="hidden" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-500 cursor-pointer transition-colors"
          >
            {uploadedFileName ? (
              <>
                <div className="text-5xl mb-3">✅</div>
                <p className="font-semibold text-slate-700 mb-1">تم رفع الملف</p>
                <p className="text-sm text-slate-500">{uploadedFileName}</p>
                {isGenerating && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                    <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    جاري استخراج المحتوى...
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">📤</div>
                <p className="font-semibold text-slate-700 mb-1">اضغط لرفع ملف PDF</p>
                <p className="text-sm text-slate-500">سيقوم الذكاء الاصطناعي بتحليل الملف وإنشاء الكورس</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Generated Preview */}
      {generatedCourse && (
        <div className="bg-gradient-to-br from-blue-50 via-white to-violet-50 rounded-3xl border border-blue-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              الكورس جاهز!
            </h3>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              تم الإنشاء بالذكاء الاصطناعي
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">اسم الكورس</p>
              <p className="font-bold text-slate-800">{generatedCourse.course.name}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">الكود</p>
              <p className="font-bold text-slate-800">{generatedCourse.course.code}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">السعر</p>
              <p className="font-bold text-slate-800">{generatedCourse.course.price} {currency}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">عدد الدروس</p>
              <p className="font-bold text-slate-800">{generatedCourse.lessons.length} درس</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4">
            <p className="text-xs text-slate-500 mb-2">الدروس المولدة:</p>
            <div className="space-y-1 max-h-40 overflow-auto">
              {generatedCourse.lessons.slice(0, 10).map((l, i) => (
                <div key={i} className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="text-blue-500 font-bold">{i + 1}.</span>
                  {l.title}
                </div>
              ))}
              {generatedCourse.lessons.length > 10 && (
                <p className="text-xs text-slate-400 text-center mt-2">+{generatedCourse.lessons.length - 10} درس آخر</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setGeneratedCourse(null)} className="flex-1 py-3 bg-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-300">
              تجاهل
            </button>
            <button onClick={saveCourse} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-2xl hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30">
              ✅ حفظ الكورس
            </button>
          </div>
        </div>
      )}

      {/* Existing AI Courses */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">الكورسات الذكية الحالية ({courses.filter(c => c.aiGenerated).length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.filter(c => c.aiGenerated).map(c => (
            <div key={c.id} className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-4 border border-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🤖</span>
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">ذكي</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{c.name}</h4>
              <p className="text-xs text-slate-500 mb-2">{c.code} • {c.price} {c.currency}</p>
              <div className="flex items-center gap-2 text-[10px]">
                {c.hasAIChatbot && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">💬 شات</span>}
                {c.hasFlashcards && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">🎴 كاردز</span>}
                {c.hasAIVideos && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded">🎬 فيديو</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AI content generator (mock - would call actual API in production)
function generateLessonsFromTopic(topic: string, count: number): Partial<Lesson>[] {
  const lessonTemplates = [
    `مقدمة في ${topic}`,
    `أساسيات ${topic} - الجزء الأول`,
    `أساسيات ${topic} - الجزء الثاني`,
    `أدوات العمل في ${topic}`,
    `أفضل الممارسات`,
    `حالات عملية وتطبيقية`,
    `المشاريع المتقدمة`,
    `نصائح للمحترفين`,
    `الأخطاء الشائعة وكيفية تجنبها`,
    `${topic} في العالم الواقعي`,
    `التكامل مع أنظمة أخرى`,
    `اختبار وتقييم المشاريع`,
    `النشر والتوزيع`,
    `الصيانة والتحديث`,
    `اتجاهات المستقبل`,
    `مشروع تطبيقي شامل`,
    `أسئلة وأجوبة`,
    `خاتمة وتوصيات`,
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    title: lessonTemplates[i % lessonTemplates.length],
    type: i % 4 === 0 ? 'فيديو' : i % 4 === 1 ? 'شرح نصي' : i % 4 === 2 ? 'تمرين' : 'اختبار',
    content: `محتوى الدرس رقم ${i + 1} في ${topic}. تم إنشاؤه بواسطة الذكاء الاصطناعي.\n\nهذا الدرس يغطي الجوانب الأساسية والمتقدمة بأسلوب تفاعلي ومناسب لجميع المستويات.`,
    duration: `${15 + Math.floor(Math.random() * 30)} دقيقة`,
  }));
}

export default AICourseBuilder;
