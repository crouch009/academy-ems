import React, { useState } from 'react';
import { Course, Lesson } from '../types';

interface MediaStudioProps {
  courses: Course[];
  lessons: Lesson[];
  onUpdateLessons: (lessons: Lesson[]) => void;
}

const AVATAR_STYLES = [
  { id: 'professional', label: 'احترافي', icon: '👨‍💼', desc: 'مظهر رسمي للدورات المهنية' },
  { id: 'friendly', label: 'ودود', icon: '😊', desc: 'مظهر ودي للدورات التفاعلية' },
  { id: 'teacher', label: 'مدرّس', icon: '👨‍🏫', desc: 'مظهر أكاديمي كلاسيكي' },
  { id: 'modern', label: 'عصري', icon: '🧑‍💻', desc: 'مظهر حديث للدورات التقنية' },
  { id: 'kid', label: 'طفل', icon: '🧒', desc: 'مظهر جذاب للأطفال' },
];

const MEDIA_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

const MediaStudio: React.FC<MediaStudioProps> = ({ courses, onUpdateLessons: _onUpdateLessons }) => { // FIX: onUpdateLessons unused — prefixed with _ to silence warning
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'flashcards' | 'avatar'>('image');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ id: string; colors: string[]; label: string; prompt: string }[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<{ id: string; title: string; duration: string; colors: string[] }[]>([]);
  const [avatarConfig, setAvatarConfig] = useState({
    script: '', avatar: 'professional', voice: 'ar-SA-Female', language: 'العربية',
  });
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<{ front: string; back: string; color: string }[]>([]);
  const [toast, setToast] = useState('');

  const show = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Generate image placeholder with gradient colors
  const generateImages = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    const imgs = Array.from({ length: 4 }, (_, i) => ({
      id: `img-${Date.now()}-${i}`,
      colors: [MEDIA_COLORS[i % MEDIA_COLORS.length], MEDIA_COLORS[(i + 3) % MEDIA_COLORS.length]],
      label: prompt.substring(0, 20),
      prompt,
    }));
    setGeneratedImages(prev => [...imgs, ...prev]);
    setIsGenerating(false);
    show('تم توليد 4 صور بنجاح! 🎨');
  };

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2500));
    setGeneratedVideos(prev => [{
      id: `vid-${Date.now()}`,
      title: prompt.substring(0, 40),
      duration: `${Math.floor(Math.random() * 5) + 1}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`,
      colors: [MEDIA_COLORS[Math.floor(Math.random() * MEDIA_COLORS.length)], MEDIA_COLORS[Math.floor(Math.random() * MEDIA_COLORS.length)]],
    }, ...prev]);
    setIsGenerating(false);
    show('تم توليد الفيديو بنجاح! 🎬');
  };

  const generateAvatarVideo = async () => {
    if (!avatarConfig.script.trim()) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 3000));
    setGeneratedVideos(prev => [{
      id: `avatar-${Date.now()}`,
      title: `شخصية ${AVATAR_STYLES.find(s => s.id === avatarConfig.avatar)?.label || ''} — ${avatarConfig.language}`,
      duration: `${Math.floor(Math.random() * 3) + 1}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`,
      colors: ['#6366F1', '#8B5CF6'],
    }, ...prev]);
    setIsGenerating(false);
    show('تم إنشاء الشخصية الافتراضية! 🧑‍🏫');
  };

  const generateFlashcards = async () => {
    if (!flashcardTopic.trim()) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    const t = flashcardTopic;
    setGeneratedFlashcards([
      { front: `ما هو ${t}؟`, back: `تعريف شامل عن ${t} مع الأمثلة والتطبيقات العملية`, color: MEDIA_COLORS[0] },
      { front: `لماذا ${t} مهم؟`, back: `الأهمية والفوائد العملية والنظرية في سوق العمل`, color: MEDIA_COLORS[1] },
      { front: `ما هي استخدامات ${t}؟`, back: `التطبيقات العملية في العالم الحقيقي والمشاريع الفعلية`, color: MEDIA_COLORS[2] },
      { front: `أفضل أدوات ${t}`, back: `الأدوات والمكتبات الأكثر استخداماً من قبل المحترفين`, color: MEDIA_COLORS[3] },
      { front: `كيف أتعلم ${t}؟`, back: `خطة تعليمية متدرجة من الصفر للإحتراف`, color: MEDIA_COLORS[4] },
      { front: `تحديات ${t} الشائعة`, back: `أهم التحديات وكيفية التغلب عليها بفعالية`, color: MEDIA_COLORS[5] },
    ]);
    setIsGenerating(false);
    show('تم توليد 6 بطاقات! 🎴');
  };

  // Image Placeholder Component
  const ImagePlaceholder = ({ colors, label, size = 'full' }: { colors: string[]; label: string; size?: string }) => (
    <div className={`${size === 'full' ? 'w-full h-40' : 'w-20 h-20'} rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden`}
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="relative z-10 text-center">
        <div className="text-3xl mb-1">🎨</div>
        <p className="text-xs font-bold opacity-80">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl">{toast}</div>}

      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-1">🎨 استوديو الوسائط الذكي</h2>
        <p className="text-slate-500">ولّد صور وفيديوهات وشخصيات افتراضية تلقائياً بالذكاء الاصطناعي</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b">
          {[
            { key: 'image', label: 'توليد صور', icon: '🖼️' },
            { key: 'video', label: 'توليد فيديوهات', icon: '🎬' },
            { key: 'avatar', label: 'شخصيات افتراضية', icon: '🧑‍🏫' },
            { key: 'flashcards', label: 'فلاش كاردز', icon: '🎴' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <span className="text-lg">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Course selector */}
        <div className="px-6 py-4 bg-slate-50 border-b flex items-center gap-4">
          <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">ربط بكورس</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm">
            <option value="">بدون ربط</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* ===== IMAGE GENERATION ===== */}
        {activeTab === 'image' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">✍️ وصف الصورة</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="مثال: رسم توضيحي لمفهوم البرمجة، ألوان زاهية، تصميم عصري عربي"
                rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generateImages} disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {isGenerating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري توليد الصور...</> : '🎨 توليد 4 صور'}
            </button>

            {generatedImages.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-700 mb-3">🖼️ الصور المولدة ({generatedImages.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedImages.slice(0, 8).map(img => (
                    <div key={img.id} className="bg-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                      <ImagePlaceholder colors={img.colors} label={img.label} />
                      <div className="p-3">
                        <p className="text-xs text-slate-500 truncate mb-2">{img.prompt}</p>
                        <button onClick={() => show('تمت إضافة الصورة للكورس ✅')}
                          className="w-full py-2 text-xs bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">إضافة للكورس</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== VIDEO GENERATION ===== */}
        {activeTab === 'video' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">✍️ وصف الفيديو</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="مثال: فيديو تعليمي يشرح مفهوم الذكاء الاصطناعي للمبتدئين"
                rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generateVideo} disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {isGenerating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري توليد الفيديو...</> : '🎬 توليد فيديو'}
            </button>

            {generatedVideos.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700">🎬 الفيديوهات المولدة</h3>
                {generatedVideos.map(v => (
                  <div key={v.id} className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-20 h-14 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${v.colors[0]}, ${v.colors[1]})` }}>▶️</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">{v.title}</p>
                      <p className="text-xs text-slate-500">المدة: {v.duration} • تم التوليد الآن</p>
                    </div>
                    <button onClick={() => show('تمت إضافة الفيديو ✅')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600">إضافة</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== AI AVATAR ===== */}
        {activeTab === 'avatar' && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVATAR_STYLES.map(s => (
                <button key={s.id} onClick={() => setAvatarConfig({ ...avatarConfig, avatar: s.id })}
                  className={`p-4 rounded-2xl border-2 transition-all text-center ${avatarConfig.avatar === s.id ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10' : 'border-slate-200 hover:border-blue-300'}`}>
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <p className="font-bold text-sm">{s.label}</p>
                  <p className="text-[10px] text-slate-400">{s.desc}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">اللغة</label>
                <select value={avatarConfig.language} onChange={e => setAvatarConfig({ ...avatarConfig, language: e.target.value })}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option>العربية</option><option>English</option><option>Français</option><option>Deutsch</option>
                  <option>Español</option><option>中文</option><option>日本語</option><option>한국어</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الصوت</label>
                <select value={avatarConfig.voice} onChange={e => setAvatarConfig({ ...avatarConfig, voice: e.target.value })}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <option value="ar-SA-Female">أنثى عربية</option>
                  <option value="ar-SA-Male">ذكر عربي</option>
                  <option value="en-US-Female">أنثى إنجليزية</option>
                  <option value="en-US-Male">ذكر إنجليزي</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">✍️ النص الذي ستنطقه الشخصية</label>
              <textarea value={avatarConfig.script} onChange={e => setAvatarConfig({ ...avatarConfig, script: e.target.value })}
                placeholder="اكتب النص التعليمي هنا... مثال: مرحباً بكم في هذا الدرس سنتعلم معاً أساسيات البرمجة..."
                rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generateAvatarVideo} disabled={!avatarConfig.script.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {isGenerating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الإنشاء...</> : '🧑‍🏫 توليد فيديو بالشخصية الافتراضية'}
            </button>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
              <p className="font-bold mb-1">🌍 متاح بـ 100+ لغة</p>
              <p>الشخصية الافتراضية تتحدث أي لغة بثقة ووضوح باستخدام تقنيات الذكاء الاصطناعي المتطورة</p>
            </div>
          </div>
        )}

        {/* ===== FLASHCARDS ===== */}
        {activeTab === 'flashcards' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">✍️ موضوع البطاقات</label>
              <input type="text" value={flashcardTopic} onChange={e => setFlashcardTopic(e.target.value)}
                placeholder="مثال: أساسيات البرمجة، الجبر الخطية، الفيزياء..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500" />
            </div>
            <button onClick={generateFlashcards} disabled={!flashcardTopic.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {isGenerating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري التوليد...</> : '🎴 توليد 6 بطاقات'}
            </button>

            {generatedFlashcards.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-700 mb-3">🎴 البطاقات المولدة ({generatedFlashcards.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedFlashcards.map((card, i) => (
                    <div key={i} className="group rounded-2xl p-5 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden" style={{ borderLeftColor: card.color, borderLeftWidth: '4px' }}>
                      <div className="absolute top-0 left-0 w-24 h-24 opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: card.color }} />
                      <div className="relative z-10">
                        <p className="font-bold text-slate-800 text-sm mb-2">{card.front}</p>
                        <p className="text-xs text-slate-500 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{card.back}</p>
                      </div>
                      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); show('تم حفظ البطاقة ✅'); }}
                          className="w-7 h-7 bg-blue-500 text-white rounded-lg text-xs flex items-center justify-center">💾</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🎨', title: 'توليد صور', desc: 'صور عالية الجودة بالذكاء الاصطناعي', color: 'from-purple-500 to-pink-500' },
          { icon: '🎬', title: 'توليد فيديوهات', desc: 'فيديوهات تعليمية تلقائية', color: 'from-red-500 to-rose-500' },
          { icon: '🧑‍🏫', title: 'شخصيات افتراضية', desc: 'Avatars ناطقة بـ 100 لغة', color: 'from-indigo-500 to-blue-500' },
          { icon: '🎴', title: 'فلاش كاردز', desc: 'بطاقات تذكيرية تفاعلية', color: 'from-amber-500 to-orange-500' },
        ].map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-lg`}>{f.icon}</div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">{f.title}</h3>
            <p className="text-xs text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaStudio;
