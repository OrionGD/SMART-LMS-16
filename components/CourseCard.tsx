
import React from 'react';
import { Course, User } from '../types';
import { StarIcon, AwardIcon } from './icons';

interface CourseCardProps {
  course: Course;
  allUsers?: User[]; 
  onClick: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
  progress?: number; 
}

const CourseCard: React.FC<CourseCardProps> = ({ course, allUsers, onClick, children, progress = 0 }) => {
  const avgRating = course.reviews && course.reviews.length > 0 
    ? (course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length).toFixed(1) 
    : null;

  const instructorNames = allUsers 
    ? allUsers.filter(u => course.instructorIds.includes(u.id))
        .map(u => u.name.replace(/ \(.+\)/, '')) // Clean name
        .join(', ')
    : 'Unknown Instructors';

  const isCompleted = progress === 100;

  return (
    <div 
        onClick={onClick} 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition-all duration-300 ease-out cursor-pointer flex flex-col h-full group relative border border-gray-200 dark:border-gray-700
            ${isCompleted 
            ? 'ring-2 ring-yellow-400 shadow-yellow-100 dark:shadow-yellow-900/20 dark:ring-yellow-500' 
            : 'hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:ring-2 hover:ring-indigo-500/20'}
        `}
    >
      {/* Completion Celebration Effect */}
      {isCompleted && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 animate-pulse z-10"></div>
      )}

      <div className="relative overflow-hidden h-48 w-full">
          <img 
            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
            src={course.imageUrl} 
            alt={course.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
          
          {/* Rating Badge */}
          {avgRating && (
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-sm z-10">
                  <StarIcon solid className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-xs font-bold text-gray-800 dark:text-white">{avgRating}</span>
              </div>
          )}

          {/* Completion Badge */}
          {isCompleted && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center shadow-lg z-10 animate-fade-in-up">
                  <AwardIcon className="w-4 h-4 mr-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              </div>
          )}
      </div>
      <div className="p-6 flex flex-col flex-grow relative">
         {/* Subtle confetti background for completed courses */}
         {isCompleted && (
             <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iI0ZDQjkwMCIvPjwvc3ZnPg==')]"></div>
         )}
        
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h4>
        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold mb-3 uppercase tracking-wide">By: {instructorNames}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm overflow-hidden mb-4 flex-grow line-clamp-3 leading-relaxed font-medium">{course.description.split('\n')[0]}</p>
        <div className="mt-auto z-10 relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
