
import React from 'react';
import { XCircleIcon, ShieldCheckIcon, BookOpenIcon, ServerIcon } from './icons';

export type LegalDocType = 'privacy' | 'terms' | 'cookies';

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  
  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <ShieldCheckIcon className="w-6 h-6 text-green-600" />,
          content: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
              <p>At Smart LMS, we value your privacy and are committed to protecting your personal data. This policy explains how we handle your information in our AI-Enhanced Learning Management System.</p>
              
              <h4 className="font-bold text-gray-900 dark:text-white">1. Data We Collect</h4>
              <ul className="list-disc pl-5">
                <li><strong>Account Information:</strong> Name, username, and role (Student/Instructor).</li>
                <li><strong>Learning Data:</strong> Quiz scores, lesson progress, time spent, and learning preferences (style, tone, pace).</li>
                <li><strong>AI Interactions:</strong> Queries sent to the instructor chat and inputs used for content adaptation.</li>
              </ul>

              <h4 className="font-bold text-gray-900 dark:text-white">2. How We Use AI</h4>
              <p>We use the Google Gemini API to process your learning data to:</p>
              <ul className="list-disc pl-5">
                <li>Generate personalized lesson content.</li>
                <li>Create adaptive assessments.</li>
                <li>Analyze your performance for the Official Progress Report.</li>
              </ul>
              <p className="italic text-sm">Note: Your personal data is anonymized where possible before being processed by third-party AI models.</p>

              <h4 className="font-bold text-gray-900 dark:text-white">3. Data Security</h4>
              <p>We implement industry-standard security measures, including Role-Based Access Control (RBAC) and secure session management, to prevent unauthorized access to your educational records.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          icon: <BookOpenIcon className="w-6 h-6 text-indigo-600" />,
          content: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
               <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
              <p>Welcome to Smart LMS. By accessing our platform, you agree to these Terms and Conditions.</p>

              <h4 className="font-bold text-gray-900 dark:text-white">1. Acceptable Use</h4>
              <p>You agree to use the platform solely for educational purposes. You must not:</p>
              <ul className="list-disc pl-5">
                <li>Attempt to bypass security features or access administrative dashboards without authorization.</li>
                <li>Use the AI chat features to generate harmful, offensive, or illegal content.</li>
                <li>Share your login credentials with others.</li>
              </ul>

              <h4 className="font-bold text-gray-900 dark:text-white">2. AI-Generated Content Disclaimer</h4>
              <p>Course materials, quizzes, and summaries may be generated or adapted by Artificial Intelligence. While we strive for accuracy, Smart LMS does not guarantee that AI-generated content is free from errors. Users should verify critical information with official course instructors.</p>

              <h4 className="font-bold text-gray-900 dark:text-white">3. Intellectual Property</h4>
              <p>All course structure, static content, and platform code are the property of Smart LMS. Adaptive content generated specifically for you is licensed for your personal educational use only.</p>
            </div>
          )
        };
      case 'cookies':
        return {
          title: 'Cookie Policy',
          icon: <ServerIcon className="w-6 h-6 text-blue-600" />,
          content: (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
               <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
              <p>Smart LMS uses cookies and local storage to enhance your learning experience.</p>

              <h4 className="font-bold text-gray-900 dark:text-white">1. What are Cookies?</h4>
              <p>Cookies are small text files stored on your device. We use "Local Storage" technology to simulate a persistent database experience in this prototype.</p>

              <h4 className="font-bold text-gray-900 dark:text-white">2. How We Use Them</h4>
              <ul className="list-disc pl-5">
                <li><strong>Essential:</strong> To keep you logged in as you navigate between Dashboard, Courses, and Profile.</li>
                <li><strong>Preferences:</strong> To remember your Dark Mode setting and AI Learning Preferences (e.g., "Visual Learner").</li>
                <li><strong>Progress:</strong> To temporarily cache your quiz answers and lesson completion status.</li>
              </ul>

              <h4 className="font-bold text-gray-900 dark:text-white">3. Managing Preferences</h4>
              <p>You can clear your browser cache to reset your preferences, but this will log you out and may reset your learning preference settings.</p>
            </div>
          )
        };
      default:
        return { title: '', icon: null, content: null };
    }
  };

  const { title, icon, content } = getContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {icon}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {content}
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
