
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { AdjustmentsIcon, XCircleIcon, CheckCircleIcon } from './icons';

interface LearningPreferencesModalProps {
  currentPreferences?: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onClose: () => void;
}

const LearningPreferencesModal: React.FC<LearningPreferencesModalProps> = ({ currentPreferences, onSave, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(currentPreferences || {
    learningLevel: 'Intermediate',
    learningStyle: 'Scenario-based',
    tonePreference: 'Friendly',
    pacePreference: 'Normal'
  });

  const handleChange = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(preferences);
    // Modal close is handled by parent after save, but we can call it here if we want immediate feedback
    // onClose(); // Removed to let parent handle logic
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <AdjustmentsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Learning Preferences</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Customize how the AI adapts course content to match your unique learning style.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Level</label>
            <select
              value={preferences.learningLevel}
              onChange={(e) => handleChange('learningLevel', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Beginner">Beginner (Simplified concepts)</option>
              <option value="Intermediate">Intermediate (Balanced)</option>
              <option value="Advanced">Advanced (Technical depth)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Style</label>
            <select
              value={preferences.learningStyle}
              onChange={(e) => handleChange('learningStyle', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Visual">Visual (Descriptive imagery)</option>
              <option value="Analogy">Analogy (Real-world comparisons)</option>
              <option value="Step-by-step">Step-by-step (Procedural)</option>
              <option value="Scenario-based">Scenario-based (Story/Context)</option>
              <option value="Technical">Technical (Facts & Logic)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tone Preference</label>
            <select
              value={preferences.tonePreference}
              onChange={(e) => handleChange('tonePreference', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Friendly">Friendly & Encouraging</option>
              <option value="Formal">Formal & Academic</option>
              <option value="Concise">Concise & Direct</option>
              <option value="Detailed">Detailed & Explanatory</option>
              <option value="Motivational">Motivational & High Energy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pace Preference</label>
            <select
              value={preferences.pacePreference}
              onChange={(e) => handleChange('pacePreference', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Slow">Slow (More breaks & examples)</option>
              <option value="Normal">Normal (Balanced)</option>
              <option value="Fast">Fast (Efficient)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm flex items-center"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LearningPreferencesModal;
