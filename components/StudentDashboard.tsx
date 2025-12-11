
import React, { useState, useMemo } from 'react';
import { User, Course, Progress, CourseRecommendation, LearningInsight, ChatSession, Role, UserPreferences } from '../types';
import { getCourseRecommendations, generateLearningInsights } from '../services/geminiService';
import CourseCard from './CourseCard';
import { SparklesIcon, SearchIcon, BookOpenIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, ChartBarIcon, XCircleIcon, TrophyIcon } from './icons';
import CourseDetail from './CourseDetail';
import ChatWindow from './ChatWindow';
import { TRADITIONAL_USER_AVATAR } from '../constants';

interface StudentDashboardProps {
  user: User;
  allCourses: Course[];
  allProgress: Progress[];
  chatSessions: ChatSession[];
  allUsers: User[];
  onEnroll: (userId: number, courseId: number) => void;
  onToggleLesson: (userId: number, courseId: number, lessonId: number) => void;
  onToggleBookmark: (userId: number, courseId: number, lessonId: number) => void;
  onAskQuery: (studentId: number, courseId: number, lessonId: number, question: string, attachment?: string) => void;
  onUpdateQuizScore: (userId: number, courseId: number, lessonId: number, score: number) => void;
  onUpdateTimeSpent: (userId: number, courseId: number, lessonId: number, timeToAdd: number) => void;
  onAddReview: (courseId: number, review: { studentId: number; rating: number; comment: string }) => void;
  onSendMessage: (courseId: number, studentId: number, content: string, senderId: number) => void;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onNotifyInstructor: (studentId: number, courseId: number, prefs: UserPreferences) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
    user, allCourses, allProgress, chatSessions, allUsers, 
    onEnroll, onToggleLesson, onToggleBookmark, onAskQuery, onUpdateQuizScore, onUpdateTimeSpent, onAddReview, onSendMessage,
    onUpdatePreferences, onNotifyInstructor
}) => {
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'chats' | 'insights' | 'leaderboard'>('courses');
  const [activeChatCourseId, setActiveChatCourseId] = useState<number | null>(null);

  const [insights, setInsights] = useState<LearningInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);


  const { enrolledCourses, userProgress, availableCourses } = useMemo(() => {
    const enrolled = allCourses.filter(course => user.enrolledCourseIds.includes(course.id));
    const progress = allProgress.filter(p => p.userId === user.id);
    const available = allCourses.filter(course => !user.enrolledCourseIds.includes(course.id));
    return { enrolledCourses: enrolled, userProgress: progress, availableCourses: available };
  }, [user, allCourses, allProgress]);
  
  const filteredAvailableCourses = useMemo(() => {
    if (!searchTerm) return availableCourses;
    return availableCourses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableCourses]);

  const leaderboardData = useMemo(() => {
      const students = allUsers.filter(u => u.role === Role.Student);
      return students.map(student => {
          const studentProgress = allProgress.filter(p => p.userId === student.id);
          const totalLessonsCompleted = studentProgress.reduce((acc, p) => acc + p.completedLessons.length, 0);
          
          let totalQuizScore = 0;
          let quizCount = 0;
          
          studentProgress.forEach(p => {
             // Explicitly cast to number[] to avoid type errors in reduce
             const scores = Object.values(p.quizScores || {}) as number[];
             if (scores.length > 0) {
                 totalQuizScore += scores.reduce((a, b) => a + b, 0);
                 quizCount += scores.length;
             }
          });
          
          const avgQuizScore = quizCount > 0 ? totalQuizScore / quizCount : 0;
          
          // Scoring Algorithm: 10 points per lesson + Average Quiz Score
          const totalScore = (totalLessonsCompleted * 10) + Math.round(avgQuizScore);

          return {
              id: student.id,
              name: student.name,
              avatar: student.profilePicture || TRADITIONAL_USER_AVATAR,
              lessonsCompleted: totalLessonsCompleted,
              avgScore: Math.round(avgQuizScore),
              totalScore
          };
      }).sort((a, b) => b.totalScore - a.totalScore).slice(0, 10); // Top 10
  }, [allUsers, allProgress]);

  const handleGetRecommendations = async () => {
    setLoadingRecommendations(true);
    setRecommendationError(null);
    try {
        const result = await getCourseRecommendations(user, allCourses, userProgress);
        setRecommendations(result);
    } catch (e) {
        setRecommendationError('AI recommendations unavailable, please try again later.');
    } finally {
        setLoadingRecommendations(false);
    }
  };

  const handleGetInsights = async () => {
      setLoadingInsights(true);
      setInsightsError(null);
      try {
        const result = await generateLearningInsights(user, allCourses, userProgress);
        setInsights(result);
      } catch (e) {
        setInsightsError('AI analysis unavailable, please try again later.');
      } finally {
        setLoadingInsights(false);
      }
  }
  
  const getProgressPercent = (courseId: number) => {
    const course = allCourses.find(c => c.id === courseId);
    const progress = userProgress.find(p => p.courseId === courseId);
    if (!course || !progress || course.lessons.length === 0) return 0;
    return (progress.completedLessons.length / course.lessons.length) * 100;
  };

  const handleOpenChat = (courseId: number) => {
      setActiveChatCourseId(courseId);
  }

  const handlePrintReport = () => {
      window.print();
  }
  
  if (selectedCourse) {
    return <CourseDetail 
              course={selectedCourse} 
              user={user} 
              allUsers={allUsers}
              onBack={() => setSelectedCourse(null)} 
              allProgress={allProgress}
              onToggleLesson={onToggleLesson}
              onToggleBookmark={onToggleBookmark}
              onUpdateQuizScore={onUpdateQuizScore}
              onUpdateTimeSpent={onUpdateTimeSpent}
              onAddReview={onAddReview}
              onSendMessage={onSendMessage}
              onOpenChat={() => setActiveChatCourseId(selectedCourse.id)}
              onUpdatePreferences={onUpdatePreferences}
              onNotifyInstructor={onNotifyInstructor}
            />;
  }

  const renderCoursesTab = () => (
     <div className="space-y-10 animate-fade-in">
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">My Courses</h3>
        {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrolledCourses.map(course => {
                const progressVal = getProgressPercent(course.id);
                return (
                <CourseCard 
                    key={course.id} 
                    course={course} 
                    allUsers={allUsers}
                    onClick={() => setSelectedCourse(course)}
                    progress={progressVal}
                >
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Progress</span>
                            <span className={`text-sm font-bold ${progressVal === 100 ? 'text-green-700 dark:text-green-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                                {progressVal.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${progressVal === 100 ? 'bg-green-600' : 'bg-indigo-600'}`}
                            style={{ width: `${progressVal}%` }}
                        ></div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenChat(course.id); }}
                            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 border border-indigo-600 text-indigo-700 dark:text-indigo-400 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium transition-colors"
                        >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            <span>Chat with Mentors</span>
                        </button>
                    </div>
                </CourseCard>
            )})}
            </div>
        ) : (
            <p className="text-gray-700 dark:text-gray-400 font-medium">You are not enrolled in any courses yet. Find a new course below!</p>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">Browse All Courses</h3>
        <div className="relative mb-6">
            <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAvailableCourses.map(course => (
                <CourseCard 
                    key={course.id} 
                    course={course} 
                    allUsers={allUsers}
                    onClick={() => onEnroll(user.id, course.id)}
                >
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEnroll(user.id, course.id); }}
                      className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Enroll Now
                    </button>
                </CourseCard>
            ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">AI Recommendations</h3>
            <button
                onClick={handleGetRecommendations}
                disabled={loadingRecommendations}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
                <SparklesIcon className="w-5 h-5" />
                <span>{loadingRecommendations ? 'Generating...' : 'Get Recommendations'}</span>
            </button>
        </div>
        
        {recommendationError && (
             <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 flex items-center">
                 <XCircleIcon className="w-5 h-5 mr-2" />
                 {recommendationError}
             </div>
        )}

        {loadingRecommendations && !recommendationError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse border border-gray-200 dark:border-gray-700">
                        <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md mt-4 w-3/4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md mt-2 w-full"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md mt-1 w-2/3"></div>
                    </div>
                ))}
            </div>
        )}
        
        {!loadingRecommendations && !recommendationError && recommendations.length > 0 && (
            <div className="space-y-4">
            {recommendations.map(rec => {
                const course = allCourses.find(c => c.id === rec.courseId);
                return course ? (
                <div key={rec.courseId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-start space-x-4 border border-gray-200 dark:border-gray-700">
                    <img src={course.imageUrl} alt={course.title} className="w-32 h-20 object-cover rounded-md" />
                    <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{rec.courseName}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">AI says:</span> {rec.reason}
                        </p>
                    </div>
                    <button 
                      onClick={() => onEnroll(user.id, course.id)}
                      className="self-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors"
                    >
                      Enroll
                    </button>
                </div>
                ) : null;
            })}
            </div>
        )}
      </div>
    </div>
  );

  const renderInsightsTab = () => (
      <div className="space-y-8 animate-fade-in">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                          <ChartBarIcon className="w-8 h-8 text-indigo-700 dark:text-indigo-400 mr-2" />
                          Official Learning Progress Report
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                          Generate a comprehensive AI analysis of your academic performance for official review.
                      </p>
                  </div>
                  <div className="flex space-x-3">
                    {insights && (
                        <button
                            onClick={handlePrintReport}
                            className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center"
                        >
                            Print / Save
                        </button>
                    )}
                    <button
                        onClick={handleGetInsights}
                        disabled={loadingInsights}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center min-w-[200px]"
                    >
                        {loadingInsights ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analysing...
                            </span>
                        ) : (
                            'Generate Official Report'
                        )}
                    </button>
                  </div>
              </div>
          </div>
          
          {insightsError && (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 flex flex-col items-center text-center">
                  <XCircleIcon className="w-12 h-12 mb-2" />
                  <h4 className="text-lg font-semibold">Analysis Failed</h4>
                  <p>{insightsError}</p>
              </div>
          )}

          {insights && !insightsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up print:block print:space-y-6">
                  {/* Header for Print */}
                  <div className="hidden print:block col-span-2 mb-6 border-b border-gray-300 pb-4">
                       <h1 className="text-3xl font-bold text-gray-900">Student Competency Report</h1>
                       <p className="text-gray-700">Generated for: {user.name}</p>
                       <p className="text-gray-700">Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  {/* Overall Summary */}
                  <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 print:shadow-none print:border border-gray-300 ring-1 ring-gray-200 dark:ring-gray-700">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Executive Summary</h4>
                      <p className="text-gray-800 dark:text-gray-300 text-lg leading-relaxed">
                          {insights.overallProgressSummary}
                      </p>
                  </div>

                  {/* Strengths */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm print:shadow-none print:border border-gray-300 ring-1 ring-gray-200 dark:ring-gray-700">
                      <div className="flex items-center mb-4">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3 print:hidden">
                              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Demonstrated Strengths</h4>
                      </div>
                      <ul className="space-y-3">
                          {insights.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start text-gray-800 dark:text-gray-300">
                                  <span className="mr-2 text-green-600">•</span>
                                  {strength}
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm print:shadow-none print:border border-gray-300 ring-1 ring-gray-200 dark:ring-gray-700">
                      <div className="flex items-center mb-4">
                          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mr-3 print:hidden">
                              <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Development Areas</h4>
                      </div>
                       <ul className="space-y-3">
                          {insights.areasForImprovement.map((area, idx) => (
                              <li key={idx} className="flex items-start text-gray-800 dark:text-gray-300">
                                  <span className="mr-2 text-orange-500">•</span>
                                  {area}
                              </li>
                          ))}
                      </ul>
                  </div>

                   {/* Recommended Actions */}
                   <div className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-xl shadow-md text-white print:bg-none print:text-black print:border print:border-gray-300 print:shadow-none">
                      <h4 className="text-lg font-bold mb-4 flex items-center">
                          <SparklesIcon className="w-6 h-6 mr-2 print:hidden" />
                          Strategic Next Steps
                      </h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {insights.recommendedActions.map((action, idx) => (
                              <div key={idx} className="bg-white/20 backdrop-blur-sm p-4 rounded-lg border border-white/30 print:border-gray-300 print:bg-white">
                                  <p className="font-medium text-white print:text-black">{action}</p>
                              </div>
                          ))}
                       </div>
                  </div>
                  
                  <div className="hidden print:block col-span-2 mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
                      <p>Official Report generated by Smart LMS AI Engine.</p>
                  </div>
              </div>
          )}
      </div>
  );

  const renderLeaderboardTab = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="text-2xl font-bold flex items-center">
                  <TrophyIcon className="w-8 h-8 mr-3" />
                  Student Leaderboard
              </h3>
              <p className="mt-2 opacity-95 font-medium">Top performers based on course completion and quiz accuracy. Keep learning to climb the ranks!</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Lessons Completed</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Avg Quiz Score</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Total Score</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {leaderboardData.map((student, index) => (
                          <tr key={student.id} className={user.id === student.id ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  {index === 0 && <span className="text-2xl">🥇</span>}
                                  {index === 1 && <span className="text-2xl">🥈</span>}
                                  {index === 2 && <span className="text-2xl">🥉</span>}
                                  {index > 2 && <span className="font-bold text-gray-600 dark:text-gray-400 pl-2">#{index + 1}</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                      <img className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" src={student.avatar} alt="" />
                                      <div className="ml-4">
                                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                                              {student.name.replace(/ \(.+\)/, '')}
                                              {user.id === student.id && <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">You</span>}
                                          </div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                                  {student.lessonsCompleted}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${student.avgScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {student.avgScore}%
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                  {student.totalScore} pts
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderChatsTab = () => (
      <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">Chat with Instructors</h3>
          {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                  {enrolledCourses.map(course => {
                      const session = chatSessions.find(s => s.courseId === course.id && s.studentId === user.id);
                      const lastMessage = session?.messages[session.messages.length - 1];
                      const instructors = allUsers.filter(u => course.instructorIds.includes(u.id));
                      
                      return (
                          <div 
                            key={course.id} 
                            onClick={() => setActiveChatCourseId(course.id)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
                          >
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h4 className="font-bold text-lg text-indigo-700 dark:text-indigo-400">{course.title}</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                          Instructors: {instructors.map(i => i.name.split(' ')[0]).join(', ')}
                                      </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                     <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-500 mb-1" />
                                     {lastMessage && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(lastMessage.timestamp).toLocaleDateString()}
                                        </span>
                                     )}
                                  </div>
                              </div>
                              {lastMessage && (
                                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300 truncate flex justify-between items-center border border-gray-100 dark:border-gray-600">
                                      <span className="truncate pr-2">
                                        <span className="font-bold text-gray-900 dark:text-white">{lastMessage.senderName}:</span> {lastMessage.content}
                                      </span>
                                      {lastMessage.senderId !== user.id && (
                                          <span className="h-2 w-2 bg-indigo-600 rounded-full flex-shrink-0"></span>
                                      )}
                                  </div>
                              )}
                              {!lastMessage && (
                                  <p className="mt-3 text-sm text-gray-500 italic">Start a conversation...</p>
                              )}
                          </div>
                      )
                  })}
              </div>
          ) : (
             <p className="text-gray-600">Enroll in a course to start chatting.</p>
          )}
      </div>
  );

  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: React.ElementType }) => (
      <button
          onClick={() => setActiveTab(id)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === id 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-400 font-medium'
          }`}
      >
          <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-gray-500 dark:text-gray-500 group-hover:text-indigo-600'}`} />
          <span>{label}</span>
      </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 sticky top-6">
            <div className="mb-6 px-2">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dashboard Menu</h2>
            </div>
            <nav className="space-y-2">
                <SidebarItem id="courses" label="My Courses" icon={BookOpenIcon} />
                <SidebarItem id="insights" label="Official Report" icon={ChartBarIcon} />
                <SidebarItem id="leaderboard" label="Leaderboard" icon={TrophyIcon} />
                <SidebarItem id="chats" label="Instructor Chat" icon={ChatBubbleLeftRightIcon} />
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 px-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">Learning Status</h4>
                    <p className="text-xs text-indigo-800 dark:text-indigo-400 font-medium">
                        You are enrolled in <span className="font-bold">{enrolledCourses.length}</span> courses.
                    </p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
         <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                 {activeTab === 'courses' && `Welcome back, ${user.name.split(' ')[0]}!`}
                 {activeTab === 'insights' && 'Academic Performance Report'}
                 {activeTab === 'chats' && 'Instructor Communication Center'}
                 {activeTab === 'leaderboard' && 'Community Leaderboard'}
             </h2>
             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                 {activeTab === 'courses' && 'Track your progress and continue learning.'}
                 {activeTab === 'insights' && 'AI-powered analysis of your learning journey.'}
                 {activeTab === 'chats' && 'Connect with mentors for doubt resolution.'}
                 {activeTab === 'leaderboard' && 'See how you rank against other learners.'}
             </p>
         </div>

          {activeTab === 'courses' && renderCoursesTab()}
          {activeTab === 'insights' && renderInsightsTab()}
          {activeTab === 'chats' && renderChatsTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
      </main>

      {/* Chat Window Modal */}
      {activeChatCourseId && (
          <ChatWindow
            currentUser={user}
            session={chatSessions.find(s => s.courseId === activeChatCourseId && s.studentId === user.id)}
            courseTitle={allCourses.find(c => c.id === activeChatCourseId)?.title || ''}
            instructors={allUsers.filter(u => allCourses.find(c => c.id === activeChatCourseId)?.instructorIds.includes(u.id))}
            onSendMessage={(content) => onSendMessage(activeChatCourseId, user.id, content, user.id)}
            onClose={() => setActiveChatCourseId(null)}
          />
      )}

    </div>
  );
};

export default StudentDashboard;
