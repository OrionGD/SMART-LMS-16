
import React, { useState, useMemo } from 'react';
import { User, Course, Progress, Role } from '../types';
import { XCircleIcon, PencilIcon, CheckCircleIcon, AcademicCapIcon, TrophyIcon, StarIcon, BookOpenIcon, ServerIcon, AwardIcon, ChatBubbleLeftRightIcon } from './icons';
import { TRADITIONAL_USER_AVATAR } from '../constants';

interface UserProfileModalProps {
  user: User;
  allCourses: Course[];
  userProgress: Progress[];
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, allCourses, userProgress, onClose, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'progress' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isStudent = user.role === Role.Student;
  const isInstructor = user.role === Role.Instructor;
  const isAdmin = user.role === Role.Admin;

  // Edit State
  const [formData, setFormData] = useState({
      displayName: user.displayName || user.name.split(' (')[0],
      bio: user.bio || '',
      contactEmail: user.contactEmail || '',
      profilePicture: user.profilePicture || TRADITIONAL_USER_AVATAR,
      coverPhoto: user.coverPhoto || '',
      socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          website: user.socialLinks?.website || ''
      }
  });

  // --- Stats Calculation Logic ---
  const stats = useMemo(() => {
    if (isStudent) {
        const enrolledCount = user.enrolledCourseIds.length;
        let totalLessonsCompleted = 0;
        let totalQuizScore = 0;
        let quizCount = 0;
        let certificatesEarned = 0;

        userProgress.forEach(p => {
            totalLessonsCompleted += p.completedLessons.length;
            const scores = Object.values(p.quizScores || {}) as number[];
            if (scores.length > 0) {
                totalQuizScore += scores.reduce((a, b) => a + b, 0);
                quizCount += scores.length;
            }
            const course = allCourses.find(c => c.id === p.courseId);
            if (course && course.lessons.length > 0 && p.completedLessons.length === course.lessons.length) {
                certificatesEarned++;
            }
        });

        const avgScore = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;
        const totalPoints = (totalLessonsCompleted * 10) + avgScore;

        return { enrolledCount, totalLessonsCompleted, avgScore, totalPoints, certificatesEarned };
    } else if (isInstructor) {
        const coursesTaught = allCourses.filter(c => c.instructorIds.includes(user.id));
        const courseCount = coursesTaught.length;
        
        let totalRating = 0;
        let reviewCount = 0;
        coursesTaught.forEach(c => {
            if (c.reviews) {
                reviewCount += c.reviews.length;
                totalRating += c.reviews.reduce((sum, r) => sum + r.rating, 0);
            }
        });
        const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "N/A";

        return { courseCount, reviewCount, avgRating, coursesTaught };
    } else {
        // Admin Stats
        return { courseCount: allCourses.length };
    }
  }, [user, userProgress, allCourses, isStudent, isInstructor]);

  const relevantCourses = useMemo(() => {
      if (isStudent) return allCourses.filter(c => user.enrolledCourseIds.includes(c.id));
      if (isInstructor) return allCourses.filter(c => c.instructorIds.includes(user.id));
      return allCourses; // Admin sees all
  }, [isStudent, isInstructor, user, allCourses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: string) => {
      const { name, value } = e.target;
      if (section === 'socialLinks') {
          setFormData(prev => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, [name]: value }
          }));
      } else {
          setFormData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
          onUpdateUser({
              ...user,
              ...formData
          });
          setIsSaving(false);
          setIsEditing(false);
          setActiveTab('overview');
      }, 800);
  };

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
      <button
          onClick={() => setActiveTab(id)}
          className={`relative px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              activeTab === id 
              ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-500/30 transform scale-105' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md hover:-translate-y-0.5'
          }`}
      >
          {label}
      </button>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 px-4 pb-4 pt-8 overflow-y-auto transition-all duration-300">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col animate-scale-in my-auto border border-white/20 dark:border-gray-800 ring-1 ring-black/5 transition-all duration-300 ease-in-out">
        
        {/* 1. Cover Photo Area */}
        <div className="relative h-64 w-full overflow-hidden group transition-all duration-500">
            <div className={`absolute inset-0 bg-gradient-to-r transition-colors duration-500 ${
                isInstructor ? 'from-emerald-800 to-teal-600' : 
                isAdmin ? 'from-gray-800 to-gray-950' : 
                'from-indigo-600 via-purple-600 to-pink-600'
            }`}></div>
            
            {formData.coverPhoto && (
                <img src={formData.coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 mix-blend-overlay" />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/90 dark:from-gray-900/90 via-transparent to-transparent"></div>
            
            <button onClick={onClose} className="absolute top-6 right-6 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all duration-200 transform hover:scale-110 border border-white/20 z-20 shadow-lg group-hover:rotate-90">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>

        {/* 2. Profile Header & Info */}
        <div className="relative px-10 -mt-24 pb-6 z-10">
            <div className="flex flex-col md:flex-row items-end mb-8">
                
                {/* Avatar */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img 
                        src={formData.profilePicture} 
                        alt="Profile" 
                        className="relative w-44 h-44 rounded-[2rem] border-[6px] border-white dark:border-gray-900 object-cover shadow-2xl bg-gray-200 dark:bg-gray-800 transform group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border-[6px] border-transparent z-10">
                            <PencilIcon className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                    )}
                </div>

                {/* Name & Quick Info */}
                <div className="mt-6 md:mt-0 md:ml-8 flex-1 text-center md:text-left mb-2">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-3 drop-shadow-sm transition-all duration-300">
                        {formData.displayName}
                        {user.role === Role.Admin && <span className="text-blue-500 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1" title="Verified Admin"><CheckCircleIcon className="w-6 h-6" /></span>}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mt-1">@{user.username}</p>
                    
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm transition-colors duration-300 ${
                            isAdmin ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 
                            isInstructor ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : 
                            'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
                        }`}>
                            {user.role}
                        </span>
                        {isStudent && (
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                                {user.preferences?.learningLevel || 'Level 1'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 md:mt-0 md:mb-2">
                    {!isEditing ? (
                        <button 
                            onClick={() => { setActiveTab('settings'); setIsEditing(true); }} 
                            className="flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 hover:scale-105"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Edit Profile
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 hover:scale-105 disabled:opacity-70 disabled:transform-none"
                        >
                            {isSaving ? <span className="animate-spin mr-2">⏳</span> : <CheckCircleIcon className="w-4 h-4 mr-2" />}
                            Save Changes
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Navigation Segment */}
            <div className="flex justify-center md:justify-start space-x-2 bg-gray-200/50 dark:bg-gray-800/50 p-1.5 rounded-full w-fit mx-auto md:mx-0 backdrop-blur-sm shadow-inner transition-all duration-300">
                 <TabButton id="overview" label="Overview" />
                 <TabButton id="courses" label={isInstructor ? 'Teaching' : 'Courses'} />
                 {!isAdmin && <TabButton id="progress" label={isInstructor ? 'Reviews' : 'Progress'} />}
                 <TabButton id="settings" label="Settings" />
            </div>
        </div>

        {/* 3. Content Area - Added Key for Animation */}
        <div 
            key={activeTab} 
            className="px-10 py-8 bg-gray-50/50 dark:bg-gray-900/30 min-h-[400px] max-h-[55vh] overflow-y-auto custom-scrollbar animate-fade-in transition-all duration-300 ease-in-out"
        >
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Bio & Social */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 duration-300">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl mr-3 text-indigo-600 dark:text-indigo-400">📝</span>
                                Biography
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-light">
                                {formData.bio || <span className="italic text-gray-400">No bio added yet. Tell the world about yourself!</span>}
                            </p>
                            
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Contact</span>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium truncate" title={formData.contactEmail}>{formData.contactEmail || "N/A"}</p>
                                </div>
                                {isStudent && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Learning Style</span>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{user.preferences?.learningStyle || "Default"}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Connect</h3>
                            <div className="flex flex-wrap gap-3">
                                {formData.socialLinks.website && (
                                    <a href={formData.socialLinks.website} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center text-gray-700 dark:text-gray-300 transform hover:-translate-y-1 hover:shadow-md">
                                        🌐 Website
                                    </a>
                                )}
                                {formData.socialLinks.linkedin && (
                                    <a href={formData.socialLinks.linkedin} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-[#0077b5]/10 text-[#0077b5] dark:bg-[#0077b5]/20 dark:text-blue-300 rounded-xl text-sm font-bold hover:bg-[#0077b5]/20 transition-all transform hover:-translate-y-1 hover:shadow-md">
                                        in LinkedIn
                                    </a>
                                )}
                                {formData.socialLinks.twitter && (
                                    <a href={formData.socialLinks.twitter} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-[#1DA1F2]/10 text-[#1DA1F2] dark:bg-[#1DA1F2]/20 dark:text-sky-300 rounded-xl text-sm font-bold hover:bg-[#1DA1F2]/20 transition-all transform hover:-translate-y-1 hover:shadow-md">
                                        Twitter
                                    </a>
                                )}
                                {formData.socialLinks.github && (
                                    <a href={formData.socialLinks.github} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-gray-900 text-white dark:bg-black rounded-xl text-sm font-bold hover:bg-gray-700 transition-all transform hover:-translate-y-1 hover:shadow-md">
                                        GitHub
                                    </a>
                                )}
                                {!formData.socialLinks.website && !formData.socialLinks.linkedin && !formData.socialLinks.twitter && !formData.socialLinks.github && (
                                    <p className="text-sm text-gray-500 italic">No social links configured.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats */}
                    <div className="space-y-6">
                        {/* Main Hero Card */}
                        <div className={`p-8 rounded-[2.5rem] shadow-xl text-white transform transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl bg-gradient-to-br ${
                            isInstructor ? 'from-emerald-500 to-teal-700' : 
                            isAdmin ? 'from-gray-700 to-gray-900' : 
                            'from-indigo-500 to-violet-700'
                        }`}>
                             <div className="flex items-center justify-between mb-6 opacity-90">
                                 <h3 className="font-bold text-lg tracking-wide uppercase text-white/80">
                                     {isInstructor ? 'Instructor Rating' : isAdmin ? 'System Admin' : 'Total Points'}
                                 </h3>
                                 <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-inner">
                                     {isInstructor ? <StarIcon solid className="w-6 h-6 text-yellow-300" /> :
                                      isAdmin ? <ServerIcon className="w-6 h-6 text-gray-200" /> :
                                      <TrophyIcon className="w-6 h-6 text-yellow-300" />}
                                 </div>
                             </div>
                             
                             <p className="text-7xl font-black tracking-tight drop-shadow-xl animate-pulse-slow">
                                 {isInstructor ? (stats as any).avgRating : isAdmin ? 'Root' : (stats as any).totalPoints}
                             </p>
                             
                             <div className="mt-6 flex items-center gap-2">
                                <div className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/50 w-3/4 rounded-full"></div>
                                </div>
                                <p className="text-white/90 text-xs font-bold">
                                    {isInstructor ? 'Based on reviews' : isAdmin ? 'Full Access' : 'Keep learning!'}
                                </p>
                             </div>
                        </div>

                         {/* Quick Stats List */}
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                             <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg px-2">Performance Metrics</h3>
                             <div className="space-y-4">
                                 {isStudent && (
                                     <>
                                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-default hover:shadow-sm">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600"><AcademicCapIcon className="w-5 h-5" /></div>
                                                <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">Enrolled</span>
                                            </div>
                                            <span className="font-black text-gray-900 dark:text-white text-xl">{(stats as any).enrolledCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-default hover:shadow-sm">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-xl text-green-600"><CheckCircleIcon className="w-5 h-5" /></div>
                                                <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">Completed</span>
                                            </div>
                                            <span className="font-black text-gray-900 dark:text-white text-xl">{(stats as any).totalLessonsCompleted}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-default hover:shadow-sm">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2.5 rounded-xl text-yellow-600"><StarIcon solid className="w-5 h-5" /></div>
                                                <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">Avg. Score</span>
                                            </div>
                                            <span className="font-black text-gray-900 dark:text-white text-xl">{(stats as any).avgScore}%</span>
                                        </div>
                                     </>
                                 )}
                                 {isInstructor && (
                                     <>
                                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">Courses</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-lg">{(stats as any).courseCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">Reviews</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-lg">{(stats as any).reviewCount}</span>
                                        </div>
                                     </>
                                 )}
                             </div>
                         </div>
                    </div>
                </div>
            )}

            {/* COURSES TAB */}
            {activeTab === 'courses' && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isInstructor ? 'Teaching Curriculum' : isStudent ? 'Active Enrollments' : 'System Courses'}
                        </h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                            {relevantCourses.length} Courses
                        </span>
                    </div>
                    
                    {relevantCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relevantCourses.map(course => (
                                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                    <div className="h-44 overflow-hidden relative">
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:bg-black/40 transition-colors"></div>
                                        <div className="absolute bottom-4 left-5 right-5">
                                            <h4 className="font-bold text-white text-lg shadow-black drop-shadow-md leading-tight line-clamp-2">{course.title}</h4>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {isStudent ? (
                                            <>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Progress</span>
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md">
                                                        {Math.round(userProgress.find(p => p.courseId === course.id)?.completedLessons.length ? (userProgress.find(p => p.courseId === course.id)!.completedLessons.length / course.lessons.length * 100) : 0)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                                                        style={{ width: `${userProgress.find(p => p.courseId === course.id)?.completedLessons.length ? (userProgress.find(p => p.courseId === course.id)!.completedLessons.length / course.lessons.length * 100) : 0}%` }}
                                                    ></div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-lg">
                                                    {course.lessons.length} Lessons
                                                </span>
                                                {isInstructor && (
                                                    <div className="flex items-center text-yellow-500 font-bold">
                                                        <StarIcon solid className="w-4 h-4 mr-1.5" />
                                                        <span className="text-gray-800 dark:text-white">
                                                            {(course.reviews.reduce((a,b)=>a+b.rating,0)/course.reviews.length || 0).toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700">
                             <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                             <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">No courses found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* PROGRESS / REVIEWS TAB */}
            {activeTab === 'progress' && !isAdmin && (
                <div className="animate-fade-in space-y-8">
                    {isStudent ? (
                        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 p-12 rounded-[3rem] shadow-sm border border-indigo-100 dark:border-gray-800 text-center relative overflow-hidden transition-all duration-500">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                            
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Certificates Earned</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">Official completion badges for fully finished courses.</p>
                                
                                <div className="flex justify-center items-center my-10">
                                    <div className="relative group">
                                        <div className="absolute -inset-6 bg-yellow-200 dark:bg-yellow-900/30 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <TrophyIcon className="w-32 h-32 text-yellow-500 relative z-10 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300" />
                                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-white drop-shadow-md mt-2">
                                            {(stats as any).certificatesEarned}
                                        </span>
                                    </div>
                                </div>

                                {(stats as any).certificatesEarned > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                        {relevantCourses.filter(c => {
                                            const p = userProgress.find(prog => prog.courseId === c.id);
                                            return p && p.completedLessons.length === c.lessons.length;
                                        }).map(cert => (
                                            <div key={cert.id} className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center space-x-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-full">
                                                    <AwardIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <p className="font-bold text-gray-900 dark:text-white text-base line-clamp-1" title={cert.title}>{cert.title}</p>
                                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mt-1 flex items-center">
                                                        <CheckCircleIcon className="w-3 h-3 mr-1" /> Verified
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="inline-block px-8 py-4 bg-white dark:bg-gray-800 rounded-full text-base font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                                        Complete all lessons in a course to unlock your first certificate! 🚀
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : isInstructor ? (
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Feedback</h3>
                            {(stats as any).coursesTaught.map((course: Course) => (
                                course.reviews && course.reviews.length > 0 && (
                                    <div key={course.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                                        <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
                                            <BookOpenIcon className="w-5 h-5 mr-2" />
                                            {course.title}
                                        </h4>
                                        <div className="grid gap-6">
                                            {course.reviews.map((review, idx) => (
                                                <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex text-yellow-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                                                            {[...Array(5)].map((_, i) => (
                                                                <React.Fragment key={i}>
                                                                    <StarIcon solid={i < review.rating} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-base text-gray-700 dark:text-gray-300 italic leading-relaxed">"{review.comment}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                            {(stats as any).reviewCount === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">No reviews received yet.</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* SETTINGS / EDIT TAB */}
            {activeTab === 'settings' && (
                <div className="animate-fade-in max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 flex items-center">
                            <PencilIcon className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
                            Edit Profile Details
                        </h3>
                        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            name="displayName" 
                                            value={formData.displayName} 
                                            onChange={handleInputChange} 
                                            className="peer w-full px-5 py-4 pt-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 placeholder-transparent transition-all font-medium"
                                            placeholder="Display Name"
                                        />
                                        <label className="absolute left-5 top-2 text-xs font-bold text-gray-500 uppercase tracking-wider transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-indigo-600">
                                            Display Name
                                        </label>
                                    </div>
                                    <div className="relative group">
                                        <input 
                                            type="email" 
                                            name="contactEmail" 
                                            value={formData.contactEmail} 
                                            onChange={handleInputChange} 
                                            className="peer w-full px-5 py-4 pt-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 placeholder-transparent transition-all font-medium"
                                            placeholder="Contact Email"
                                        />
                                        <label className="absolute left-5 top-2 text-xs font-bold text-gray-500 uppercase tracking-wider transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-indigo-600">
                                            Contact Email
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="relative group h-full">
                                    <textarea 
                                        name="bio" 
                                        rows={4} 
                                        value={formData.bio} 
                                        onChange={handleInputChange} 
                                        className="peer w-full px-5 py-4 pt-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 placeholder-transparent transition-all resize-none h-full font-medium leading-relaxed"
                                        placeholder="Bio"
                                    ></textarea>
                                    <label className="absolute left-5 top-2 text-xs font-bold text-gray-500 uppercase tracking-wider transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-indigo-600">
                                        Bio / Description
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Visual Identity</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            name="coverPhoto" 
                                            value={formData.coverPhoto} 
                                            onChange={handleInputChange} 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-0 focus:border-indigo-500 transition-all text-sm font-medium" 
                                            placeholder="https://example.com/banner.jpg" 
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-lg">🖼️</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 pl-2">Cover Photo URL</p>
                                    </div>
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            name="profilePicture" 
                                            value={formData.profilePicture} 
                                            onChange={handleInputChange} 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-0 focus:border-indigo-500 transition-all text-sm font-medium" 
                                            placeholder="https://example.com/avatar.jpg" 
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-lg">👤</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 pl-2">Profile Picture URL</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Social Media</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
                                        <span className="text-xl pl-2">🌐</span>
                                        <input type="text" name="website" value={formData.socialLinks.website} onChange={(e) => handleInputChange(e, 'socialLinks')} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400" placeholder="Website URL" />
                                    </div>
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
                                        <span className="text-blue-600 font-black text-lg pl-2">in</span>
                                        <input type="text" name="linkedin" value={formData.socialLinks.linkedin} onChange={(e) => handleInputChange(e, 'socialLinks')} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400" placeholder="LinkedIn URL" />
                                    </div>
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
                                        <span className="text-sky-500 font-black text-lg pl-2">Tw</span>
                                        <input type="text" name="twitter" value={formData.socialLinks.twitter} onChange={(e) => handleInputChange(e, 'socialLinks')} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400" placeholder="Twitter URL" />
                                    </div>
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
                                        <span className="text-gray-800 dark:text-white font-black text-lg pl-2">Git</span>
                                        <input type="text" name="github" value={formData.socialLinks.github} onChange={(e) => handleInputChange(e, 'socialLinks')} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400" placeholder="GitHub URL" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-gray-800">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className={`px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center text-lg ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-6 h-6 mr-3" />
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
