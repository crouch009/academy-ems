// === Permission System ===
export type Permission =
  | 'dashboard.view' | 'students.view' | 'students.create' | 'students.edit' | 'students.delete'
  | 'instructors.view' | 'instructors.create' | 'instructors.edit' | 'instructors.delete'
  | 'courses.view' | 'courses.create' | 'courses.edit' | 'courses.delete' | 'courses.publish'
  | 'lessons.view' | 'lessons.create' | 'lessons.edit' | 'lessons.delete' | 'lessons.publish'
  | 'grades.view' | 'grades.create' | 'grades.edit'
  | 'attendance.view' | 'attendance.create' | 'attendance.edit'
  | 'certificates.view' | 'certificates.create' | 'certificates.issue'
  | 'payments.view' | 'payments.process' | 'payments.refund'
  | 'reports.view' | 'reports.export'
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete' | 'users.assign_role'
  | 'settings.view' | 'settings.edit'
  | 'finance.view' | 'finance.edit'
  | 'community.moderate' | 'community.view'
  | 'live.view' | 'live.host' | 'live.create'
  | 'builder.view' | 'builder.use'
  | 'ai.view' | 'ai.use'
  | 'marketplace.view' | 'marketplace.buy' | 'marketplace.manage'
  | 'parents.view' | 'parents.edit'
  | 'export.all'
  | 'partners.view' | 'partners.manage'
  | 'career.view' | 'career.manage';

export interface RoleDefinition {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  permissions: Permission[];
  color: string;
  icon: string;
  isSystem: boolean; // cannot be deleted
  maxUsers: number;
}

// === Core Entities ===
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'ذكر' | 'أنثى';
  address: string;
  enrollDate: string;
  courseId: string;
  status: 'نشط' | 'متوقف' | 'متخرج';
  photo: string;
  notes: string;
  password?: string;         // ENHANCEMENT: stored (plain for demo) — checked on login
  parentId?: string;
  enrolledCourses?: string[];
  preferredLanguage?: 'ar' | 'en';
  linkedinProfile?: string;
  resumeUrl?: string;
  completedCourses?: string[];
  certificatesIds?: string[];
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  childrenIds: string[];
  notificationPreferences: {
    weeklyProgress: boolean;
    gradeUpdates: boolean;
    attendanceAlerts: boolean;
  };
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hireDate: string;
  salary: number;
  status: 'نشط' | 'متوقف';
  photo: string;
  bio: string;
  password?: string;         // ENHANCEMENT: stored (plain for demo) — checked on login
  languages?: string[];
  linkedinUrl?: string;
  rating?: number;
  studentsCount?: number;
}

export interface Institution {
  id: string;
  name: string;
  type: 'university' | 'company' | 'organization';
  logo: string;
  description: string;
  country: string;
  website?: string;
  partneredCourses: string[]; // course IDs
  verified: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  instructorId: string;
  partnerInstitutionId?: string;
  capacity: number;
  enrolledCount: number;
  price: number;
  currency: 'SAR' | 'AED' | 'USD' | 'EGP' | 'JOD' | 'KWD';
  duration: number;
  schedule: ScheduleItem[];
  status: 'نشط' | 'مكتمل' | 'معلق';
  startDate: string;
  endDate: string;
  color: string;
  introVideo?: string;
  introDescription?: string;
  language: 'ar' | 'en';
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  // Certificates
  hasCertificate: boolean;
  certificateTemplate?: string;
  passingGrade: number; // %
  // AI Features
  aiGenerated?: boolean;
  aiSourceType?: 'pdf' | 'idea' | 'manual';
  aiSourceContent?: string; // FIX: was used in AICourseBuilder but missing from type
  hasAIChatbot?: boolean;
  hasFlashcards?: boolean;
  hasAIVideos?: boolean;
  // Learning Path
  learningPathId?: string;
  prerequisites?: string[];
  // Industry
  industryTags?: string[];
  skills?: string[];
  // Partnerships
  partneredWith?: string[]; // institution IDs
  // Integration
  googleClassroomId?: string;
  linkedinSkillId?: string;
}

export interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  isLiveClass?: boolean;
  zoomMeetingId?: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  courseIds: string[];
  certificateOnCompletion: boolean;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  estimatedHours: number;
  industryRecognition: boolean;
}

// === Assessments ===
export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  examName: string;
  maxScore: number;
  score: number;
  date: string;
  notes: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

// === Attendance & Live ===
export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'حاضر' | 'غائب' | 'متأخر' | 'بعذر';
  notes: string;
  isLive?: boolean;
  meetingId?: string;
  durationMinutes?: number;
}

export interface LiveClass {
  id: string;
  courseId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingUrl: string; // Zoom-like URL
  recordingUrl?: string;
  isRecorded: boolean;
  instructorId: string;
  attendeesCount: number;
  materialsUrls?: string[]; // Google Drive links
  status: 'مجدول' | 'جاري' | 'منتهى';
}

// === Financial ===
export interface PaymentRecord {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  currency: 'SAR' | 'AED' | 'USD' | 'EGP' | 'JOD' | 'KWD';
  date: string;
  method: 'كاش' | 'تحويل بنكي' | 'فيزا' | 'مدى' | 'أبل باي' | 'فودافون كاش' | 'تمارا' | 'تابي' | 'Stripe';
  status: 'مدفوع' | 'معلق' | 'ملغي';
  transactionId?: string;
  gateway?: 'mada' | 'visa' | 'tamara' | 'tabby' | 'stripe' | 'manual';
  notes: string;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'مدفوع' | 'معلق';
}

// === Content ===
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'فيديو' | 'شرح نصي' | 'تمرين' | 'اختبار' | 'فلاش كاردز' | 'صورة تفاعلية' | 'مشروع عملي';
  content: string;
  duration: string;
  order: number;
  isPublished: boolean;
  isLocked: boolean;
  createdAt: string;
  aiGenerated?: boolean;
  mediaUrl?: string;
  thumbnailUrl?: string;
  attachments?: { name: string; url: string; type: string }[];
  googleDocUrl?: string;
  projectRequirements?: string;
}

export interface Flashcard {
  id: string;
  courseId: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Project {
  id: string;
  courseId: string;
  studentId: string;
  title: string;
  description: string;
  submissionUrl?: string;
  submittedDate?: string;
  feedback?: string;
  grade?: number;
  status: 'جاري' | 'مُسلم' | 'تم التقييم';
  industryReviewed?: boolean;
  reviewerNotes?: string;
}

// === Enrollment ===
export interface EnrollmentRequest {
  id: string;
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedDate?: string;
  enrollmentCode?: string;
  notes?: string;
}

// === Certificates ===
export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate?: string;
  grade?: number;
  verificationUrl: string;
  blockchainHash?: string;
  institutionLogo?: string;
  instructorSignature?: string;
  skills?: string[];
  linkedinShared?: boolean;
  pdfUrl?: string;
}

// === Community ===
export interface ForumPost {
  id: string;
  courseId: string;
  authorId: string;
  authorRole: 'student' | 'instructor' | 'admin';
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: ForumReply[];
  tags: string[];
  isPinned: boolean;
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorRole: 'student' | 'instructor' | 'admin';
  content: string;
  createdAt: string;
  likes: number;
}

export interface AIChatMessage {
  id: string;
  courseId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// === Career ===
export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  location: string;
  remote: boolean;
  salaryRange?: string;
  applyUrl?: string;
  postedBy: string;
  postedDate: string;
  relatedCourseIds: string[];
}

// === Settings & Navigation ===
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  primaryColor: string;
  visiblePages: Page[];
  requireAdminApproval: boolean;
  defaultLanguage: 'ar' | 'en';
  defaultCurrency: 'SAR' | 'AED' | 'USD' | 'EGP' | 'JOD' | 'KWD';
  paymentGateways: PaymentGatewayConfig[];
  enableAI: boolean;
  enableSCORMExport: boolean;
  enableFlashcards: boolean;
  enableAIChatbot: boolean;
  enableAvatarVideos: boolean;
  // New: Integrations
  integrations: {
    zoom: { enabled: boolean; apiKey?: string };
    googleClassroom: { enabled: boolean; clientId?: string };
    linkedin: { enabled: boolean; clientId?: string };
    googleDrive: { enabled: boolean; apiKey?: string };
  };
  // Certificate settings
  certificateSettings: {
    enableBlockchain: boolean;
    enableLinkedInShare: boolean;
    defaultTemplate: string;
    requirePassingGrade: boolean;
  };
}

export interface PaymentGatewayConfig {
  id: 'mada' | 'visa' | 'tamara' | 'tabby' | 'stripe' | 'applepay' | 'fawry';
  name: string;
  enabled: boolean;
  apiKey?: string;
  mode: 'sandbox' | 'production';
  icon: string;
}

export type Page = 
  | 'dashboard' | 'students' | 'courses' | 'instructors' | 'schedule' 
  | 'attendance' | 'grades' | 'finance' | 'reports' | 'lessons' 
  | 'ai-builder' | 'media-studio' | 'chatbot' | 'payments' | 'export-center'
  | 'certificates' | 'live-classes' | 'community' | 'career' | 'parents' | 'pathways' | 'partners'
  | 'settings';

export type UserRole = 'admin' | 'instructor' | 'student' | 'parent';
