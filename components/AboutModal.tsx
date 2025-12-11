
import React, { useState } from 'react';
import { SparklesIcon, UserGroupIcon, ChartBarIcon, BookOpenIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, AdjustmentsIcon, ShieldCheckIcon, ServerIcon } from './icons';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'ooad'>('overview');

  const ModuleItem = ({ icon: Icon, title, description, technicalDetails }: { icon: any, title: string, description: string, technicalDetails?: string }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex items-start mb-4">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mr-4 shadow-sm border border-gray-100 dark:border-gray-600">
             <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h4>
            <div className="mt-1 h-1 w-12 bg-indigo-500 rounded"></div>
        </div>
      </div>
      <div className="space-y-3">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
            {description}
          </p>
          {technicalDetails && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Technical Functionality</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                      {technicalDetails}
                  </p>
              </div>
          )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-indigo-700 p-6 flex justify-between items-center flex-shrink-0 shadow-md z-10">
          <div className="flex items-center space-x-4 text-white">
            <div className="bg-white/10 p-2 rounded-lg">
                <BookOpenIcon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">System Documentation</h2>
                <p className="text-indigo-100 text-sm font-medium opacity-90">Smart LMS Prototype Report • Deployment Phase</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 sticky top-0 z-10">
             <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 text-sm font-bold text-center transition-all relative uppercase tracking-wider ${activeTab === 'overview' ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
             >
                 1. Introduction & Abstract
                 {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
             </button>
             <button 
                onClick={() => setActiveTab('modules')}
                className={`flex-1 py-4 text-sm font-bold text-center transition-all relative uppercase tracking-wider ${activeTab === 'modules' ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
             >
                 2. Module Descriptions
                 {activeTab === 'modules' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
             </button>
             <button 
                onClick={() => setActiveTab('ooad')}
                className={`flex-1 py-4 text-sm font-bold text-center transition-all relative uppercase tracking-wider ${activeTab === 'ooad' ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
             >
                 3. Architecture (OOAD)
                 {activeTab === 'ooad' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
             </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-8 flex-1 bg-white dark:bg-gray-800 scroll-smooth">
          
          {activeTab === 'overview' && (
              <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
                  {/* Abstract Section */}
                  <section>
                      <div className="flex items-center mb-4">
                          <div className="h-8 w-1 bg-indigo-500 rounded-full mr-3"></div>
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Abstract</h3>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                        <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed text-justify font-medium">
                            The <strong>AI-Enhanced Smart Learning Management System (LMS)</strong> represents a paradigm shift in educational technology, moving from static content delivery to dynamic, personalized learning experiences. By integrating state-of-the-art <strong>Generative Artificial Intelligence (Google Gemini API)</strong> with a robust <strong>React.js</strong> frontend architecture, the system addresses the critical challenge of student engagement in online education. This project automates the role of a private tutor, offering real-time content adaptation based on cognitive profiles (Visual, Auditory, Textual), automated assessment generation, and granular performance analytics. The deployment-ready prototype demonstrates a scalable, secure, and modular solution designed to democratize access to tailored education.
                        </p>
                      </div>
                  </section>

                  {/* Introduction Section */}
                  <section className="space-y-8">
                       <div className="flex items-center mb-6">
                          <div className="h-8 w-1 bg-green-500 rounded-full mr-3"></div>
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Introduction</h3>
                      </div>
                      
                      <div className="space-y-6 text-gray-700 dark:text-gray-300">
                          <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1.1 Background</h4>
                              <p className="leading-relaxed text-justify">
                                  The digital education sector faces a persistent "one-size-fits-all" problem. Traditional Learning Management Systems serve as passive repositories for documents and videos, failing to account for the diverse learning paces, styles, and cognitive needs of individual students. This often results in low completion rates and superficial understanding of complex technical subjects.
                              </p>
                          </div>

                          <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1.2 Problem Statement</h4>
                              <p className="leading-relaxed text-justify">
                                  Existing platforms lack the intelligence to adapt. A visual learner struggles with text-heavy documentation, while an advanced student becomes disengaged by elementary explanations. Furthermore, instructors burdened by administrative tasks cannot provide 1:1 mentorship to every student in large cohorts, leading to a gap in personalized guidance and feedback.
                              </p>
                          </div>

                          <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1.3 Proposed Solution: Smart LMS</h4>
                              <p className="leading-relaxed text-justify">
                                  The Smart LMS leverages Large Language Models (LLMs) to create an adaptive feedback loop. The solution encompasses:
                              </p>
                              <ul className="list-disc pl-6 mt-2 space-y-2">
                                  <li><strong>Profiling:</strong> Capturing user preferences regarding Learning Style, Tone, and Pace.</li>
                                  <li><strong>Adaptation:</strong> The AI Engine intercepts static course material and rewrites it in real-time (e.g., converting a paragraph into a step-by-step guide).</li>
                                  <li><strong>Assessment:</strong> Quizzes are generated on-the-fly to test specific concepts, providing immediate, corrective feedback without human intervention.</li>
                              </ul>
                          </div>

                           <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1.4 Scope of Deployment Prototype</h4>
                              <p className="leading-relaxed text-justify">
                                  This report documents the fully functional prototype currently in the deployment phase. It encompasses secure authentication, Role-Based Access Control (RBAC) for Admins, Instructors, and Students, persistent state simulation, and live integration with the Google Gemini model for content generation.
                              </p>
                          </div>
                      </div>
                  </section>
              </div>
          )}

          {activeTab === 'modules' && (
              <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">System Modules</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                          The Smart LMS is architected using a modular design pattern to ensure scalability and maintainability. Below are the detailed descriptions of the six core modules.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                      <ModuleItem 
                          icon={UserGroupIcon}
                          title="1. Authentication & User Management Module"
                          description="This module secures entry to the platform using industry-standard authentication practices. It manages the complete user lifecycle, including registration, login, and session persistence. A core feature is the implementation of strict Role-Based Access Control (RBAC), ensuring that Students, Instructors, and Administrators only access features relevant to their privileges."
                          technicalDetails="Implements secure routing guards, session state management via React Context, and role differentiation logic to render specific UI dashboards."
                      />
                      
                      <ModuleItem 
                          icon={AcademicCapIcon}
                          title="2. Course Management & Delivery Module"
                          description="Serves as the central repository for educational content. It empowers Instructors to structure curriculums into logical lessons with rich text and multimedia support. For Students, it handles enrollment logic, course progression tracking (completion percentages), and the responsive rendering of course materials across devices, ensuring a seamless user experience."
                          technicalDetails="Features many-to-many relationship management between users and courses, dynamic progress calculation, and responsive content rendering."
                      />

                      <ModuleItem 
                          icon={SparklesIcon}
                          title="3. AI Adaptation & Personalization Engine"
                          description="The key differentiator of the Smart LMS. This engine acts as intelligent middleware between the content database and the user. It processes the learner's 'Preference Vector' (Style, Tone, Level) and dynamically prompts the Gemini API to rewrite static lessons into personalized formats—such as analogies, visual descriptions, or simplified summaries—without altering factual accuracy."
                          technicalDetails="Utilizes Google Gemini API with prompt engineering techniques to inject user context (Learning Style) into content generation requests."
                      />

                      <ModuleItem 
                          icon={AdjustmentsIcon}
                          title="4. Intelligent Assessment & Analytics Module"
                          description="Replaces static question banks with dynamic evaluation tools. This module parses lesson content to generate unique Multiple-Choice Questions (MCQs) on-the-fly. It evaluates student answers and provides instant, AI-driven feedback that explains *why* an answer was incorrect. It also aggregates performance data into the 'Official Learning Progress Report'."
                          technicalDetails="Real-time JSON parsing of AI responses to construct interactive quizzes and automated feedback loops based on scoring logic."
                      />

                      <ModuleItem 
                          icon={ChatBubbleLeftRightIcon}
                          title="5. Communication & Collaboration Module"
                          description="Facilitates synchronous and asynchronous interaction to bridge the gap in distance learning. It includes a secure Chat System connecting Students with Instructors for doubt resolution. It supports thread-based messaging, maintains a history of academic discourse, and allows students to tag specific courses when asking questions."
                          technicalDetails="Simulates a real-time chat environment with timestamping, sender differentiation, and persistent message history stored in application state."
                      />

                      <ModuleItem 
                          icon={ChartBarIcon}
                          title="6. Admin Dashboard & System Oversight Module"
                          description="Provides a bird's-eye view of system health for high-level management. Administrators utilize this module to visualize key metrics such as user engagement, course popularity, and role distribution through interactive charts. It also grants governance capabilities to manage user accounts and moderate course content."
                          technicalDetails="Integrates Recharts for data visualization and provides CRUD (Create, Read, Update, Delete) capabilities for system-wide entities."
                      />
                  </div>
              </div>
          )}

          {activeTab === 'ooad' && (
            <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Architectural Principles (OOAD)</h3>
                     <p className="text-gray-600 dark:text-gray-400 text-lg">
                        The system design adheres to strict Object-Oriented Analysis and Design principles to ensure scalability, security, and modularity.
                    </p>
                </div>
                
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-700/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">The Four Pillars of OOP</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                 <h5 className="font-bold text-gray-900 dark:text-white">1. Encapsulation</h5>
                                 <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Business logic is isolated in Service layers (e.g., <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">geminiService.ts</code>), hiding API complexity from UI components.</p>
                            </div>
                            <div>
                                 <h5 className="font-bold text-gray-900 dark:text-white">2. Abstraction</h5>
                                 <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">High-level interfaces (User, Course) decouple the application from raw data structures.</p>
                            </div>
                            <div>
                                 <h5 className="font-bold text-gray-900 dark:text-white">3. Polymorphism</h5>
                                 <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Role-Based Rendering allows the Dashboard to behave differently for Students vs Instructors using the same User entity.</p>
                            </div>
                             <div>
                                 <h5 className="font-bold text-gray-900 dark:text-white">4. Composition</h5>
                                 <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">UI is built by assembling granular, reusable components (CourseCard, ChatWindow) rather than inheritance.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">SOLID Principles</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xs mr-3">S</div>
                                <div>
                                    <h5 className="font-bold text-gray-900 dark:text-white">Single Responsibility Principle</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Services handle logic, Types define schemas, Components handle rendering.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xs mr-3">O</div>
                                 <div>
                                    <h5 className="font-bold text-gray-900 dark:text-white">Open/Closed Principle</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Architecture is open for extension (new Modules) but closed for core modification.</p>
                                </div>
                            </li>
                             <li className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xs mr-3">I</div>
                                 <div>
                                    <h5 className="font-bold text-gray-900 dark:text-white">Interface Segregation</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Granular interfaces ensure components only depend on data they actually use.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-100 dark:bg-gray-900 p-5 border-t border-gray-200 dark:border-gray-700 text-right flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Last Updated: {new Date().toLocaleDateString()} • Version 1.0.0 (Deployment)
            </div>
            <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold text-sm">
                Close Report
            </button>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;
