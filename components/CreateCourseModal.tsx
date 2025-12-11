
import React, { useState } from 'react';
import { Lesson } from '../types';
import { SparklesIcon, XCircleIcon } from './icons';
import { generateCourseOutline } from '../services/geminiService';

interface CreateCourseModalProps {
  onClose: () => void;
  onCreate: (courseData: { title: string; description: string; lessons: Pick<Lesson, 'title' | 'type' | 'content'>[] }) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState<string[]>([]);
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateOutline = async () => {
    if (!title) {
        alert("Please enter a course title first.");
        return;
    }
    setLoadingOutline(true);
    setError(null);
    try {
        const outline = await generateCourseOutline(title);
        setLessons(outline);
    } catch (e) {
        setError("Failed to generate course outline. Please try again.");
    } finally {
        setLoadingOutline(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
        alert("Please fill in all fields.");
        return;
    }
    const lessonData = lessons.map(lessonTitle => ({
        title: lessonTitle,
        type: 'text' as 'text',
        content: `Placeholder content for ${lessonTitle}.`
    }));
    onCreate({ title, description, lessons: lessonData });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              required
            />
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Course Outline</h3>
                <button
                    type="button"
                    onClick={handleGenerateOutline}
                    disabled={!title || loadingOutline}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 disabled:opacity-50"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{loadingOutline ? 'Generating...' : 'AI Generate Outline'}</span>
                </button>
             </div>
             {loadingOutline && <p className="italic text-sm">Generating lesson ideas...</p>}
             {error && (
                 <div className="flex items-center text-red-600 dark:text-red-400 text-sm mt-2">
                     <XCircleIcon className="w-4 h-4 mr-1" />
                     {error}
                 </div>
             )}
             {!loadingOutline && !error && lessons.length > 0 && (
                <ul className="space-y-2 list-disc list-inside">
                    {lessons.map((lesson, index) => (
                        <li key={index} className="text-gray-800 dark:text-gray-200">{lesson}</li>
                    ))}
                </ul>
             )}
             {!loadingOutline && !error && lessons.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter a title and click "AI Generate Outline" to get started, or add lessons manually after creation.</p>
             )}
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
