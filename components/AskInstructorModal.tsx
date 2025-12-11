import React, { useState } from 'react';
import { Course, Lesson } from '../types';
import { PaperClipIcon } from './icons';

interface AskInstructorModalProps {
  course: Course;
  lesson: Lesson;
  onClose: () => void;
  onSubmit: (question: string, attachment?: string) => void;
}

const AskInstructorModal: React.FC<AskInstructorModalProps> = ({ course, lesson, onClose, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const charLimit = 500;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question.trim(), attachment?.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Ask a Question</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Your question about "{lesson.title}" in "{course.title}" will be sent to the instructor.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={charLimit}
              rows={5}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              placeholder="Type your question here..."
              required
            />
            <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">
              {question.length} / {charLimit}
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <PaperClipIcon className="w-5 h-5" />
              <span>{attachment ? `Attached: ${attachment.name}` : 'Attach a file (optional)'}</span>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!question.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              Send Query
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskInstructorModal;
