import React from 'react';
import { Query, Course, QueryStatus } from '../types';

interface StudentQueriesViewProps {
  queries: Query[];
  allCourses: Course[];
}

const StudentQueriesView: React.FC<StudentQueriesViewProps> = ({ queries, allCourses }) => {
  if (queries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No Queries Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">You haven't asked any questions yet. You can ask one from any course lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">My Question History</h3>
       <div className="space-y-4">
        {queries.map(query => {
            const course = allCourses.find(c => c.id === query.courseId);
            return (
                <div key={query.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-indigo-600 dark:text-indigo-400">{course?.title || 'Unknown Course'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Asked on: {new Date(query.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${query.status === QueryStatus.Pending ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                            {query.status}
                        </span>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-semibold text-sm">Your Question:</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{query.question}</p>
                        {query.attachment && <p className="text-xs mt-2 text-indigo-600 dark:text-indigo-400">Attachment: {query.attachment}</p>}
                    </div>

                    {query.status === QueryStatus.Resolved && query.reply && (
                        <div className="mt-3 ml-4 p-3 bg-indigo-50 dark:bg-gray-900/50 rounded-lg border-l-4 border-indigo-500">
                            <p className="font-semibold text-sm">Instructor's Reply:</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{query.reply}</p>
                            <p className="text-xs text-gray-400 mt-1">Replied on: {query.repliedAt ? new Date(query.repliedAt).toLocaleString() : ''}</p>
                        </div>
                    )}
                </div>
            )
        })}
       </div>
    </div>
  );
};

export default StudentQueriesView;
