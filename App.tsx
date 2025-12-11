import React, { useState, useEffect } from 'react';
import { User, Role, Course, Progress, Lesson, Query, QueryStatus, ChatSession, ChatMessage, UserPreferences } from './types';
import LoginScreen from './components/LoginScreen';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import UserProfileModal from './components/UserProfileModal';
import LearningPreferencesModal from './components/LearningPreferencesModal';
import LandingPage from './components/LandingPage';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');

  // --- State Initialization ---
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // --- Load Data Effect ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.fetchAllData();
        setUsers(data.users);
        setCourses(data.courses);
        setProgress(data.progress);
        setChatSessions(data.chatSessions);
        setServerStatus(data.mode as 'online' | 'offline');
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Session Persistence (Auto-Login) ---
  useEffect(() => {
    const savedUserId = localStorage.getItem('smart_lms_current_user_id');
    if (savedUserId && users.length > 0) {
      const user = users.find(u => u.id === parseInt(savedUserId));
      if (user) {
        setCurrentUser(user);
        setShowLanding(false);
      }
    }
  }, [users]); // Run when users are loaded

  // --- Modals State ---
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // --- Auth Handlers ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLanding(false);
    localStorage.setItem('smart_lms_current_user_id', user.id.toString());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLanding(true);
    localStorage.removeItem('smart_lms_current_user_id');
  };

  const handleRegister = (newUser: Omit<User, 'id' | 'enrolledCourseIds'>) => {
    if (users.some(u => u.username === newUser.username)) {
      return { success: false, message: 'Username already exists' };
    }
    const user: User = {
      ...newUser,
      id: Date.now(),
      enrolledCourseIds: [],
      profilePicture: undefined
    };
    
    // Optimistic Update
    setUsers([...users, user]);
    // Persist
    dataService.addUser(user);
    
    return { success: true, message: 'Account created successfully' };
  };

  // --- Profile Update Handler ---
  const handleUpdateProfile = (updatedUser: User) => {
      // Optimistic update
      if (currentUser && currentUser.id === updatedUser.id) {
          setCurrentUser(updatedUser);
      }
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      // Persist
      dataService.updateUser(updatedUser);
  };

  // --- Chat Handlers ---
  const handleSendMessage = (courseId: number, studentId: number, content: string, senderId: number) => {
      setChatSessions(prev => {
          const existingSessionIndex = prev.findIndex(s => s.courseId === courseId && s.studentId === studentId);
          const newMessage: ChatMessage = {
              id: Date.now().toString(),
              senderId,
              senderName: users.find(u => u.id === senderId)?.displayName || users.find(u => u.id === senderId)?.name || 'Unknown',
              content,
              timestamp: new Date().toISOString(),
              role: users.find(u => u.id === senderId)?.role || Role.Student
          };

          let updatedSession: ChatSession;
          let newSessionsArray: ChatSession[];

          if (existingSessionIndex >= 0) {
              updatedSession = {
                  ...prev[existingSessionIndex],
                  messages: [...prev[existingSessionIndex].messages, newMessage],
                  lastMessageAt: new Date().toISOString()
              };
              newSessionsArray = [...prev];
              newSessionsArray[existingSessionIndex] = updatedSession;
          } else {
              updatedSession = {
                  id: Date.now().toString(),
                  courseId,
                  studentId,
                  messages: [newMessage],
                  lastMessageAt: new Date().toISOString()
              };
              newSessionsArray = [...prev, updatedSession];
          }

          // Persist
          dataService.saveChatSession(updatedSession);
          
          return newSessionsArray;
      });
  };

  // --- User Actions ---

  const handleEnroll = (userId: number, courseId: number) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId && !user.enrolledCourseIds.includes(courseId)) {
        const updated = { ...user, enrolledCourseIds: [...user.enrolledCourseIds, courseId] };
        dataService.updateUser(updated); // Persist
        
        // Update current user if it's them
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
        }
        return updated;
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
      if (!currentUser) return;
      
      const updatedUser = { ...currentUser, preferences: newPrefs };
      
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      
      // Persist
      dataService.updateUser(updatedUser);
      
      setShowPreferencesModal(false);
  };

  const handleNotifyInstructorPreferences = (studentId: number, courseId: number, prefs: UserPreferences) => {
    const systemMessage = `[System Notification] I have enabled Adaptive Learning Mode. 
    My Preferences: 
    - Level: ${prefs.learningLevel}
    - Style: ${prefs.learningStyle}
    - Tone: ${prefs.tonePreference}`;

    handleSendMessage(courseId, studentId, systemMessage, studentId);
  };

  // --- Progress Handlers ---

  const handleToggleLesson = (userId: number, courseId: number, lessonId: number) => {
    setProgress(prevProgress => {
      const userCourseProgress = prevProgress.find(p => p.userId === userId && p.courseId === courseId);
      let updatedProgressEntry: Progress;

      if (userCourseProgress) {
        const isCompleted = userCourseProgress.completedLessons.includes(lessonId);
        const updatedLessons = isCompleted
          ? userCourseProgress.completedLessons.filter(id => id !== lessonId)
          : [...userCourseProgress.completedLessons, lessonId];
        
        updatedProgressEntry = { ...userCourseProgress, completedLessons: updatedLessons };
      } else {
        updatedProgressEntry = {
          userId,
          courseId,
          completedLessons: [lessonId],
          quizScores: {},
          timeSpent: {},
          bookmarkedLessonIds: []
        };
      }

      // Persist
      dataService.saveProgress(updatedProgressEntry);

      // Return new state
      if (userCourseProgress) {
          return prevProgress.map(p => p.userId === userId && p.courseId === courseId ? updatedProgressEntry : p);
      } else {
          return [...prevProgress, updatedProgressEntry];
      }
    });
  };

  const handleToggleBookmark = (userId: number, courseId: number, lessonId: number) => {
      setProgress(prevProgress => {
          const userCourseProgress = prevProgress.find(p => p.userId === userId && p.courseId === courseId);
          let updatedProgressEntry: Progress;

          if (userCourseProgress) {
              const isBookmarked = userCourseProgress.bookmarkedLessonIds?.includes(lessonId);
              const updatedBookmarks = isBookmarked
                  ? (userCourseProgress.bookmarkedLessonIds || []).filter(id => id !== lessonId)
                  : [...(userCourseProgress.bookmarkedLessonIds || []), lessonId];
              
              updatedProgressEntry = { ...userCourseProgress, bookmarkedLessonIds: updatedBookmarks };
          } else {
              updatedProgressEntry = {
                  userId,
                  courseId,
                  completedLessons: [],
                  quizScores: {},
                  timeSpent: {},
                  bookmarkedLessonIds: [lessonId]
              };
          }

          dataService.saveProgress(updatedProgressEntry);

          if (userCourseProgress) {
               return prevProgress.map(p => p.userId === userId && p.courseId === courseId ? updatedProgressEntry : p);
          } else {
               return [...prevProgress, updatedProgressEntry];
          }
      });
  }

  const handleUpdateQuizScore = (userId: number, courseId: number, lessonId: number, score: number) => {
      setProgress(prevProgress => {
          const userCourseProgress = prevProgress.find(p => p.userId === userId && p.courseId === courseId);
          if (userCourseProgress) {
              const updatedEntry = { ...userCourseProgress, quizScores: { ...userCourseProgress.quizScores, [lessonId]: score } };
              dataService.saveProgress(updatedEntry);
              return prevProgress.map(p => p.userId === userId && p.courseId === courseId ? updatedEntry : p);
          }
          return prevProgress;
      });
  };

  const handleUpdateTimeSpent = (userId: number, courseId: number, lessonId: number, timeToAdd: number) => {
      setProgress(prevProgress => {
          const userCourseProgress = prevProgress.find(p => p.userId === userId && p.courseId === courseId);
          let updatedEntry: Progress;

          if (userCourseProgress) {
              const currentTime = userCourseProgress.timeSpent[lessonId] || 0;
              updatedEntry = { ...userCourseProgress, timeSpent: { ...userCourseProgress.timeSpent, [lessonId]: currentTime + timeToAdd } };
          } else {
               updatedEntry = {
                  userId,
                  courseId,
                  completedLessons: [],
                  quizScores: {},
                  timeSpent: { [lessonId]: timeToAdd }
              };
          }
          
          dataService.saveProgress(updatedEntry);

          if (userCourseProgress) {
              return prevProgress.map(p => p.userId === userId && p.courseId === courseId ? updatedEntry : p);
          } else {
              return [...prevProgress, updatedEntry];
          }
      });
  };

  // --- Instructor/Admin Handlers ---
  
  const handleAddCourse = (courseData: { title: string; description: string; lessons: any[] }, instructorId: number) => {
      const newCourse: Course = {
          id: Date.now(),
          ...courseData,
          instructorIds: [instructorId],
          imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(courseData.title)}&background=random&size=512&font-size=0.33&bold=true&color=fff`,
          reviews: []
      };
      setCourses([...courses, newCourse]);
      dataService.addCourse(newCourse);
  };

  const handleEditCourse = (updatedCourse: Course) => {
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      dataService.updateCourse(updatedCourse);
  };

  const handleDeleteCourse = (courseId: number) => {
      setCourses(courses.filter(c => c.id !== courseId));
      dataService.deleteCourse(courseId);
      
      // Also remove enrollments locally (Server should handle this ideally, but doing it here for consistency)
      setUsers(users.map(u => ({
          ...u,
          enrolledCourseIds: u.enrolledCourseIds.filter(id => id !== courseId)
      })));
  };

  const handleDeleteUser = (userId: number) => {
      setUsers(users.filter(u => u.id !== userId));
      dataService.deleteUser(userId);
  };

  const handleChangeUserRole = (userId: number, newRole: Role) => {
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) {
          const newUserData = { ...updatedUser, role: newRole };
          setUsers(users.map(u => u.id === userId ? newUserData : u));
          dataService.updateUser(newUserData);
      }
  };
  
  const handleAddReview = (courseId: number, review: { studentId: number; rating: number; comment: string }) => {
      setCourses(courses.map(c => {
          if (c.id === courseId) {
              const updatedCourse = { ...c, reviews: [...c.reviews, { ...review, createdAt: new Date().toISOString() }] };
              dataService.updateCourse(updatedCourse);
              return updatedCourse;
          }
          return c;
      }));
  };

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem('smart_lms_theme') === 'dark';
  });

  useEffect(() => {
      if (darkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('smart_lms_theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('smart_lms_theme', 'light');
      }
  }, [darkMode]);

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
      );
  }

  if (showLanding && !currentUser) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLanding(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-gray-100 dark:bg-gray-900">
      {!currentUser ? (
        <LoginScreen users={users} onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <>
          <Header 
            user={currentUser} 
            onLogout={handleLogout} 
            onShowProfile={() => setShowProfileModal(true)}
            onShowPreferences={() => setShowPreferencesModal(true)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            serverStatus={serverStatus}
          />
          <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentUser.role === Role.Student && (
              <StudentDashboard
                user={currentUser}
                allCourses={courses}
                allProgress={progress}
                chatSessions={chatSessions}
                allUsers={users}
                onEnroll={handleEnroll}
                onToggleLesson={handleToggleLesson}
                onToggleBookmark={handleToggleBookmark}
                onAskQuery={() => {}} // Deprecated
                onUpdateQuizScore={handleUpdateQuizScore}
                onUpdateTimeSpent={handleUpdateTimeSpent}
                onAddReview={handleAddReview}
                onSendMessage={handleSendMessage}
                onUpdatePreferences={handleUpdatePreferences}
                onNotifyInstructor={handleNotifyInstructorPreferences}
              />
            )}
            {currentUser.role === Role.Instructor && (
              <InstructorDashboard
                user={currentUser}
                allCourses={courses}
                allUsers={users}
                allProgress={progress}
                chatSessions={chatSessions}
                onAddCourse={handleAddCourse}
                onSendMessage={handleSendMessage}
              />
            )}
            {currentUser.role === Role.Admin && (
              <AdminDashboard
                user={currentUser}
                users={users}
                courses={courses}
                progress={progress}
                chatSessions={chatSessions}
                onDeleteUser={handleDeleteUser}
                onDeleteCourse={handleDeleteCourse}
                onEditCourse={handleEditCourse}
                onChangeUserRole={handleChangeUserRole}
                onAddUser={handleRegister}
                onSendMessage={handleSendMessage}
                onUpdateUser={handleUpdateProfile} // Pass this down
              />
            )}
          </div>
        </>
      )}
      
      {showProfileModal && currentUser && (
          <UserProfileModal 
            user={currentUser}
            allCourses={courses}
            userProgress={progress.filter(p => p.userId === currentUser.id)}
            onClose={() => setShowProfileModal(false)}
            onUpdateUser={handleUpdateProfile}
          />
      )}
      
      {showPreferencesModal && currentUser && (
          <LearningPreferencesModal 
            currentPreferences={currentUser.preferences}
            onSave={handleUpdatePreferences}
            onClose={() => setShowPreferencesModal(false)}
          />
      )}
    </div>
  );
};

export default App;