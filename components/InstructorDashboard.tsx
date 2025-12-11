
import React, { useState, useMemo } from 'react';
import { User, Course, Lesson, Progress, ChatSession, Role } from '../types';
import CourseCard from './CourseCard';
import { PlusIcon, BookOpenIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon } from './icons';
import CreateCourseModal from './CreateCourseModal';
import InstructorCourseDetail from './InstructorCourseDetail';
import ChatWindow from './ChatWindow';

interface InstructorDashboardProps {
  user: User;
  allCourses: Course[];
  allUsers: User[];
  allProgress: Progress[];
  chatSessions: ChatSession[];
  onAddCourse: (courseData: { title: string; description: string; lessons: Pick<Lesson, 'title' | 'type' | 'content'>[] }, instructorId: number) => void;
  onSendMessage: (courseId: number, studentId: number, content: string, senderId: number) => void;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ user, allCourses, allUsers, allProgress, chatSessions, onAddCourse, onSendMessage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'chats'>('courses');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showAdminChat, setShowAdminChat] = useState(false);

  const { instructorCourses } = useMemo(() => {
    const courses = allCourses.filter(course => course.instructorIds.includes(user.id));
    return { instructorCourses: courses };
  }, [allCourses, user.id]);

  const myChats = useMemo(() => {
      // Filter out Admin chats (Course ID 0) from the main student list
      const courseIds = instructorCourses.map(c => c.id);
      return chatSessions.filter(s => courseIds.includes(s.courseId)).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [chatSessions, instructorCourses]);

  const handleCreateCourse = (courseData: { title: string; description: string; lessons: Pick<Lesson, 'title' | 'type' | 'content'>[] }) => {
    onAddCourse(courseData, user.id);
    setIsModalOpen(false);
  };

  // Admin Chat Session logic
  const adminSession = chatSessions.find(s => s.courseId === 0 && s.studentId === user.id);
  const admins = allUsers.filter(u => u.role === Role.Admin);
  
  if (selectedCourse) {
    return <InstructorCourseDetail 
              course={selectedCourse} 
              allUsers={allUsers}
              allProgress={allProgress}
              onBack={() => setSelectedCourse(null)} 
            />;
  }

  const renderCoursesTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">My Courses</h3>
        <div className="flex space-x-3">
            <button
              onClick={() => setShowAdminChat(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
            >
              <ShieldCheckIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span>Contact Admin</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create New Course</span>
            </button>
        </div>
      </div>
      
      {instructorCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructorCourses.map(course => (
            <CourseCard key={course.id} course={course} allUsers={allUsers} onClick={() => setSelectedCourse(course)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-xl font-medium text-gray-700 dark:text-gray-300">No courses yet</h4>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Click 'Create New Course' to get started.</p>
        </div>
      )}
    </div>
  );

  const renderChatsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Student Messages</h3>

      {myChats.length > 0 ? (
        <div className="space-y-4">
          {myChats.map(session => {
            const student = allUsers.find(u => u.id === session.studentId);
            const course = allCourses.find(c => c.id === session.courseId);
            const lastMessage = session.messages[session.messages.length - 1];
            
            return (
              <div 
                key={session.id} 
                onClick={() => setActiveSessionId(session.id)}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{student?.name.replace(/ \(.+\)/, '') || 'Unknown Student'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                      <BookOpenIcon className="w-3 h-3 mr-1" />
                      Course: <span className="text-indigo-600 dark:text-indigo-400 ml-1 font-medium">{course?.title}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {new Date(session.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1 mr-4">
                      <span className="font-semibold text-gray-900 dark:text-white">{lastMessage.senderName}:</span> {lastMessage.content}
                  </p>
                  {lastMessage.senderId !== user.id && (
                      <span className="h-2 w-2 bg-indigo-600 rounded-full flex-shrink-0 animate-pulse"></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No active student chats.</p>
        </div>
      )}
    </div>
  );

  const activeSession = chatSessions.find(s => s.id === activeSessionId);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h2>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('courses')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'courses' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
                <BookOpenIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'courses' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>My Courses</span>
            </button>
             <button
                onClick={() => setActiveTab('chats')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm relative ${activeTab === 'chats' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
                <ChatBubbleLeftRightIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'chats' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>Student Messages</span>
            </button>
        </nav>
      </div>

       <div className="mt-8">
          {activeTab === 'courses' && renderCoursesTab()}
          {activeTab === 'chats' && renderChatsTab()}
      </div>

      {activeSession && activeSessionId && (
           <ChatWindow
            currentUser={user}
            session={activeSession}
            courseTitle={allCourses.find(c => c.id === activeSession.courseId)?.title || ''}
            instructors={allUsers.filter(u => allCourses.find(c => c.id === activeSession.courseId)?.instructorIds.includes(u.id))}
            onSendMessage={(content) => onSendMessage(activeSession.courseId, activeSession.studentId, content, user.id)}
            onClose={() => setActiveSessionId(null)}
          />
      )}

      {showAdminChat && (
          <ChatWindow
            currentUser={user}
            session={adminSession}
            courseTitle="System Administration Support"
            instructors={admins} // Admins act as instructors in this context
            onSendMessage={(content) => onSendMessage(0, user.id, content, user.id)} // Course ID 0 reserved for System
            onClose={() => setShowAdminChat(false)}
          />
      )}

      {isModalOpen && (
        <CreateCourseModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateCourse}
        />
      )}
    </div>
  );
};

export default InstructorDashboard;
