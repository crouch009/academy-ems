import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Courses from './components/Courses';
import Instructors from './components/Instructors';
import Schedule from './components/Schedule';
import Attendance from './components/Attendance';
import Grades from './components/Grades';
import Finance from './components/Finance';
import Reports from './components/Reports';
import Lessons from './components/Lessons';
import AICourseBuilder from './components/AICourseBuilder';
import MediaStudio from './components/MediaStudio';
import AIChatbot from './components/AIChatbot';
import Payments from './components/Payments';
import ExportCenter from './components/ExportCenter';
import Certificates from './components/Certificates';
import LiveClasses from './components/LiveClasses';
import Community from './components/Community';
import CareerCenter from './components/CareerCenter';
import ParentPortal from './components/ParentPortal';
import LearningPaths from './components/LearningPaths';
import Partnerships from './components/Partnerships';
import SettingsPanel from './components/SettingsPanel';
import Auth from './components/Auth';
import StudentProfile from './components/StudentProfile';
import InstructorProfile from './components/InstructorProfile';
import AdminProfile from './components/AdminProfile';
import { Page, Student, Instructor, Course, AttendanceRecord, GradeRecord, PaymentRecord, ExpenseRecord, Lesson, UserRole, SystemSettings, Certificate, ForumPost, LiveClass, Project, JobOpportunity, LearningPath, Parent, Institution, RoleDefinition } from './types';
import { store } from './data/store';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [settings, setSettings] = useState<SystemSettings>(store.getSettings());
  // FIX: Admin can now toggle between profile management and full dashboard
  const [adminShowDashboard, setAdminShowDashboard] = useState(false);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: 'student' | 'instructor' | 'admin' } | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>(store.get('roles', []));
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    // ── Seed demo data on first run ──────────────────────
    if (store.getAllStudents().length === 0) {
      const demoStudents: Student[] = [
        { id: 'std-001', name: 'أحمد محمد علي', email: 'ahmed@demo.com', phone: '01012345678', gender: 'ذكر', address: 'القاهرة', dateOfBirth: '2000-05-15', enrollDate: '2024-09-01', courseId: 'crs-001', status: 'نشط', photo: '', notes: '', password: '123456' },
        { id: 'std-002', name: 'سارة إبراهيم', email: 'sara@demo.com', phone: '01123456789', gender: 'أنثى', address: 'الجيزة', dateOfBirth: '2001-03-20', enrollDate: '2024-09-01', courseId: 'crs-002', status: 'نشط', photo: '', notes: '', password: '123456' },
        { id: 'std-003', name: 'محمد خالد حسن', email: 'mkhaled@demo.com', phone: '01234567890', gender: 'ذكر', address: 'الإسكندرية', dateOfBirth: '1999-11-10', enrollDate: '2024-10-01', courseId: 'crs-001', status: 'نشط', photo: '', notes: '', password: '123456' },
        { id: 'std-004', name: 'نور الهدى عبدالله', email: 'nour@demo.com', phone: '01098765432', gender: 'أنثى', address: 'المنصورة', dateOfBirth: '2002-07-22', enrollDate: '2024-10-15', courseId: 'crs-003', status: 'نشط', photo: '', notes: '', password: '123456' },
        { id: 'std-005', name: 'كريم عمر سعد', email: 'karim@demo.com', phone: '01187654321', gender: 'ذكر', address: 'أسيوط', dateOfBirth: '2000-01-30', enrollDate: '2024-11-01', courseId: 'crs-002', status: 'متوقف', photo: '', notes: '', password: '123456' },
        { id: 'std-006', name: 'منى فاروق', email: 'mona@demo.com', phone: '01276543210', gender: 'أنثى', address: 'طنطا', dateOfBirth: '2001-09-05', enrollDate: '2024-08-01', courseId: 'crs-001', status: 'متخرج', photo: '', notes: '', password: '123456' },
      ];
      store.setAllStudents(demoStudents);
    }

    if (store.getAllInstructors().length === 0) {
      const demoInstructors = [
        { id: 'ins-001', name: 'د. عمرو فتحي', email: 'amr@demo.com', phone: '01011112222', specialty: 'علوم الحاسب', hireDate: '2023-01-15', salary: 8000, status: 'نشط' as const, photo: '', bio: 'دكتوراه في علوم الحاسب من جامعة القاهرة', password: '123456' },
        { id: 'ins-002', name: 'أ. هند محمود', email: 'hend@demo.com', phone: '01022223333', specialty: 'تصميم الجرافيك', hireDate: '2023-03-01', salary: 6500, status: 'نشط' as const, photo: '', bio: 'خبرة 8 سنوات في تصميم الجرافيك والهوية البصرية', password: '123456' },
        { id: 'ins-003', name: 'م. طارق الشافعي', email: 'tarek@demo.com', phone: '01033334444', specialty: 'هندسة البرمجيات', hireDate: '2023-06-01', salary: 9000, status: 'نشط' as const, photo: '', bio: 'مهندس برمجيات أول في شركات كبرى لأكثر من 10 سنوات', password: '123456' },
      ];
      store.setAllInstructors(demoInstructors as any);
    }

    if (store.getAllCourses().length === 0) {
      const demoCourses = [
        { id: 'crs-001', name: 'تطوير تطبيقات الويب', code: 'WEB-101', description: 'كورس شامل لتعلم HTML, CSS, JavaScript و React', instructorId: 'ins-003', capacity: 30, enrolledCount: 3, price: 2500, currency: 'EGP' as const, status: 'نشط' as const, startDate: '2024-09-01', endDate: '2025-01-31', schedule: 'السبت والثلاثاء', image: '', level: 'مبتدئ' as const, hasCertificate: true, passingGrade: 60 },
        { id: 'crs-002', name: 'تصميم الجرافيك الاحترافي', code: 'GFX-201', description: 'أدوبي فوتوشوب وإليستريتور من الصفر للاحتراف', instructorId: 'ins-002', capacity: 25, enrolledCount: 2, price: 1800, currency: 'EGP' as const, status: 'نشط' as const, startDate: '2024-10-01', endDate: '2025-02-28', schedule: 'الأحد والأربعاء', image: '', level: 'مبتدئ' as const, hasCertificate: true, passingGrade: 60 },
        { id: 'crs-003', name: 'علوم البيانات وتعلم الآلة', code: 'DS-301', description: 'Python وتحليل البيانات والذكاء الاصطناعي', instructorId: 'ins-001', capacity: 20, enrolledCount: 1, price: 3200, currency: 'EGP' as const, status: 'نشط' as const, startDate: '2024-11-01', endDate: '2025-03-31', schedule: 'الاثنين والخميس', image: '', level: 'متوسط' as const, hasCertificate: true, passingGrade: 70 },
      ];
      store.setAllCourses(demoCourses as any);
    }

    if (store.getAllPayments().length === 0) {
      const demoPayments = [
        { id: 'pay-001', studentId: 'std-001', courseId: 'crs-001', amount: 2500, date: '2024-09-01', status: 'مدفوع' as const, method: 'كاش', notes: '' },
        { id: 'pay-002', studentId: 'std-002', courseId: 'crs-002', amount: 1800, date: '2024-09-05', status: 'مدفوع' as const, method: 'تحويل بنكي', notes: '' },
        { id: 'pay-003', studentId: 'std-003', courseId: 'crs-001', amount: 1250, date: '2024-10-01', status: 'معلق' as const, method: 'فيزا', notes: 'قسط أول' },
        { id: 'pay-004', studentId: 'std-004', courseId: 'crs-003', amount: 3200, date: '2024-10-15', status: 'مدفوع' as const, method: 'كاش', notes: '' },
        { id: 'pay-005', studentId: 'std-005', courseId: 'crs-002', amount: 900, date: '2024-11-01', status: 'معلق' as const, method: 'فودافون كاش', notes: 'قسط أول' },
      ];
      store.setAllPayments(demoPayments as any);
    }

    if (store.getAllAttendance().length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const demoAttendance = [
        { id: 'att-001', studentId: 'std-001', courseId: 'crs-001', date: today, status: 'حاضر' as const, notes: '' },
        { id: 'att-002', studentId: 'std-002', courseId: 'crs-002', date: today, status: 'حاضر' as const, notes: '' },
        { id: 'att-003', studentId: 'std-003', courseId: 'crs-001', date: today, status: 'غائب' as const, notes: 'بدون إذن' },
        { id: 'att-004', studentId: 'std-004', courseId: 'crs-003', date: today, status: 'حاضر' as const, notes: '' },
        { id: 'att-005', studentId: 'std-005', courseId: 'crs-002', date: today, status: 'متأخر' as const, notes: '' },
      ];
      store.setAllAttendance(demoAttendance as any);
    }
    // ────────────────────────────────────────────────────

    setStudents(store.getAllStudents());
    setInstructors(store.getAllInstructors());
    setCourses(store.getAllCourses());
    setAttendance(store.getAllAttendance());
    setGrades(store.getAllGrades());
    setPayments(store.getAllPayments());
    setExpenses(store.getAllExpenses());
    setLessons(store.getAllLessons());
    setCertificates(store.getAllCertificates());
    setForumPosts(store.getAllForumPosts());
    setLiveClasses(store.getAllLiveClasses());
    setProjects(store.getAllProjects());
    setJobs(store.getAllJobOpportunities());
    setLearningPaths(store.getAllLearningPaths());
    setParents(store.getAllParents());
    setInstitutions(store.getAllInstitutions());
    setLoading(false);
  }, []);

  const handleUpdateSettings = useCallback((newSettings: SystemSettings) => {
    setSettings(newSettings);
    store.setSettings(newSettings);
    showToast('تم حفظ الإعدادات');
  }, [showToast]);

  const handleUpdateStudents = useCallback((data: Student[]) => { setStudents(data); store.setAllStudents(data); }, []);
  const handleUpdateInstructors = useCallback((data: Instructor[]) => { setInstructors(data); store.setAllInstructors(data); }, []);
  const handleUpdateCourses = useCallback((data: Course[]) => { setCourses(data); store.setAllCourses(data); }, []);
  const handleUpdateAttendance = useCallback((data: AttendanceRecord[]) => { setAttendance(data); store.setAllAttendance(data); }, []);
  const handleUpdateGrades = useCallback((data: GradeRecord[]) => { setGrades(data); store.setAllGrades(data); }, []);
  const handleUpdatePayments = useCallback((data: PaymentRecord[]) => { setPayments(data); store.setAllPayments(data); }, []);
  const handleUpdateExpenses = useCallback((data: ExpenseRecord[]) => { setExpenses(data); store.setAllExpenses(data); }, []);
  const handleUpdateLessons = useCallback((data: Lesson[]) => { setLessons(data); store.setAllLessons(data); }, []);
  const handleUpdateCertificates = useCallback((data: Certificate[]) => { setCertificates(data); store.setAllCertificates(data); }, []);
  const handleUpdateForumPosts = useCallback((data: ForumPost[]) => { setForumPosts(data); store.setAllForumPosts(data); }, []);
  const handleUpdateLiveClasses = useCallback((data: LiveClass[]) => { setLiveClasses(data); store.setAllLiveClasses(data); }, []);
  const handleUpdateProjects = useCallback((data: Project[]) => { setProjects(data); store.setAllProjects(data); }, []);
  const handleUpdateJobs = useCallback((data: JobOpportunity[]) => { setJobs(data); store.setAllJobOpportunities(data); }, []);
  const handleUpdateLearningPaths = useCallback((data: LearningPath[]) => { setLearningPaths(data); store.setAllLearningPaths(data); }, []);
  const handleUpdateParents = useCallback((data: Parent[]) => { setParents(data); store.setAllParents(data); }, []);
  const handleUpdateInstitutions = useCallback((data: Institution[]) => { setInstitutions(data); store.setAllInstitutions(data); }, []);

  // Auth Handlers
  const handleLogin = useCallback((user: { id: string; name: string; role: 'student' | 'instructor' | 'admin' }) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setUserRole(user.role as UserRole);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole('student');          // FIX: was resetting to 'admin' — security leak
    setAdminShowDashboard(false);    // FIX: reset admin dashboard toggle on logout
    setCurrentPage('dashboard');
  }, []);

  const handleRegister = useCallback((data: { role: string; userData: any }) => {
    if (data.role === 'student') {
      const newStudent: Student = {
        ...data.userData,
        id: data.userData.id || Date.now().toString(), // FIX: use pre-generated ID from social login if provided
        gender: data.userData.gender || 'ذكر',
        status: 'نشط',
        enrollDate: new Date().toISOString().split('T')[0],
        courseId: '',
        photo: '',
        notes: '',
      };
      // Use store directly to avoid stale closure bug
      const currentStudents = store.getAllStudents();
      const updatedStudents = [...currentStudents, newStudent];
      store.setAllStudents(updatedStudents);
      setStudents(updatedStudents);
    } else {
      const newInstructor: Instructor = {
        ...data.userData,
        id: Date.now().toString(),
        hireDate: new Date().toISOString().split('T')[0],
        salary: 0,
        status: 'نشط',
        photo: '',
        bio: '',
      };
      // Use store directly to avoid stale closure bug
      const currentInstructors = store.getAllInstructors();
      const updatedInstructors = [...currentInstructors, newInstructor];
      store.setAllInstructors(updatedInstructors);
      setInstructors(updatedInstructors);
    }
  }, []);

  const pageTitles: Record<Page, string> = {
    dashboard: 'لوحة التحكم', students: 'الطلاب', courses: 'الكورسات', instructors: 'المدرسين',
    schedule: 'جدول المحاضرات', attendance: 'الحضور', grades: 'الدرجات', finance: 'المالية',
    reports: 'التقارير', lessons: 'الدروس والمحتوى', 'ai-builder': 'منشئ الكورس بالذكاء الاصطناعي',
    'media-studio': 'استوديو الوسائط', chatbot: 'المعلم الذكي', payments: 'بوابات الدفع', 'export-center': 'مركز التصدير',
    certificates: 'الشهادات', 'live-classes': 'الفصول المباشرة', community: 'المجتمع',
    career: 'المركز المهني', parents: 'أولياء الأمور', pathways: 'مسارات التعلم', partners: 'الشراكات المؤسسية',
    settings: 'الإعدادات',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard students={students} courses={courses} instructors={instructors} payments={payments} expenses={expenses} attendance={attendance} siteSettings={settings} onNavigate={setCurrentPage} />;
      case 'students': return <Students students={students} courses={courses} onUpdate={handleUpdateStudents} />;
      case 'courses': return <Courses courses={courses} instructors={instructors} onUpdate={handleUpdateCourses} />;
      case 'instructors': return <Instructors instructors={instructors} onUpdate={handleUpdateInstructors} />;
      case 'schedule': return <Schedule courses={courses} />;
      case 'attendance': return <Attendance students={students} courses={courses} attendance={attendance} onUpdate={handleUpdateAttendance} />;
      case 'grades': return <Grades students={students} courses={courses} grades={grades} onUpdate={handleUpdateGrades} />;
      case 'finance': return <Finance students={students} courses={courses} payments={payments} expenses={expenses} onUpdatePayments={handleUpdatePayments} onUpdateExpenses={handleUpdateExpenses} />;
      case 'reports': return <Reports students={students} courses={courses} instructors={instructors} attendance={attendance} grades={grades} payments={payments} />;
      case 'lessons': return <Lessons courses={courses} lessons={lessons} onUpdate={handleUpdateLessons} />;
      case 'ai-builder': return <AICourseBuilder courses={courses} lessons={lessons} onUpdateCourses={handleUpdateCourses} onUpdateLessons={handleUpdateLessons} />;
      case 'media-studio': return <MediaStudio courses={courses} lessons={lessons} onUpdateLessons={handleUpdateLessons} />;
      case 'chatbot': return <AIChatbot courses={courses} lessons={lessons} />;
      case 'payments': return <Payments courses={courses} payments={payments} onUpdatePayments={handleUpdatePayments} />;
      case 'export-center': return <ExportCenter courses={courses} lessons={lessons} />;
      case 'certificates': return <Certificates courses={courses} students={students} grades={grades} certificates={certificates} onUpdateCertificates={handleUpdateCertificates} />;
      case 'live-classes': return <LiveClasses courses={courses} liveClasses={liveClasses} instructors={instructors} onUpdateLiveClasses={handleUpdateLiveClasses} />;
      case 'community': return <Community courses={courses} students={students} instructors={instructors} posts={forumPosts} onUpdatePosts={handleUpdateForumPosts} />;
      case 'career': return <CareerCenter courses={courses} students={students} jobs={jobs} projects={projects} onUpdateJobs={handleUpdateJobs} onUpdateProjects={handleUpdateProjects} />;
      case 'parents': return <ParentPortal parents={parents} students={students} courses={courses} grades={grades} attendance={attendance} onUpdateParents={handleUpdateParents} />;
      case 'pathways': return <LearningPaths courses={courses} paths={learningPaths} onUpdatePaths={handleUpdateLearningPaths} />;
      case 'partners': return <Partnerships institutions={institutions} courses={courses} onUpdateInstitutions={handleUpdateInstitutions} />;
      // FIX: 'settings' was missing — was falling to default (Dashboard) silently
      case 'settings':
        return (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            currentRole={userRole}
            onRoleChange={setUserRole}
            onClose={() => setCurrentPage('dashboard')}
          />
        );
      default: return <Dashboard students={students} courses={courses} instructors={instructors} payments={payments} expenses={expenses} attendance={attendance} siteSettings={settings} onNavigate={setCurrentPage} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  // Show Auth Page if not logged in
  if (!isLoggedIn) {
    return <Auth students={students} instructors={instructors} onLogin={handleLogin} onRegister={handleRegister} siteName={settings.siteName} />;
  }

  // FIX: Admin was ALWAYS trapped in AdminProfile with no way to reach main dashboard.
  // Now: adminShowDashboard=false → show profile; clicking any nav item → sets adminShowDashboard=true → main dashboard.
  if (currentUser?.role === 'admin' && !adminShowDashboard) {
    return (
      <AdminProfile
        students={students}
        instructors={instructors}
        courses={courses}
        roles={roles}
        currentUser={currentUser}
        onUpdateRoles={(updatedRoles) => { setRoles(updatedRoles); store.set('roles', updatedRoles); }}
        onAddStudent={handleUpdateStudents}
        onAddInstructor={handleUpdateInstructors}
        onNavigate={(page) => { setCurrentPage(page); setAdminShowDashboard(true); }} // FIX: also activates dashboard
        onLogout={handleLogout}
      />
    );
  }

  // Show Student Profile
  if (currentUser?.role === 'student') {
    const student = students.find(s => s.id === currentUser.id);
    // FIX: was silently rendering nothing when student not found; now shows a clear error
    if (!student) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6" dir="rtl">
          <div className="bg-white rounded-3xl p-10 text-center max-w-sm shadow-lg">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">لم يُعثر على بيانات الطالب</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              ربما تم حذف الحساب أو لم يكتمل التسجيل. يرجى التواصل مع المدير.
            </p>
            <button onClick={handleLogout} className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">
              تسجيل خروج
            </button>
          </div>
        </div>
      );
    }
    return (
      <StudentProfile
        student={student}
        courses={courses}
        grades={grades}
        attendance={attendance}
        certificates={certificates}
        lessons={lessons}
        chatMessages={store.getStudentChatMessages(student.id)} // ENHANCEMENT: persisted chat per student
        onSendMessage={(text: string) => {                       // ENHANCEMENT: save each message to store
          store.addStudentChatMessage(student.id, {
            role: 'user',
            content: text,
            timestamp: Date.now(),
          });
        }}
        onNavigate={setCurrentPage}
        onUpdateStudent={(updated) => {
          const updatedList = students.map(s => s.id === updated.id ? updated : s);
          setStudents(updatedList);
          store.setAllStudents(updatedList);
        }}
        onLogout={handleLogout}
      />
    );
  }

  // Show Instructor Profile
  if (currentUser?.role === 'instructor') {
    const instructor = instructors.find(i => i.id === currentUser.id);
    // FIX: was silently rendering nothing when instructor not found; now shows a clear error
    if (!instructor) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6" dir="rtl">
          <div className="bg-white rounded-3xl p-10 text-center max-w-sm shadow-lg">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">لم يُعثر على بيانات المدرب</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              ربما تم حذف الحساب أو لم يكتمل التسجيل. يرجى التواصل مع المدير.
            </p>
            <button onClick={handleLogout} className="w-full py-3 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all">
              تسجيل خروج
            </button>
          </div>
        </div>
      );
    }
    return (
      <InstructorProfile
        instructor={instructor}
        courses={courses}
        students={students}
        attendance={attendance}
        grades={grades}
        onUpdateInstructor={(updated) => {
          const updatedList = instructors.map(i => i.id === updated.id ? updated : i);
          setInstructors(updatedList);
          store.setAllInstructors(updatedList);
        }}
        onLogout={handleLogout}
      />
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        visiblePages={settings.visiblePages}
        currentUserName={currentUser?.name}
      />

      {/* Main area — offset by sidebar */}
      <div style={{ marginRight: 'var(--sidebar-w)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── HEADER ── */}
        <header style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          height: 'var(--header-h)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 30,
          gap: 12,
        }}>
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-600)', flexShrink: 0 }}
          >
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-400)', fontSize: '0.78rem' }}>
              <span>الرئيسية</span>
              <span>›</span>
              <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{pageTitles[currentPage]}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: 1 }}>
              {students.length} طالب &nbsp;·&nbsp; {courses.length} كورس &nbsp;·&nbsp; {instructors.length} مدرس
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {currentUser?.role === 'admin' && adminShowDashboard && (
              <button
                onClick={() => setAdminShowDashboard(false)}
                className="pes-btn pes-btn-ghost"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
              >
                <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="hidden sm:inline">الملف الشخصي</span>
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--gray-200)', background: 'var(--white)', cursor: 'pointer', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>

            {/* Notification bell */}
            <button
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--gray-200)', background: 'var(--white)', cursor: 'pointer', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: 'var(--orange-500)', borderRadius: '50%', border: '1.5px solid white' }} />
            </button>

            {/* User chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px 5px 8px',
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)',
              borderRadius: 8, cursor: 'pointer',
            }} onClick={handleLogout} title="تسجيل خروج">
              <div style={{
                width: 26, height: 26,
                background: 'var(--navy-700)',
                borderRadius: '50%',
                color: 'white', fontWeight: 700, fontSize: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {(currentUser?.name || 'م')[0]}
              </div>
              <span className="hidden sm:inline" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)' }}>{currentUser?.name || 'المدير'}</span>
              <svg className="hidden sm:block" style={{ width: 12, height: 12, color: 'var(--gray-400)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{ flex: 1, padding: '20px 24px' }}>
          {renderPage()}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: '1px solid var(--gray-200)',
          background: 'var(--white)',
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.75rem', color: 'var(--gray-400)',
        }}>
          <span>{settings.siteName} — {settings.siteDescription}</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-600)', display: 'inline-block' }} />
              حفظ تلقائي
            </span>
            <span>v3.0.0</span>
          </div>
        </footer>
      </div>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          currentRole={userRole}
          onRoleChange={setUserRole}
          onClose={() => setShowSettings(false)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 50,
          padding: '10px 18px',
          borderRadius: 8,
          color: 'white', fontSize: '0.85rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: 'var(--shadow-lg)',
          background: toast.type === 'success' ? 'var(--green-600)' : toast.type === 'error' ? 'var(--red-600)' : 'var(--navy-600)',
        }}>
          {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'i'} {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
