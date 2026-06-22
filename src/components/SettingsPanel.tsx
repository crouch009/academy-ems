import React, { useState, useEffect } from 'react';
import { SystemSettings, UserRole, Page } from '../types';
// FIX: removed unused 'store' import

interface SettingsPanelProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onClose: () => void;
}

// FIX: defaultSettings was missing required fields from SystemSettings interface — caused TS2740
const defaultSettings: SystemSettings = {
  siteName: 'أكاديمية المعرفة',
  siteDescription: 'منصة تعليمية متكاملة',
  logo: '🎓',
  primaryColor: '#3B82F6',
  visiblePages: ['dashboard', 'students', 'courses', 'lessons', 'instructors', 'schedule', 'attendance', 'grades', 'finance', 'reports'],
  requireAdminApproval: true,
  defaultLanguage: 'ar',
  defaultCurrency: 'EGP',
  paymentGateways: [],
  enableAI: true,
  enableSCORMExport: false,
  enableFlashcards: true,
  enableAIChatbot: true,
  enableAvatarVideos: false,
  integrations: {
    zoom: { enabled: false },
    googleClassroom: { enabled: false },
    linkedin: { enabled: false },
    googleDrive: { enabled: false },
  },
  certificateSettings: {
    enableBlockchain: false,
    enableLinkedInShare: false,
    defaultTemplate: 'classic',
    requirePassingGrade: true,
  },
};

const allPages: { key: Page; label: string }[] = [
  { key: 'dashboard', label: 'لوحة التحكم' },
  { key: 'students', label: 'الطلاب' },
  { key: 'courses', label: 'الكورسات' },
  { key: 'lessons', label: 'الدروس والمحتوى' },
  { key: 'instructors', label: 'المدرسين' },
  { key: 'schedule', label: 'جدول المحاضرات' },
  { key: 'attendance', label: 'الحضور' },
  { key: 'grades', label: 'الدرجات' },
  { key: 'finance', label: 'المالية' },
  { key: 'reports', label: 'التقارير' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings, currentRole, onRoleChange, onClose }) => {
  // FIX: use defaultSettings as fallback so incomplete settings objects don't break the panel
  const [localSettings, setLocalSettings] = useState<SystemSettings>({ ...defaultSettings, ...settings });
  const [logoPreview, setLogoPreview] = useState(settings.logo);

  useEffect(() => {
    setLocalSettings(settings);
    setLogoPreview(settings.logo);
  }, [settings]);

  const saveSettings = () => {
    onUpdateSettings(localSettings);
    localStorage.setItem('edu_settings', JSON.stringify(localSettings));
    onClose();
  };

  const togglePage = (page: Page) => {
    const visible = localSettings.visiblePages.includes(page);
    setLocalSettings({
      ...localSettings,
      visiblePages: visible 
        ? localSettings.visiblePages.filter(p => p !== page)
        : [...localSettings.visiblePages, page]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">⚙️ إعدادات النظام</h2>
            <p className="text-slate-500 text-sm">تحكم كامل في الموقع والصلاحيات</p>
          </div>
          <button onClick={onClose} className="text-3xl text-slate-400 hover:text-red-500">×</button>
        </div>

        <div className="p-8 overflow-auto max-h-[calc(92vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* General Settings */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">الإعدادات العامة</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">اسم الموقع</label>
                  <input 
                    type="text" 
                    value={localSettings.siteName}
                    onChange={(e) => setLocalSettings({...localSettings, siteName: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الشعار (إيموجي أو حرف)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="text" 
                      value={logoPreview}
                      onChange={(e) => {
                        setLogoPreview(e.target.value);
                        setLocalSettings({...localSettings, logo: e.target.value});
                      }}
                      className="w-24 px-4 py-3 border border-slate-200 rounded-2xl text-center text-4xl focus:ring-2 focus:ring-blue-500"
                      maxLength={2}
                    />
                    <div className="text-sm text-slate-500">سيظهر هذا الشعار في جميع الصفحات</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">اللون الأساسي</label>
                  <div className="flex gap-3">
                    {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'].map(color => (
                      <button
                        key={color}
                        onClick={() => setLocalSettings({...localSettings, primaryColor: color})}
                        className={`w-10 h-10 rounded-2xl border-4 ${localSettings.primaryColor === color ? 'border-slate-900 scale-110' : 'border-white shadow'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={localSettings.requireAdminApproval}
                      onChange={(e) => setLocalSettings({...localSettings, requireAdminApproval: e.target.checked})}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <span className="font-medium">يتطلب موافقة المدير قبل فتح الكورس (نظام الحجز)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Role Preview */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">وضع العرض (Preview Mode)</h3>
              <div className="bg-slate-50 rounded-2xl p-5">
                <p className="text-xs text-slate-500 mb-3">اختر كيف تريد تصفح الموقع:</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['admin', 'instructor', 'student'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => onRoleChange(role)}
                      className={`py-4 rounded-2xl text-sm font-semibold transition-all border-2 ${
                        currentRole === role 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-inner' 
                          : 'border-transparent hover:border-slate-200 bg-white'
                      }`}
                    >
                      {role === 'admin' ? '👨‍💼 مدير' : role === 'instructor' ? '👨‍🏫 مدرس' : '👨‍🎓 طالب'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center">هذا الوضع يغير الصلاحيات المرئية فقط (للتجربة)</p>
              </div>
            </div>
          </div>

          {/* Page Visibility */}
          <div className="mt-10">
            <h3 className="font-bold text-lg mb-4 text-slate-700">الصفحات المرئية في القائمة</h3>
            <div className="grid grid-cols-2 gap-2">
              {allPages.map(page => (
                <label key={page.key} className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl cursor-pointer transition-colors">
                  <input 
                    type="checkbox"
                    checked={localSettings.visiblePages.includes(page.key)}
                    onChange={() => togglePage(page.key)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="font-medium text-slate-700">{page.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-between items-center rounded-b-3xl">
          <button onClick={onClose} className="px-8 py-3 text-slate-500 font-medium hover:bg-slate-100 rounded-2xl">إلغاء</button>
          <button onClick={saveSettings} className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
