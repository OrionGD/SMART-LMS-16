
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Preserving numeric IDs from frontend
  name: String,
  displayName: String,
  username: String,
  password: String,
  role: String,
  enrolledCourseIds: [Number],
  profilePicture: String,
  coverPhoto: String,
  bio: String,
  contactEmail: String,
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String
  },
  preferences: {
    learningLevel: String,
    learningStyle: String,
    tonePreference: String,
    pacePreference: String
  }
});

const LessonSchema = new mongoose.Schema({
  id: Number,
  title: String,
  content: String,
  type: String
});

const ReviewSchema = new mongoose.Schema({
  studentId: Number,
  rating: Number,
  comment: String,
  createdAt: String
});

const CourseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  description: String,
  instructorIds: [Number],
  imageUrl: String,
  lessons: [LessonSchema],
  reviews: [ReviewSchema]
});

const ProgressSchema = new mongoose.Schema({
  userId: Number,
  courseId: Number,
  completedLessons: [Number],
  quizScores: { type: Map, of: Number }, // Map of lessonId -> Score
  timeSpent: { type: Map, of: Number }, // Map of lessonId -> Seconds
  bookmarkedLessonIds: [Number]
});

const ChatMessageSchema = new mongoose.Schema({
  id: String,
  senderId: Number,
  senderName: String,
  content: String,
  timestamp: String,
  role: String
});

const ChatSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: Number,
  studentId: Number,
  messages: [ChatMessageSchema],
  lastMessageAt: String
});

export const User = mongoose.model('User', UserSchema);
export const Course = mongoose.model('Course', CourseSchema);
export const Progress = mongoose.model('Progress', ProgressSchema);
export const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);