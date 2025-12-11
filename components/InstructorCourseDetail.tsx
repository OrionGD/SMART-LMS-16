
import React, { useMemo } from 'react';
import { Course, User, Progress, Role } from '../types';
import { BackIcon, ClockIcon, StarIcon } from './icons';

interface InstructorCourseDetailProps {
  course: Course;
  allUsers: User[];
  allProgress: Progress[];
  onBack: () => void;
}

const InstructorCourseDetail: React.FC<InstructorCourseDetailProps> = ({ course, allUsers, allProgress, onBack }) => {

  const enrolledStudents = useMemo(() => allUsers.filter(user => 
    user.role === Role.Student && user.enrolledCourseIds.includes(course.id)
  ), [allUsers, course.id]);

  const getStudentStats = (userId: number) => {
    const progress = allProgress.find(p => p.userId === userId && p.courseId === course.id);
    if (!progress) return { percent: 0, totalTime: 0, avgScore: 0 };
    
    const percent = course.lessons.length > 0 ? (progress.completedLessons.length / course.lessons.length) * 100 : 0;
    
    const timeSpentValues = Object.values(progress.timeSpent || {}) as number[];
    const totalTime = timeSpentValues.reduce((a, b) => a + b, 0);
    
    const scores = Object.values(progress.quizScores || {}) as number[];
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return { percent, totalTime, avgScore };
  };
  
  const formatTime = (seconds: number) => {
      if (!seconds) return '-';
      const m = Math.floor(seconds / 60);
      return `${m} mins`;
  }
  
  const avgRating = course.reviews.length > 0 
    ? (course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length).toFixed(1) 
    : 'N/A';

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:underline mb-6">
        <BackIcon className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Detailed Course Analytics</p>
            </div>
            <div className="mt-4 md:mt-0 bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">Course Rating</p>
                <div className="flex items-center space-x-2 mt-1">
                    <StarIcon solid className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({course.reviews.length} reviews)</span>
                </div>
            </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Learner Analytics</h3>
        <div className="overflow-x-auto">
          {enrolledStudents.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Quiz Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time Spent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {enrolledStudents.map(student => {
                        const stats = getStudentStats(student.id);
                        return (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name.replace(/ \(.+\)/, '')}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${stats.percent}%` }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{stats.percent.toFixed(0)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stats.avgScore >= 80 ? 'bg-green-100 text-green-800' : stats.avgScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {stats.avgScore > 0 ? `${stats.avgScore.toFixed(0)}%` : 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                                        {formatTime(stats.totalTime)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    Today
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No students are currently enrolled in this course.</p>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Student Feedback & Reviews</h3>
            {course.reviews.length > 0 ? (
                <div className="grid gap-4">
                    {course.reviews.map((review, idx) => {
                         const studentName = allUsers.find(u => u.id === review.studentId)?.name.replace(/ \(.+\)/, '') || 'Unknown Student';
                         return (
                             <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                                 <div className="flex justify-between items-center mb-2">
                                     <span className="font-semibold text-gray-900 dark:text-white">{studentName}</span>
                                     <div className="flex">
                                         {[...Array(5)].map((_, i) => (
                                             <React.Fragment key={i}>
                                                <StarIcon solid={i < review.rating} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                             </React.Fragment>
                                         ))}
                                     </div>
                                 </div>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                                 <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                             </div>
                         )
                    })}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No reviews yet.</p>
            )}
        </div>

      </div>
    </div>
  );
};

export default InstructorCourseDetail;
