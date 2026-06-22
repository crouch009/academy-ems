import React, { useState, useMemo } from 'react';
import { Student, Instructor, Course, Permission, RoleDefinition, Page } from '../types';
import { store } from '../data/store';

// === Default Roles ===
const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'admin', name: 'Admin', nameAr: 'مدير عام', color: '#EF4444', icon: '👑',
    description: 'صلاحيات كاملة على النظام بالكامل — لا يمكن حذفه',
    isSystem: true, maxUsers: 5,
    permissions: ['dashboard.view', 'students.view', 'students.create', 'students.edit', 'students.delete',
      'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
      'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
      'lessons.view', 'lessons.create', 'lessons.edit', 'lessons.delete', 'lessons.publish',
      'grades.view', 'grades.create', 'grades.edit',
      'attendance.view', 'attendance.create', 'attendance.edit',
      'certificates.view', 'certificates.create', 'certificates.issue',
      'payments.view', 'payments.process', 'payments.refund',
      'reports.view', 'reports.export',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.assign_role',
      'settings.view', 'settings.edit',
      'finance.view', 'finance.edit',
      'community.moderate', 'community.view',
      'live.view', 'live.host', 'live.create',
      'builder.view', 'builder.use',
      'ai.view', 'ai.use',
      'marketplace.view', 'marketplace.manage',
      'parents.view', 'parents.edit',
      'export.all',
      'partners.view', 'partners.manage',
      'career.view', 'career.manage'],
  },
  {
    id: 'manager', name: 'Manager', nameAr: 'مدير فرعي', color: '#F97316', icon: '🏢',
    description: 'يمكنه إدارة الكورسات والطلاب والمدرسين — لا يستطيع إدارة النظام',
    isSystem: false, maxUsers: 10,
    permissions: ['dashboard.view', 'students.view', 'students.create', 'students.edit', 'instructors.view', 'instructors.create', 'instructors.edit',
      'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
      'lessons.view', 'lessons.create', 'lessons.edit', 'lessons.delete', 'lessons.publish',
      'grades.view', 'grades.create', 'grades.edit', 'attendance.view', 'attendance.create', 'attendance.edit',
      'certificates.view', 'certificates.create', 'certificates.issue',
      'payments.view', 'payments.process', 'reports.view', 'reports.export',
      'community.view', 'live.view', 'live.host', 'live.create',
      'builder.view', 'builder.use', 'ai.view', 'ai.use',
      'marketplace.view', 'marketplace.manage', 'career.view', 'career.manage'],
  },
  {
    id: 'instructor_role', name: 'Instructor', nameAr: 'مدرس', color: '#8B5CF6', icon: '👨‍🏫',
    description: 'يدير كورساته وطلابه فقط — لا يستطيع حذف الكورسات',
    isSystem: false, maxUsers: 50,
    permissions: ['dashboard.view', 'courses.view', 'courses.create', 'courses.edit',
      'lessons.view', 'lessons.create', 'lessons.edit', 'lessons.publish',
      'grades.view', 'grades.create', 'grades.edit', 'attendance.view', 'attendance.create',
      'community.view', 'community.moderate', 'live.view', 'live.host',
      'builder.view', 'builder.use', 'ai.view', 'ai.use'],
  },
  {
    id: 'student_role', name: 'Student', nameAr: 'طالب', color: '#3B82F6', icon: '👨‍🎓',
    description: 'يتعلم ويشتري كورسات — يرى محتوى كورساته فقط',
    isSystem: false, maxUsers: 10000,
    permissions: ['dashboard.view', 'courses.view', 'lessons.view', 'grades.view',
      'attendance.view', 'certificates.view', 'community.view', 'community.moderate',
      'live.view', 'builder.view', 'ai.view', 'ai.use',
      'marketplace.view', 'marketplace.buy', 'career.view', 'parents.view'],
  },
  {
    id: 'moderator', name: 'Moderator', nameAr: 'مشرف مجتمع', color: '#06B6D4', icon: '🛡️',
    description: 'يمoderate المجتمع والمنتدى فقط',
    isSystem: false, maxUsers: 5,
    permissions: ['dashboard.view', 'community.view', 'community.moderate', 'students.view'],
  },
  {
    id: 'accountant', name: 'Accountant', nameAr: 'محاسب', color: '#10B981', icon: '💰',
    description: 'يعرض ويعالج البيانات المالية فقط',
    isSystem: false, maxUsers: 3,
    permissions: ['dashboard.view', 'finance.view', 'finance.edit', 'payments.view', 'payments.process', 'payments.refund', 'reports.view', 'reports.export'],
  },
];

const ALL_PERMISSION_GROUPS = [
  { label: 'لوحة التحكم', perms: ['dashboard.view'] },
  { label: 'الطلاب', perms: ['students.view', 'students.create', 'students.edit', 'students.delete'] },
  { label: 'المدرسين', perms: ['instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete'] },
  { label: 'الكورسات', perms: ['courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish'] },
  { label: 'الدروس', perms: ['lessons.view', 'lessons.create', 'lessons.edit', 'lessons.delete', 'lessons.publish'] },
  { label: 'الدرجات', perms: ['grades.view', 'grades.create', 'grades.edit'] },
  { label: 'الحضور', perms: ['attendance.view', 'attendance.create', 'attendance.edit'] },
  { label: 'الشهادات', perms: ['certificates.view', 'certificates.create', 'certificates.issue'] },
  { label: 'المدفوعات', perms: ['payments.view', 'payments.process', 'payments.refund'] },
  { label: 'المالية', perms: ['finance.view', 'finance.edit'] },
  { label: 'التقارير', perms: ['reports.view', 'reports.export'] },
  { label: 'المستخدمين', perms: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.assign_role'] },
  { label: 'الإعدادات', perms: ['settings.view', 'settings.edit'] },
  { label: 'المجتمع', perms: ['community.view', 'community.moderate'] },
  { label: 'الفصول المباشرة', perms: ['live.view', 'live.host', 'live.create'] },
  { label: 'الذكاء الاصطناعي', perms: ['builder.view', 'builder.use', 'ai.view', 'ai.use'] },
  { label: 'المتجر', perms: ['marketplace.view', 'marketplace.buy', 'marketplace.manage'] },
  { label: 'أولياء الأمور', perms: ['parents.view', 'parents.edit'] },
  { label: 'الشراكات', perms: ['partners.view', 'partners.manage'] },
  { label: 'التوظيف', perms: ['career.view', 'career.manage'] },
];

const PERMISSION_LABELS: Record<string, string> = {
  'dashboard.view': 'عرض لوحة التحكم',
  'students.view': 'عرض الطلاب', 'students.create': 'إضافة طلاب', 'students.edit': 'تعديل بيانات طلاب', 'students.delete': 'حذف طلاب',
  'instructors.view': 'عرض المدرسين', 'instructors.create': 'إضافة مدرسين', 'instructors.edit': 'تعديل بيانات مدرسين', 'instructors.delete': 'حذف مدرسين',
  'courses.view': 'عرض الكورسات', 'courses.create': 'إنشاء كورس', 'courses.edit': 'تعديل كورس', 'courses.delete': 'حذف كورس', 'courses.publish': 'نشر كورس',
  'lessons.view': 'عرض الدروس', 'lessons.create': 'إنشاء درس', 'lessons.edit': 'تعديل درس', 'lessons.delete': 'حذف درس', 'lessons.publish': 'نشر درس',
  'grades.view': 'عرض الدرجات', 'grades.create': 'إضافة درجات', 'grades.edit': 'تعديل درجات',
  'attendance.view': 'عرض الحضور', 'attendance.create': 'تسجيل حضور', 'attendance.edit': 'تعديل حضور',
  'certificates.view': 'عرض الشهادات', 'certificates.create': 'إنشاء شهادة', 'certificates.issue': 'إصدار شهادة',
  'payments.view': 'عرض المدفوعات', 'payments.process': 'معالجة مدفوعات', 'payments.refund': 'استرداد مدفوعات',
  'reports.view': 'عرض التقارير', 'reports.export': 'تصدير التقارير',
  'users.view': 'عرض المستخدمين', 'users.create': 'إنشاء مستخدم', 'users.edit': 'تعديل مستخدم', 'users.delete': 'حذف مستخدم', 'users.assign_role': 'تعيين أدوار',
  'settings.view': 'عرض الإعدادات', 'settings.edit': 'تعديل الإعدادات',
  'finance.view': 'عرض المالية', 'finance.edit': 'تعديل المالية',
  'community.view': 'عرض المجتمع', 'community.moderate': 'إدارة المجتمع',
  'live.view': 'عرض البثوث', 'live.host': 'استضافة جلسة', 'live.create': 'إنشاء جلسة',
  'builder.view': 'عرض المنشئ', 'builder.use': 'استخدام المنشئ',
  'ai.view': 'عرض الأدوات', 'ai.use': 'استخدام الأدوات',
  'marketplace.view': 'عرض المتجر', 'marketplace.buy': 'شراء من المتجر', 'marketplace.manage': 'إدارة المتجر',
  'parents.view': 'عرض ولي الأمر', 'parents.edit': 'تعديل بيانات ولي الأمر',
  'partners.view': 'عرض الشراكات', 'partners.manage': 'إدارة الشراكات',
  'career.view': 'عرض المركز المهني', 'career.manage': 'إدارة المركز المهني',
  'export.all': 'تصدير كل البيانات',
};

interface AdminProfileProps {
  students: Student[];
  instructors: Instructor[];
  courses: Course[];
  roles: RoleDefinition[];
  currentUser: { id: string; name: string; role: string } | null;
  onUpdateRoles: (roles: RoleDefinition[]) => void;
  onAddStudent: (students: Student[]) => void;
  onAddInstructor: (instructors: Instructor[]) => void;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const AdminProfile: React.FC<AdminProfileProps> = ({
  students, instructors, courses, roles, currentUser,
  onUpdateRoles, onAddStudent, onAddInstructor, onNavigate, onLogout
}) => {
  const [tab, setTab] = useState<'home' | 'users' | 'roles' | 'audit' | 'settings'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [toast, setToast] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'student_role', password: '' });

  const allUsers = useMemo(() => {
    const sUsers = students.map(s => ({ id: s.id, name: s.name, email: s.email, phone: s.phone, role: 'student_role', status: s.status, date: s.enrollDate, avatar: '👨‍🎓', color: 'from-blue-500 to-blue-700' }));
    const iUsers = instructors.map(i => ({ id: i.id, name: i.name, email: i.email, phone: i.phone, role: 'instructor_role', status: i.status, date: i.hireDate, avatar: '👨‍🏫', color: 'from-violet-500 to-violet-700' }));
    const adminUsers = [{ id: 'admin', name: 'المدير العام', email: 'admin@academy.com', phone: '', role: 'admin', status: 'نشط', date: '2024-01-01', avatar: '👑', color: 'from-red-500 to-red-700' }];
    return [...adminUsers, ...sUsers, ...iUsers];
  }, [students, instructors]);

  const filteredUsers = useMemo(() => {
    if (!searchUser) return allUsers;
    return allUsers.filter(u => u.name.includes(searchUser) || u.email.includes(searchUser) || u.role.includes(searchUser));
  }, [allUsers, searchUser]);

  const currentRoles = roles.length > 0 ? roles : DEFAULT_ROLES;

  const getRoleName = (roleId: string) => currentRoles.find(r => r.id === roleId)?.nameAr || roleId;
  const getRoleColor = (roleId: string) => currentRoles.find(r => r.id === roleId)?.color || '#666';

  const show = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const startEditRole = (roleId: string) => {
    const role = currentRoles.find(r => r.id === roleId);
    if (!role) return;
    setEditingRole(roleId);
    setSelectedPerms([...role.permissions]);
  };

  const saveRole = () => {
    if (!editingRole) return;
    const updated = currentRoles.map(r => r.id === editingRole ? { ...r, permissions: selectedPerms } : r);
    onUpdateRoles(updated);
    store.set('roles', updated);
    setEditingRole(null);
    show('تم حفظ الصلاحيات ✅');
  };

  const addRole = () => {
    if (!newRoleName.trim()) return;
    const role: RoleDefinition = {
      id: `role_${Date.now()}`, name: newRoleName, nameAr: newRoleName, color: '#6366F1', icon: '📌',
      description: '', permissions: [], isSystem: false, maxUsers: 10,
    };
    onUpdateRoles([...currentRoles, role]);
    setShowAddRole(false);
    setNewRoleName('');
    show('تم إنشاء الدور الجديد ✅');
  };

  const deleteRole = (roleId: string) => {
    const role = currentRoles.find(r => r.id === roleId);
    if (!role || role.isSystem) { show('لا يمكن حذف الأدوار الأساسية ❌', ); return; }
    if (!confirm(`حذف دور "${role.nameAr}"?`)) return;
    onUpdateRoles(currentRoles.filter(r => r.id !== roleId));
    show('تم الحذف ✅');
  };

  const addPerm = (p: Permission) => { if (!selectedPerms.includes(p)) setSelectedPerms([...selectedPerms, p]); };
  const removePerm = (p: Permission) => setSelectedPerms(selectedPerms.filter(x => x !== p));
  const togglePerm = (p: Permission) => selectedPerms.includes(p) ? removePerm(p) : addPerm(p);
  const toggleGroup = (perms: string[]) => {
    const allSelected = perms.every(p => selectedPerms.includes(p as Permission));
    if (allSelected) perms.forEach(p => removePerm(p as Permission));
    else perms.forEach(p => addPerm(p as Permission));
  };

  // Stats
  const stats = useMemo(() => ({
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => u.status === 'نشط').length,
    admins: allUsers.filter(u => u.role === 'admin').length,
    instructors: allUsers.filter(u => u.role === 'instructor_role').length,
    students: allUsers.filter(u => u.role === 'student_role').length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.status === 'نشط').length,
    rolesCount: currentRoles.length,
  }), [allUsers, courses, currentRoles]);

  const tabs = [
    { key: 'home', label: 'نظرة عامة', icon: '🏠' },
    { key: 'users', label: 'المستخدمين', icon: '👥' },
    { key: 'roles', label: 'الأدوار والصلاحيات', icon: '🔐' },
    { key: 'audit', label: 'سجل النشاط', icon: '📋' },
    { key: 'settings', label: 'إعدادات النظام', icon: '⚙️' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl">☰</button>
            <span className="text-xl">👑</span>
            <span className="font-black text-slate-800 hidden sm:block">لوحة المدير</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              صلاحيات كاملة
            </div>
            <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-xl transition-colors">خروج</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-0 lg:gap-6 p-4 lg:p-6">
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-14 lg:top-20 right-0 h-[calc(100vh-56px)] w-72 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto z-50 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex-shrink-0`}>
          <div className="p-5 text-center border-b border-slate-100">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-lg shadow-red-500/20">👑</div>
            <h3 className="font-bold text-slate-800">{currentUser?.name || 'المدير'}</h3>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">مدير عام</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            {[[`${stats.totalUsers}`, 'مستخدم'], [`${stats.activeUsers}`, 'نشط'], [`${stats.totalCourses}`, 'كورس'], [`${stats.rolesCount}`, 'دور']].map(([v, l], i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800">{v}</p>
                <p className="text-[10px] text-slate-500 font-medium">{l}</p>
              </div>
            ))}
          </div>

          <nav className="p-2 space-y-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="text-lg">{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>

          <div className="p-3 mx-3 mb-3 mt-1 bg-gradient-to-l from-red-50 to-orange-50 rounded-xl border border-red-100">
            <p className="text-xs font-bold text-red-700 mb-1">⚡ أسرع وصول</p>
            <div className="space-y-1">
              {[
                { page: 'students', label: '👥 إدارة الطلاب' },
                { page: 'courses', label: '📚 إدارة الكورسات' },
                { page: 'reports', label: '📊 التقارير' },
              ].map((item, i) => (
                <button key={i} onClick={() => { onNavigate(item.page as Page); setSidebarOpen(false); }}
                  className="w-full text-right text-xs text-slate-600 hover:text-red-600 py-1.5 px-2 rounded-lg hover:bg-white transition-colors">
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-6">

          {/* HOME */}
          {tab === 'home' && (
            <>
              <div className="bg-gradient-to-l from-red-600 via-rose-600 to-pink-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-black mb-2">مرحباً المدير! 👑</h2>
                  <p className="text-white/80 mb-4">{stats.totalUsers} مستخدم مسجّل • {stats.activeUsers} نشط • {stats.rolesCount} أدوار مخصّصة</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setTab('users')} className="px-5 py-2.5 bg-white text-red-700 font-bold rounded-xl text-sm">👥 إدارة المستخدمين</button>
                    <button onClick={() => setTab('roles')} className="px-5 py-2.5 bg-white/20 backdrop-blur-sm font-bold rounded-xl text-sm">🔐 الصلاحيات</button>
                    <button onClick={() => onNavigate('reports')} className="px-5 py-2.5 bg-white/20 backdrop-blur-sm font-bold rounded-xl text-sm">📊 التقارير</button>
                    {/* ENHANCEMENT: Direct link to full dashboard — was broken before the routing fix */}
                    <button onClick={() => onNavigate('dashboard')} className="px-5 py-2.5 bg-white/20 backdrop-blur-sm font-bold rounded-xl text-sm flex items-center gap-2">
                      🏠 لوحة التحكم الكاملة
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'المديرين', value: stats.admins, icon: '👑', color: 'from-red-500 to-red-700' },
                  { label: 'المدرسين', value: stats.instructors, icon: '👨‍🏫', color: 'from-violet-500 to-violet-700' },
                  { label: 'الطلاب', value: stats.students, icon: '👨‍🎓', color: 'from-blue-500 to-blue-700' },
                  { label: 'الكورسات', value: stats.totalCourses, icon: '📚', color: 'from-emerald-500 to-emerald-700' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-xl shadow-lg mb-3`}>{s.icon}</div>
                    <p className="text-2xl font-black text-slate-800">{s.value}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Roles Overview */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">🔐 الأدوار المعرّفة ({currentRoles.length})</h3>
                  <button onClick={() => setTab('roles')} className="text-sm text-blue-600 font-bold hover:underline">عرض الكل</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentRoles.map(role => {
                    const count = allUsers.filter(u => u.role === role.id).length;
                    return (
                      <div key={role.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: role.color }}>{role.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800">{role.nameAr}</p>
                          <p className="text-xs text-slate-500">{role.permissions.length} صلاحية • {count} مستخدم</p>
                        </div>
                        {role.isSystem && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">أساسي</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-4">👥 أحدث المستخدمين</h3>
                <div className="space-y-2">
                  {allUsers.slice(0, 6).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-sm font-bold`}>{u.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ backgroundColor: getRoleColor(u.role) + '20', color: getRoleColor(u.role) }}>{getRoleName(u.role)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-800">👥 إدارة المستخدمين ({filteredUsers.length})</h2>
                <button onClick={() => setShowAddUser(true)} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center gap-2">+ مستخدم جديد</button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input type="text" value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="بحث بالاسم أو البريد أو الدور..."
                      className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">المستخدم</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">البريد</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الدور</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الصلاحية</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">الحالة</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-600">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => {
                        const role = currentRoles.find(r => r.id === u.role);
                        return (
                          <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-sm font-bold`}>{u.name.charAt(0)}</div>
                                <span className="font-bold text-slate-800">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ backgroundColor: (role?.color || '#666') + '20', color: role?.color || '#666' }}>
                                {role?.icon} {role?.nameAr || u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-500">{role?.permissions.length || 0} صلاحية</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-3 py-1 rounded-full font-bold ${u.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{u.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button onClick={() => { setTab('roles'); const r = currentRoles.find(ro => ro.id === u.role); if (r) startEditRole(r.id); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg text-xs" title="تعديل الصلاحيات">🔐</button>
                                {u.id !== 'admin' && <button onClick={() => { if (confirm(`حذف ${u.name}؟`)) show('تم الحذف'); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-xs" title="حذف">🗑️</button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ROLES & PERMISSIONS */}
          {tab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">🔐 الأدوار والصلاحيات</h2>
                <button onClick={() => setShowAddRole(true)} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 flex items-center gap-2">+ دور جديد</button>
              </div>

              {/* Roles List */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentRoles.map(role => (
                  <div key={role.id} className={`bg-white rounded-3xl border-2 overflow-hidden transition-all ${editingRole === role.id ? 'border-red-400 shadow-lg shadow-red-500/10' : 'border-slate-200'}`}>
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ backgroundColor: role.color }}>{role.icon}</div>
                        <div>
                          <h3 className="font-bold text-slate-800">{role.nameAr}</h3>
                          <p className="text-xs text-slate-500">{role.permissions.length} صلاحية • {allUsers.filter(u => u.role === role.id).length} مستخدم</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {role.isSystem && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">أساسي</span>}
                        <button onClick={() => startEditRole(role.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg text-sm">✏️</button>
                        {!role.isSystem && <button onClick={() => deleteRole(role.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg text-sm">🗑️</button>}
                      </div>
                    </div>
                    <div className="p-4">
                      {editingRole === role.id ? (
                        <div className="space-y-3">
                          {ALL_PERMISSION_GROUPS.map(group => (
                            <div key={group.label}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-slate-700">{group.label}</span>
                                <button onClick={() => toggleGroup(group.perms)} className="text-[10px] text-blue-600 hover:underline font-medium">
                                  {group.perms.every(p => selectedPerms.includes(p as Permission)) ? 'إلغاء الكل' : 'تحديد الكل'}
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {group.perms.map(p => {
                                  const selected = selectedPerms.includes(p as Permission);
                                  return (
                                    <button key={p} onClick={() => togglePerm(p as Permission)}
                                      className={`text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all ${selected ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                      style={selected ? { backgroundColor: role.color } : {}}>
                                      {PERMISSION_LABELS[p]}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <button onClick={saveRole} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700">💾 حفظ</button>
                            <button onClick={() => setEditingRole(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">إلغاء</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.slice(0, 8).map(p => (
                            <span key={p} className="text-[10px] px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: role.color + '15', color: role.color }}>{PERMISSION_LABELS[p]}</span>
                          ))}
                          {role.permissions.length > 8 && <span className="text-[10px] px-2 py-1 rounded-lg font-medium bg-slate-100 text-slate-500">+{role.permissions.length - 8} أخرى</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Permission Legend */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-3">📖 دليل الصلاحيات</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {ALL_PERMISSION_GROUPS.map(g => (
                    <div key={g.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="font-bold text-slate-700 mb-1">{g.label}</p>
                      <p className="text-slate-500">{g.perms.map(p => PERMISSION_LABELS[p]).join(' • ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {tab === 'audit' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">📋 سجل النشاط</h2>
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <div className="space-y-3">
                  {[
                    { time: 'الآن', user: 'المدير العام', action: 'قام بتسجيل الدخول', icon: '🔑', color: 'bg-emerald-50 text-emerald-700' },
                    { time: 'قبل 5 دقائق', user: 'د. أحمد محمد', action: 'أغلق الباب', icon: '🚪', color: 'bg-blue-50 text-blue-700' },
                    { time: 'قبل 15 دقيقة', user: 'محمد عبدالرحمن', action: 'اشترى كورس Python', icon: '🛒', color: 'bg-purple-50 text-purple-700' },
                    { time: 'قبل 30 دقيقة', user: 'فاطمة أحمد', action: 'سجّلت في كورس الويب', icon: '📝', color: 'bg-amber-50 text-amber-700' },
                    { time: 'قبل ساعة', user: 'نورا إبراهيم', action: 'أضافت درس جديد', icon: '📖', color: 'bg-cyan-50 text-cyan-700' },
                    { time: 'قبل ساعتين', user: 'المدير العام', action: 'غيّر إعدادات الصلاحيات', icon: '🔐', color: 'bg-red-50 text-red-700' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${log.color}`}>{log.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{log.user} — {log.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-xl font-black text-slate-800">⚙️ إعدادات النظام</h2>
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">بيانات المدير</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="text-sm text-slate-600">الاسم</span><span className="text-sm font-bold">{currentUser?.name || 'المدير العام'}</span></div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="text-sm text-slate-600">البريد</span><span className="text-sm font-bold" dir="ltr">admin@academy.com</span></div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="text-sm text-slate-600">الدور</span><span className="text-sm font-bold text-red-600">👑 مدير عام</span></div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="text-sm text-slate-600">الصلاحيات</span><span className="text-sm font-bold text-emerald-600">كل الصلاحيات</span></div>
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">التحكم في النظام</h3>
                <div className="space-y-3">
                  <button onClick={() => onNavigate('settings')} className="w-full p-4 bg-slate-50 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-3">
                    <span>⚙️</span> الإعدادات العامة
                  </button>
                  <button onClick={() => { if (confirm('هل تريد إعادة تعيين كل البيانات؟')) show('تمت إعادة التعيين'); }} className="w-full p-4 bg-red-50 rounded-xl text-left text-sm font-medium text-red-700 hover:bg-red-100 transition-colors flex items-center gap-3">
                    <span>🔄</span> إعادة تعيين البيانات
                  </button>
                </div>
              </div>
              <button onClick={onLogout} className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">🚪 تسجيل الخروج</button>
            </div>
          )}
        </main>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">إضافة مستخدم جديد</h3>
              <button onClick={() => setShowAddUser(false)} className="text-2xl text-slate-400 hover:text-red-500">×</button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="الاسم" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500" />
              <input type="email" placeholder="البريد الإلكتروني" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500" dir="ltr" />
              <input type="tel" placeholder="الهاتف" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500" />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500">
                {currentRoles.map(r => <option key={r.id} value={r.id}>{r.icon} {r.nameAr}</option>)}
              </select>
              <input type="password" placeholder="كلمة المرور" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500" dir="ltr" />
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setShowAddUser(false)} className="flex-1 py-3 border border-slate-200 rounded-2xl font-medium text-slate-600">إلغاء</button>
              <button onClick={() => {
                if (!newUser.name || !newUser.email) { show('أكمل البيانات ❌'); return; }
                // FIX: 'admin' role was incorrectly falling into the student creation branch.
                // Admins are system-level users and cannot be created from this panel.
                if (newUser.role === 'admin') {
                  show('لا يمكن إنشاء حساب مدير من هنا — استخدم صفحة تسجيل المدير ❌');
                  return;
                }
                if (newUser.role === 'student_role') {
                  const newStudent: Student = {
                    id: Date.now().toString(),
                    name: newUser.name, email: newUser.email, phone: newUser.phone,
                    gender: 'ذكر', address: '', dateOfBirth: '', enrollDate: new Date().toISOString().split('T')[0],
                    courseId: '', status: 'نشط', photo: '', notes: '',
                  };
                  onAddStudent([...students, newStudent]);
                } else {
                  const newInstructor: Instructor = {
                    id: Date.now().toString(),
                    name: newUser.name, email: newUser.email, phone: newUser.phone,
                    specialty: '', hireDate: new Date().toISOString().split('T')[0],
                    salary: 0, status: 'نشط', photo: '', bio: '',
                  };
                  onAddInstructor([...instructors, newInstructor]);
                }
                show('تمت إضافة المستخدم ✅');
                setShowAddUser(false);
                setNewUser({ name: '', email: '', phone: '', role: 'student_role', password: '' });
              }} className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700">إضافة</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">إنشاء دور جديد</h3>
              <button onClick={() => setShowAddRole(false)} className="text-2xl text-slate-400 hover:text-red-500">×</button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="اسم الدور (مثال: مساعد إداري)" value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500" />
              <p className="text-xs text-slate-500">بعد الإنشاء يمكنك تعديل الصلاحيات من شاشة الأدوار</p>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setShowAddRole(false)} className="flex-1 py-3 border border-slate-200 rounded-2xl font-medium text-slate-600">إلغاء</button>
              <button onClick={addRole} className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700">إنشاء</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
