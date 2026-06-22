import React, { useState } from 'react';
import { Course, PaymentRecord } from '../types';

interface PaymentsProps {
  courses: Course[];
  payments: PaymentRecord[];
  onUpdatePayments: (payments: PaymentRecord[]) => void;
}

const PAYMENT_METHODS = [
  { id: 'mada', name: 'مدى', icon: '💳', color: 'from-emerald-500 to-emerald-700', description: 'بطاقات مدى السعودية' },
  { id: 'visa', name: 'Visa', icon: '💳', color: 'from-blue-500 to-blue-700', description: 'بطاقات فيزا العالمية' },
  { id: 'applepay', name: 'Apple Pay', icon: '🍎', color: 'from-slate-700 to-black', description: 'الدفع من أجهزة Apple' },
  { id: 'tamara', name: 'تمارا', icon: '🛍️', color: 'from-pink-500 to-pink-700', description: 'تقسيط بدون فوائد' },
  { id: 'tabby', name: 'تابي', icon: '🛒', color: 'from-violet-500 to-violet-700', description: 'ادفع على 4 دفعات' },
  { id: 'fawry', name: 'فوري', icon: '🏧', color: 'from-amber-500 to-orange-600', description: 'الدفع عبر فوري' },
  { id: 'stripe', name: 'Stripe', icon: '💰', color: 'from-indigo-500 to-indigo-700', description: 'بوابة دفع عالمية' },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: 'ر.س',
  AED: 'د.إ',
  USD: '$',
  EGP: 'ج.م',
  JOD: 'د.أ',
  KWD: 'د.ك',
};

const Payments: React.FC<PaymentsProps> = ({ courses, payments, onUpdatePayments }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [studentName, setStudentName] = useState('أحمد محمد');
  const [studentEmail, setStudentEmail] = useState('ahmed@example.com');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const course = courses.find(c => c.id === selectedCourse);

  const processPayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newPayment: PaymentRecord = {
      id: Date.now().toString(),
      studentId: 'student-' + Date.now().toString(),
      courseId: selectedCourse,
      amount: course?.price || 0,
      currency: course?.currency || 'SAR',
      date: new Date().toISOString().split('T')[0],
      method: PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name as any || 'فيزا',
      status: 'مدفوع',
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      gateway: selectedMethod as any,
      notes: `دفع بواسطة ${studentName}`,
    };

    onUpdatePayments([...payments, newPayment]);
    setIsProcessing(false);
    setPaymentSuccess(true);
    
    setTimeout(() => {
      setPaymentSuccess(false);
      setSelectedCourse('');
      setSelectedMethod('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">💳 بوابات الدفع</h2>
        <p className="text-slate-500">مدعومة للشرق الأوسط والعالم - مدى، فيزا، Apple Pay، تمارا، Stripe</p>
      </div>

      {/* Available Methods */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">🏦 بوابات الدفع المدعومة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {PAYMENT_METHODS.map(method => (
            <div key={method.id} className={`bg-gradient-to-br ${method.color} text-white rounded-2xl p-4 text-center`}>
              <div className="text-3xl mb-2">{method.icon}</div>
              <p className="font-bold text-sm">{method.name}</p>
              <p className="text-[10px] opacity-90 mt-1">✓ نشط</p>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Simulator */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">🛒 محاكاة عملية دفع (للاختبار)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">اختر كورس للشراء</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- اختر كورس --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.price} {c.currency}</option>
              ))}
            </select>

            {course && (
              <div className="mt-4 bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{course.name}</p>
                    <p className="text-xs text-slate-500">{course.code}</p>
                  </div>
                  <div className="text-2xl font-extrabold text-blue-700">
                    {course.price} <span className="text-sm">{CURRENCY_SYMBOLS[course.currency]}</span>
                  </div>
                </div>
              </div>
            )}

            <label className="text-sm font-semibold text-slate-700 mt-4 mb-2 block">اختر طريقة الدفع</label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-3 rounded-2xl border-2 text-right transition-all ${
                    selectedMethod === method.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{method.name}</p>
                      <p className="text-[10px] text-slate-500">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6">
            <h4 className="font-bold text-slate-700 mb-4">بيانات الدفع (تجريبي)</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">الاسم الكامل</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
              {(selectedMethod === 'mada' || selectedMethod === 'visa' || selectedMethod === 'stripe') && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">رقم البطاقة</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX XXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    dir="ltr"
                  />
                </div>
              )}
              {selectedMethod === 'tamara' && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-xs text-pink-800">
                  ✓ تقسيط بدون فوائد - 4 دفعات شهرية متساوية
                </div>
              )}
              {selectedMethod === 'tabby' && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs text-violet-800">
                  ✓ ادفع على 4 دفعات بدون فوائد
                </div>
              )}
            </div>

            <button
              onClick={processPayment}
              disabled={!selectedCourse || !selectedMethod || isProcessing}
              className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>💳 دفع {course?.price || 0} {CURRENCY_SYMBOLS[course?.currency || 'SAR']}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-slate-800">📊 آخر المدفوعات ({payments.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">التاريخ</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الطالب</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الكورس</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">البوابة</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(-10).reverse().map(p => {
                const c = courses.find(c => c.id === p.courseId);
                return (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">{p.date}</td>
                    <td className="px-4 py-2 font-medium">{p.notes.replace('دفع بواسطة ', '')}</td>
                    <td className="px-4 py-2">{c?.name || '-'}</td>
                    <td className="px-4 py-2 font-bold text-emerald-600">{p.amount} {p.currency}</td>
                    <td className="px-4 py-2">{p.gateway || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'مدفوع' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-emerald-700 mb-2">تم الدفع بنجاح!</h3>
            <p className="text-slate-600 mb-4">رقم العملية: {payments[payments.length - 1]?.transactionId}</p>
            <button onClick={() => setPaymentSuccess(false)} className="px-6 py-2 bg-emerald-600 text-white rounded-2xl">
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
