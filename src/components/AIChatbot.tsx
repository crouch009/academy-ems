import React, { useState, useRef, useEffect } from 'react';
import { Course, Lesson, AIChatMessage } from '../types';

interface AIChatbotProps {
  courses: Course[];
  lessons: Lesson[];
}

const AIChatbot: React.FC<AIChatbotProps> = ({ courses, lessons }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const courseLessons = lessons.filter(l => l.courseId === selectedCourse);

  useEffect(() => {
    if (selectedCourse) {
      const greeting: AIChatMessage = {
        id: Date.now().toString(),
        courseId: selectedCourse,
        role: 'assistant',
        content: `مرحباً! أنا المعلم الذكي لهذا الكورس 🤖\n\nيمكنني مساعدتك في:\n• الإجابة عن أسئلتك\n• شرح المفاهيم ببساطة\n• تلخيص الدروس\n• اقتراح تمارين إضافية\n\nكيف أساعدك اليوم؟`,
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // البحث في الدروس للإجابة
    const relevantLesson = courseLessons.find(l => 
      l.title.toLowerCase().includes(userMsgKey(lowerMsg)) || 
      l.content.toLowerCase().includes(lowerMsg)
    );

    if (relevantLesson) {
      return `بناءً على درس "${relevantLesson.title}"، إليك الإجابة:\n\n${relevantLesson.content.substring(0, 200)}...\n\nهل تريد المزيد من التفاصيل؟`;
    }

    if (lowerMsg.includes('مرحبا') || lowerMsg.includes('hello')) {
      return 'أهلاً وسهلاً! 🌟 كيف يمكنني مساعدتك في رحلتك التعليمية؟';
    }

    if (lowerMsg.includes('شكرا') || lowerMsg.includes('thank')) {
      return 'العفو! 😊 دائماً سعيد بمساعدتك. هل هناك شيء آخر؟';
    }

    const responses = [
      `سؤال ممتاز! 🎯 دعني أشرح لك:\n\nالمفهوم الأساسي هنا هو أن ${userMessage} يتطلب فهم الخطوات التالية:\n1. التعرف على الأساسيات\n2. التطبيق العملي\n3. المراجعة المستمرة\n\nهل تريد التعمق في نقطة معينة؟`,
      `بناءً على محتوى الكورس 📚، يمكنني القول إن:\n\n${userMessage} هو موضوع مهم جداً. ننصح بمراجعة الدروس المتعلقة بهذا الموضوع وحل التمارين المرفقة.\n\nهل تريد أن ألخص لك الدروس الأساسية؟`,
      `إجابة ذكية من معلمك الشخصي 🤖:\n\nللإجابة على سؤالك "${userMessage}"، يجب أن نأخذ في الاعتبار:\n\n• الخلفية النظرية\n• التطبيقات العملية\n• أفضل الممارسات\n\nيمكنني شرح كل نقطة بالتفصيل عند الطلب.`,
      `✨ إليك إجابة مبسطة:\n\n${userMessage} يعتبر من المفاهيم التي تبنى عليها دروس متقدمة. أنصحك بـ:\n\n1. مراجعة الدرس الأول\n2. حل التمارين التفاعلية\n3. طرح الأسئلة عند الحاجة\n\nأنا هنا لمساعدتك!`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      courseId: selectedCourse,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // محاكاة وقت التفكير
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const aiResponse: AIChatMessage = {
      id: (Date.now() + 1).toString(),
      courseId: selectedCourse,
      role: 'assistant',
      content: generateAIResponse(input),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsThinking(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">🤖 المعلم الذكي (AI Tutor)</h2>
        <p className="text-slate-500">روبوت محادثة ذكي لكل كورس - متاح 24/7 للإجابة عن أسئلة الطلاب</p>
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">اختر الكورس للدردشة مع معلمه الذكي</label>
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
      </div>

      {selectedCourse ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
              <div>
                <p className="font-bold">{courses.find(c => c.id === selectedCourse)?.name}</p>
                <p className="text-xs opacity-80">المعلم الذكي - متاح 24/7</p>
              </div>
            </div>

            <div className="h-[500px] overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-white border border-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl hover:from-blue-700 hover:to-violet-700 disabled:opacity-50"
                >
                  إرسال
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">📚 الدروس المتاحة</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {courseLessons.slice(0, 8).map((l, i) => (
                  <div key={l.id} className="flex items-center gap-2 text-sm">
                    <span className="text-blue-500 font-bold">{i + 1}.</span>
                    <span className="text-slate-700 line-clamp-1">{l.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-3xl p-5">
              <h3 className="font-bold text-blue-800 mb-2">💡 اقتراحات للأسئلة</h3>
              <div className="space-y-2 text-sm">
                {[
                  'لخص لي هذا الدرس في نقاط',
                  'اشرح لي المفهوم ببساطة',
                  'ما هي أهم النقاط في هذا الكورس؟',
                  'اقترح عليّ تمارين إضافية',
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="w-full text-right p-2 bg-white rounded-xl hover:bg-blue-100 border border-blue-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
              <h3 className="font-bold text-emerald-800 mb-2">⚡ مميزات المعلم الذكي</h3>
              <ul className="space-y-1 text-xs text-emerald-700">
                <li>✓ متاح 24/7</li>
                <li>✓ يفهم محتوى الكورس</li>
                <li>✓ يجيب باللغة العربية</li>
                <li>✓ يشرح المفاهيم ببساطة</li>
                <li>✓ يقترح تمارين إضافية</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">اختر كورساً لبدء المحادثة</h3>
          <p className="text-slate-500">كل كورس له معلم ذكي خاص به مُدرّب على محتواه</p>
        </div>
      )}
    </div>
  );
};

function userMsgKey(msg: string): string {
  const words = msg.split(' ').filter(w => w.length > 3);
  return words[0] || msg;
}

export default AIChatbot;
