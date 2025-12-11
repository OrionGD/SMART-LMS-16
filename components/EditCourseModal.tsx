
import React, { useState } from 'react';
import { Course, Lesson } from '../types';
import { XCircleIcon, PlusIcon, TrashIcon } from './icons';

interface EditCourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: (updatedCourse: Course) => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSave }) => {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [lessons, setLessons] = useState<Lesson[]>(course.lessons);

  const handleLessonChange = (id: number, field: keyof Lesson, value: string) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: Date.now(),
      title: 'New Lesson',
      content: 'Lesson content goes here...',
      type: 'text'
    };
    setLessons([...lessons, newLesson]);
  };

  const handleDeleteLesson = (id: number) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...course,
      title,
      description,
      lessons
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
          </div>

          <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Lessons</h3>
                  <button type="button" onClick={handleAddLesson} className="flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                      <PlusIcon className="w-4 h-4 mr-1" /> Add Lesson
                  </button>
              </div>
              <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase">Lesson {index + 1}</span>
                              <button type="button" onClick={() => handleDeleteLesson(lesson.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                              <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => handleLessonChange(lesson.id, 'title', e.target.value)}
                                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="Lesson Title"
                              />
                              <textarea
                                  value={lesson.content}
                                  onChange={(e) => handleLessonChange(lesson.id, 'content', e.target.value)}
                                  rows={4}
                                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm dark:bg-gray-700 dark:text-white font-mono focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="Lesson Content (HTML supported)"
                              />
                          </div>
                      </div>
                  ))}
                  {lessons.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 italic">No lessons added yet.</p>
                  )}
              </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
