import { 
  Student, Instructor, Course, AttendanceRecord, GradeRecord, 
  PaymentRecord, ExpenseRecord, Lesson, SystemSettings, EnrollmentRequest,
  Certificate, ForumPost, LiveClass, Project, JobOpportunity, LearningPath,
  Parent, Institution
} from '../types';

class StoreManager {
  private getKey(key: string): string {
    return `edu_${key}`;
  }

  get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(this.getKey(key));
      if (data) return JSON.parse(data);
      localStorage.setItem(this.getKey(key), JSON.stringify(defaultValue));
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  // === Settings ===
  getSettings(): SystemSettings {
    const defaultSettings: SystemSettings = {
      siteName: 'أكاديمية المعرفة',
      siteDescription: 'منصتك الذكية للتعليم والتدريب',
      logo: '🎓',
      primaryColor: '#3B82F6',
      visiblePages: [
        'dashboard', 'students', 'courses', 'lessons', 'instructors', 'schedule', 
        'attendance', 'grades', 'finance', 'reports', 'ai-builder', 'media-studio', 
        'chatbot', 'payments', 'export-center', 'certificates', 'live-classes', 
        'community', 'career', 'parents', 'pathways', 'partners'
      ],
      requireAdminApproval: true,
      defaultLanguage: 'ar',
      defaultCurrency: 'SAR',
      paymentGateways: [
        { id: 'mada', name: 'مدى', enabled: true, mode: 'sandbox', icon: '💳' },
        { id: 'visa', name: 'Visa', enabled: true, mode: 'sandbox', icon: '💳' },
        { id: 'tamara', name: 'تمارا', enabled: true, mode: 'sandbox', icon: '🛍️' },
        { id: 'tabby', name: 'تابي', enabled: true, mode: 'sandbox', icon: '🛒' },
        { id: 'applepay', name: 'Apple Pay', enabled: true, mode: 'sandbox', icon: '🍎' },
        { id: 'fawry', name: 'فوري', enabled: true, mode: 'sandbox', icon: '🏧' },
        { id: 'stripe', name: 'Stripe', enabled: true, mode: 'sandbox', icon: '💰' },
      ],
      enableAI: true,
      enableSCORMExport: true,
      enableFlashcards: true,
      enableAIChatbot: true,
      enableAvatarVideos: true,
      integrations: {
        zoom: { enabled: true },
        googleClassroom: { enabled: true },
        linkedin: { enabled: true },
        googleDrive: { enabled: true },
      },
      certificateSettings: {
        enableBlockchain: true,
        enableLinkedInShare: true,
        defaultTemplate: 'modern',
        requirePassingGrade: true,
      },
    };
    return this.get<SystemSettings>('settings', defaultSettings);
  }

  setSettings(settings: SystemSettings): void {
    this.set('settings', settings);
  }

  // === Core Entities ===
  getAllStudents(): Student[] { return this.get<Student[]>('students', []); }
  setAllStudents(data: Student[]): void { this.set('students', data); }
  
  getAllInstructors(): Instructor[] { return this.get<Instructor[]>('instructors', []); }
  setAllInstructors(data: Instructor[]): void { this.set('instructors', data); }
  
  getAllCourses(): Course[] { return this.get<Course[]>('courses', []); }
  setAllCourses(data: Course[]): void { this.set('courses', data); }
  
  getAllAttendance(): AttendanceRecord[] { return this.get<AttendanceRecord[]>('attendance', []); }
  setAllAttendance(data: AttendanceRecord[]): void { this.set('attendance', data); }
  
  getAllGrades(): GradeRecord[] { return this.get<GradeRecord[]>('grades', []); }
  setAllGrades(data: GradeRecord[]): void { this.set('grades', data); }
  
  getAllPayments(): PaymentRecord[] { return this.get<PaymentRecord[]>('payments', []); }
  setAllPayments(data: PaymentRecord[]): void { this.set('payments', data); }
  
  getAllExpenses(): ExpenseRecord[] { return this.get<ExpenseRecord[]>('expenses', []); }
  setAllExpenses(data: ExpenseRecord[]): void { this.set('expenses', data); }
  
  getAllLessons(): Lesson[] { return this.get<Lesson[]>('lessons', []); }
  setAllLessons(data: Lesson[]): void { this.set('lessons', data); }

  getAllEnrollments(): EnrollmentRequest[] { return this.get<EnrollmentRequest[]>('enrollments', []); }
  setAllEnrollments(data: EnrollmentRequest[]): void { this.set('enrollments', data); }

  // === New Entities ===
  getAllCertificates(): Certificate[] { return this.get<Certificate[]>('certificates', []); }
  setAllCertificates(data: Certificate[]): void { this.set('certificates', data); }

  getAllForumPosts(): ForumPost[] { return this.get<ForumPost[]>('forumPosts', []); }
  setAllForumPosts(data: ForumPost[]): void { this.set('forumPosts', data); }

  getAllLiveClasses(): LiveClass[] { return this.get<LiveClass[]>('liveClasses', []); }
  setAllLiveClasses(data: LiveClass[]): void { this.set('liveClasses', data); }

  getAllProjects(): Project[] { return this.get<Project[]>('projects', []); }
  setAllProjects(data: Project[]): void { this.set('projects', data); }

  getAllJobOpportunities(): JobOpportunity[] { return this.get<JobOpportunity[]>('jobs', []); }
  setAllJobOpportunities(data: JobOpportunity[]): void { this.set('jobs', data); }

  getAllLearningPaths(): LearningPath[] { return this.get<LearningPath[]>('learningPaths', []); }
  setAllLearningPaths(data: LearningPath[]): void { this.set('learningPaths', data); }

  getAllParents(): Parent[] { return this.get<Parent[]>('parents', []); }
  setAllParents(data: Parent[]): void { this.set('parents', data); }

  getAllInstitutions(): Institution[] { return this.get<Institution[]>('institutions', []); }
  setAllInstitutions(data: Institution[]): void { this.set('institutions', data); }

  // === Chat Messages (per student) — matches StudentProfile's ChatMessage format ===
  getStudentChatMessages(studentId: string): { role: 'user' | 'assistant'; content: string; timestamp: number }[] {
    return this.get<{ role: 'user' | 'assistant'; content: string; timestamp: number }[]>(`chat_${studentId}`, []);
  }
  addStudentChatMessage(studentId: string, msg: { role: 'user' | 'assistant'; content: string; timestamp: number }): void {
    const existing = this.getStudentChatMessages(studentId);
    // Keep last 100 messages to avoid localStorage bloat
    const trimmed = [...existing, msg].slice(-100);
    this.set(`chat_${studentId}`, trimmed);
  }
  setStudentChatMessages(studentId: string, msgs: { role: 'user' | 'assistant'; content: string; timestamp: number }[]): void {
    this.set(`chat_${studentId}`, msgs);
  }

  resetAll(): void {
    ['students', 'instructors', 'courses', 'attendance', 'grades', 'payments', 'expenses', 
     'lessons', 'enrollments', 'certificates', 'forumPosts', 'liveClasses', 'projects',
     'jobs', 'learningPaths', 'parents', 'institutions', 'settings'].forEach(k => localStorage.removeItem(this.getKey(k)));
  }

  exportAll(): string {
    return JSON.stringify({
      students: this.getAllStudents(),
      instructors: this.getAllInstructors(),
      courses: this.getAllCourses(),
      attendance: this.getAllAttendance(),
      grades: this.getAllGrades(),
      payments: this.getAllPayments(),
      expenses: this.getAllExpenses(),
      lessons: this.getAllLessons(),
      enrollments: this.getAllEnrollments(),
      certificates: this.getAllCertificates(),
      forumPosts: this.getAllForumPosts(),
      liveClasses: this.getAllLiveClasses(),
      projects: this.getAllProjects(),
      jobs: this.getAllJobOpportunities(),
      learningPaths: this.getAllLearningPaths(),
      parents: this.getAllParents(),
      institutions: this.getAllInstitutions(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  importAll(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.students) this.set('students', data.students);
      if (data.instructors) this.set('instructors', data.instructors);
      if (data.courses) this.set('courses', data.courses);
      if (data.attendance) this.set('attendance', data.attendance);
      if (data.grades) this.set('grades', data.grades);
      if (data.payments) this.set('payments', data.payments);
      if (data.expenses) this.set('expenses', data.expenses);
      if (data.lessons) this.set('lessons', data.lessons);
      if (data.enrollments) this.set('enrollments', data.enrollments);
      if (data.certificates) this.set('certificates', data.certificates);
      if (data.forumPosts) this.set('forumPosts', data.forumPosts);
      if (data.liveClasses) this.set('liveClasses', data.liveClasses);
      if (data.projects) this.set('projects', data.projects);
      if (data.jobs) this.set('jobs', data.jobs);
      if (data.learningPaths) this.set('learningPaths', data.learningPaths);
      if (data.parents) this.set('parents', data.parents);
      if (data.institutions) this.set('institutions', data.institutions);
      if (data.settings) this.set('settings', data.settings);
      return true;
    } catch {
      return false;
    }
  }
}

export const store = new StoreManager();
