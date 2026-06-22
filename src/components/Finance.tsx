import React, { useState, useMemo } from 'react';
import { Student, Course, PaymentRecord, ExpenseRecord } from '../types';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FinanceProps {
  students: Student[];
  courses: Course[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  onUpdatePayments: (payments: PaymentRecord[]) => void;
  onUpdateExpenses: (expenses: ExpenseRecord[]) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];

const Finance: React.FC<FinanceProps> = ({ students, courses, payments, expenses, onUpdatePayments, onUpdateExpenses }) => {
  const [tab, setTab] = useState<'income' | 'expenses' | 'overview'>('overview');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ studentId: '', courseId: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'كاش' as const, status: 'مدفوع' as const, notes: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'إيجار', description: '', amount: 0, date: new Date().toISOString().split('T')[0], status: 'مدفوع' as const });

  const totalIncome = payments.filter(p => p.status === 'مدفوع').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = expenses.filter(e => e.status === 'مدفوع').reduce((a, b) => a + b.amount, 0);
  const pendingIncome = payments.filter(p => p.status === 'معلق').reduce((a, b) => a + b.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'معلق').reduce((a, b) => a + b.amount, 0);

  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      if (!map[e.category]) map[e.category] = 0;
      map[e.category] += e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const handleAddPayment = () => {
    if (!paymentForm.studentId || paymentForm.amount <= 0) return;
    const paymentCourse = courses.find(c => c.id === paymentForm.courseId);
    onUpdatePayments([...payments, { ...paymentForm, id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36), currency: paymentCourse?.currency || 'SAR' }]);
    setPaymentForm({ studentId: '', courseId: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'كاش', status: 'مدفوع', notes: '' });
    setShowPaymentForm(false);
  };

  const handleAddExpense = () => {
    if (!expenseForm.description || expenseForm.amount <= 0) return;
    onUpdateExpenses([...expenses, { ...expenseForm, id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) }]);
    setExpenseForm({ category: 'إيجار', description: '', amount: 0, date: new Date().toISOString().split('T')[0], status: 'مدفوع' });
    setShowExpenseForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">الإدارة المالية</h2>
          <p className="text-slate-500">تتبع الدخل والمصروفات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white">
          <p className="text-emerald-100 text-sm">إجمالي الدخل</p>
          <p className="text-2xl font-bold mt-1">{totalIncome.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-5 text-white">
          <p className="text-red-100 text-sm">إجمالي المصروفات</p>
          <p className="text-2xl font-bold mt-1">{totalExpenses.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white">
          <p className="text-blue-100 text-sm">صافي الربح</p>
          <p className="text-2xl font-bold mt-1">{(totalIncome - totalExpenses).toLocaleString()} ج.م</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-5 text-white">
          <p className="text-amber-100 text-sm">مبالغ معلقة</p>
          <p className="text-2xl font-bold mt-1">{(pendingIncome + pendingExpenses).toLocaleString()} ج.م</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'overview', label: 'نظرة عامة' },
          { key: 'income', label: 'المدفوعات' },
          { key: 'expenses', label: 'المصروفات' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">توزيع المصروفات</h3>
              {expenseCategories.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {expenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ج.م`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {expenseCategories.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-slate-600">{c.name}: {c.value.toLocaleString()} ج.م</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400"><p>لا توجد مصروفات</p></div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">ملخص مالي</h3>
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">المدفوعات المحصلة</p>
                      <p className="text-2xl font-bold text-emerald-700">{payments.filter(p => p.status === 'مدفوع').length} عملية</p>
                    </div>
                    <p className="text-xl font-bold text-emerald-700">{totalIncome.toLocaleString()} ج.م</p>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-red-600 font-medium">المصروفات المدفوعة</p>
                      <p className="text-2xl font-bold text-red-700">{expenses.filter(e => e.status === 'مدفوع').length} عملية</p>
                    </div>
                    <p className="text-xl font-bold text-red-700">{totalExpenses.toLocaleString()} ج.م</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">صافي الربح</p>
                      <p className="text-xs text-blue-500">الدخل - المصروفات</p>
                    </div>
                    <p className={`text-xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      {(totalIncome - totalExpenses).toLocaleString()} ج.م
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Income Tab */}
      {tab === 'income' && (
        <>
          <button onClick={() => setShowPaymentForm(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            تسجيل مدفوعات
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">التاريخ</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">الطالب</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">الكورس</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">المبلغ</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">طريقة الدفع</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">الحالة</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400"><p className="text-4xl mb-2">💳</p><p>لا توجد مدفوعات</p></td></tr>
                  ) : payments.slice().reverse().map(payment => {
                    const student = students.find(s => s.id === payment.studentId);
                    const course = courses.find(c => c.id === payment.courseId);
                    return (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-slate-600">{payment.date}</td>
                        <td className="px-6 py-3 font-medium text-slate-700">{student?.name || 'غير محدد'}</td>
                        <td className="px-6 py-3 text-slate-600">{course?.name || 'غير محدد'}</td>
                        <td className="px-6 py-3 font-bold text-emerald-600">{payment.amount.toLocaleString()} ج.م</td>
                        <td className="px-6 py-3 text-slate-600">{payment.method}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${payment.status === 'مدفوع' ? 'bg-emerald-100 text-emerald-700' : payment.status === 'معلق' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <button onClick={() => { if (confirm('حذف هذه المدفوعات؟')) onUpdatePayments(payments.filter(p => p.id !== payment.id)); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <>
          <button onClick={() => setShowExpenseForm(true)}
            className="bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-red-600/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            إضافة مصروف
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">التاريخ</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">التصنيف</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">الوصف</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">المبلغ</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">الحالة</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400"><p className="text-4xl mb-2">💸</p><p>لا توجد مصروفات</p></td></tr>
                  ) : expenses.slice().reverse().map(expense => (
                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-6 py-3 text-slate-600">{expense.date}</td>
                      <td className="px-6 py-3"><span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{expense.category}</span></td>
                      <td className="px-6 py-3 text-slate-700">{expense.description}</td>
                      <td className="px-6 py-3 font-bold text-red-600">{expense.amount.toLocaleString()} ج.م</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${expense.status === 'مدفوع' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button onClick={() => { if (confirm('حذف هذا المصروف؟')) onUpdateExpenses(expenses.filter(e => e.id !== expense.id)); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">تسجيل مدفوعات</h3>
              <button onClick={() => setShowPaymentForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الطالب</label>
                <select value={paymentForm.studentId} onChange={e => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">اختر طالب</option>
                  {students.filter(s => s.status === 'نشط').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الكورس</label>
                <select value={paymentForm.courseId} onChange={e => setPaymentForm({ ...paymentForm, courseId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">اختر كورس</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ</label>
                  <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
                  <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">طريقة الدفع</label>
                <select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as typeof paymentForm.method })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="كاش">كاش</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="فيزا">فيزا</option>
                  <option value="فودافون كاش">فودافون كاش</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setShowPaymentForm(false)} className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium">إلغاء</button>
              <button onClick={handleAddPayment} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">إضافة مصروف</h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التصنيف</label>
                <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="إيجار">إيجار</option>
                  <option value="رواتب">رواتب</option>
                  <option value="مستلزمات">مستلزمات</option>
                  <option value="صيانة">صيانة</option>
                  <option value="كهرباء">كهرباء</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ</label>
                  <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
                  <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setShowExpenseForm(false)} className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium">إلغاء</button>
              <button onClick={handleAddExpense} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-600/20">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
