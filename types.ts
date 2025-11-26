
export enum Role {
  Student = 'Student',
  Instructor = 'Instructor',
  Admin = 'Admin',
}

export interface UserPreferences {
  learningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  learningStyle: 'Visual' | 'Analogy' | 'Step-by-step' | 'Scenario-based' | 'Technical';
  tonePreference: 'Friendly' | 'Formal' | 'Concise' | 'Detailed' | 'Motivational';
  pacePreference: 'Slow' | 'Normal' | 'Fast';
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface User {
  id: number;
  name: string; // Full Name
  displayName?: string; // Custom display name
  username: string;
  password?: string; 
  role: Role;
  enrolledCourseIds: number[];
  preferences?: UserPreferences;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  contactEmail?: string;
  socialLinks?: SocialLinks;
}

export interface Lesson {
  id: number;
  title: string;
  content: string; 
  type: 'video' | 'text' | 'quiz';
}

export interface Review {
  studentId: number;
  rating: number; 
  comment: string;
  createdAt: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructorIds: number[]; 
  lessons: Lesson[];
  imageUrl: string;
  reviews: Review[];
}

export interface Progress {
  userId: number;
  courseId: number;
  completedLessons: number[]; 
  quizScores: Record<number, number>; 
  timeSpent: Record<number, number>; 
  bookmarkedLessonIds?: number[]; 
}

export interface CourseRecommendation {
    courseId: number;
    courseName: string;
    reason: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizFeedback {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

export interface LearningInsight {
  strengths: string[];
  areasForImprovement: string[];
  recommendedActions: string[];
  overallProgressSummary: string;
}

export enum QueryStatus {
  Pending = 'Pending',
  Resolved = 'Resolved',
}

export interface Query {
  id: number;
  studentId: number;
  instructorId: number;
  courseId: number;
  lessonId: number;
  question: string;
  attachment?: string; 
  reply?: string;
  status: QueryStatus;
  createdAt: string;
  repliedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  role: Role;
}

export interface ChatSession {
  id: string;
  courseId: number;
  studentId: number;
  messages: ChatMessage[];
  lastMessageAt: string;
}