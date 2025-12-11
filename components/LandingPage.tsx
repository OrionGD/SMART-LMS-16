
import React, { useState } from 'react';
import { SparklesIcon, AcademicCapIcon, ChartBarIcon, LightBulbIcon, CheckCircleIcon, ArrowRightIcon, UserGroupIcon, AdjustmentsIcon, StarIcon } from './icons';
import { INITIAL_COURSES } from '../initialData';
import LegalModal, { LegalDocType } from './LegalModal';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [legalDoc, setLegalDoc] = useState<LegalDocType | null>(null);

  // Select top 6 courses for the preview
  const featuredCourses = INITIAL_COURSES.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-sans">
      {/* 1. Hero Section */}
      <header className="relative bg-white dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-gray-800 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">The Smart LMS that</span>{' '}
                  <span className="block text-indigo-600 dark:text-indigo-400 xl:inline">Adapts to You</span>
                </h1>
                <p className="mt-3 text-base text-gray-700 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Experience education evolved. Our AI-Enhanced Learning Management System monitors your progress, understands your style, and rewrites course content just for you.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={onGetStarted}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-all"
                    >
                      Start Learning
                      <ArrowRightIcon className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button
                      onClick={onGetStarted}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 md:py-4 md:text-lg transition-all"
                    >
                      View Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-50 dark:bg-gray-700 flex items-center justify-center">
             <div className="p-8 opacity-90">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg transform rotate-3">
                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="bg-indigo-600 p-4 rounded-lg shadow-lg transform -rotate-2 flex items-center justify-center text-white">
                        <SparklesIcon className="w-12 h-12" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg transform -rotate-3 col-span-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                         <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                </div>
             </div>
        </div>
      </header>

      {/* 2. About the LMS */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">About Smart LMS</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            We bridge the gap between static content and individual potential. Designed for students who learn differently and instructors who want to reach everyone.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                <LightBulbIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Adaptive Learning</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Content that rewrites itself based on your learning level and style.</p>
            </div>
             <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                <ChartBarIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Analytics</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Deep insights into your strengths and areas for improvement.</p>
            </div>
             <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                <UserGroupIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mentor Connection</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Secure, direct chat channels with expert instructors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How Personalization Works */}
      <section className="py-16 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-10">
                <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">The AI Engine</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    How Personalization Works
                </p>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700 hidden md:block"></div>
                </div>
                <div className="relative flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                    {[
                        { step: 1, title: "Assessment", desc: "AI identifies your style & level." },
                        { step: 2, title: "Adaptation", desc: "Static content is rewritten." },
                        { step: 3, title: "Generation", desc: "Lessons & quizzes created." },
                        { step: 4, title: "Evolution", desc: "System learns from your progress." }
                    ].map((item) => (
                        <div key={item.step} className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md relative z-10 w-64 text-center border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold mb-3">
                                {item.step}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* 4. Core Features Overview */}
      <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Core Capabilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                      "AI-Adaptive Course Content",
                      "Dynamic Quizzes (Exam-oriented)",
                      "Personalized Visualizations",
                      "Adaptive Difficulty Engine",
                      "Real-time Progress Dashboard",
                      "Smart Course Recommendations",
                      "Intelligent Revision System",
                      "Performance Insights & Analytics",
                      "Secure Instructor Chat"
                  ].map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                          <CheckCircleIcon className="flex-shrink-0 h-6 w-6 text-green-500" />
                          <p className="ml-3 text-lg leading-6 font-medium text-gray-800 dark:text-gray-200">{feature}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 5. User Journey Flow */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-12 text-center">Your Learning Journey</h2>
              <div className="space-y-8">
                  {[
                      { title: "Sign In & Profile", desc: "Create your account and set your baseline profile." },
                      { title: "Preference Assessment", desc: "Tell the AI how you like to learn (Visual, Story-based, etc.)." },
                      { title: "Adaptive Learning", desc: "Engage with lessons that have been customized just for you." },
                      { title: "AI Assessment", desc: "Take quizzes generated to test your specific understanding." },
                      { title: "Feedback & Growth", desc: "Receive instant, actionable insights to improve." }
                  ].map((step, idx) => (
                      <div key={idx} className="flex items-center group">
                          <div className="flex-shrink-0 h-12 w-1 bg-indigo-600 rounded-full group-hover:h-16 transition-all duration-300 mr-4"></div>
                          <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                              <p className="text-gray-700 dark:text-gray-300">{step.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 6, 7, 8, 9 - Feature Deep Dive Grid */}
      <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Dynamic Content */}
              <div>
                  <div className="flex items-center mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                          <AdjustmentsIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Dynamic Content System</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                      Static courses are a thing of the past. Our system takes standard modules and rewrites them on the fly. Whether you need a "Beginner-friendly story" or a "Technical, high-speed summary," the AI maintains factual accuracy while changing the presentation style completely.
                  </p>
              </div>

              {/* Assessment System */}
              <div>
                  <div className="flex items-center mb-4">
                      <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg mr-3">
                          <AcademicCapIcon className="w-6 h-6 text-red-600 dark:text-red-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Adaptive Assessments</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                      Quizzes aren't static either. The AI generates questions based on your learning level. It provides supportive hints for beginners and challenges for advanced users, ensuring every quiz is exam-relevant and fair.
                  </p>
              </div>

              {/* Dashboard */}
              <div>
                  <div className="flex items-center mb-4">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                          <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Dashboard</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                      Visualize your journey. Track module completion, quiz accuracy, and time spent. Our dashboard highlights your strengths and automatically flags areas where you might need a quick revision.
                  </p>
              </div>

              {/* AI Feedback */}
              <div>
                  <div className="flex items-center mb-4">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                          <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Feedback & Guidance</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                      Get more than just a grade. The AI acts as a personal tutor, explaining *why* an answer was wrong using your preferred learning style (e.g., an analogy or a diagram description), and suggests specific next steps.
                  </p>
              </div>
          </div>
      </section>

      {/* 10. Courses Available Preview */}
      <section className="py-16 bg-indigo-600 dark:bg-indigo-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-white mb-4">Featured Courses</h2>
                <p className="text-indigo-100 max-w-2xl mx-auto">
                    Explore our wide range of technical and professional modules, ready to be personalized for your unique learning path.
                </p>
              </div>
              
              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {featuredCourses.map((course) => (
                  <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all hover:-translate-y-1 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700">
                    <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover"/>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{course.description}</p>
                      <button 
                        onClick={onGetStarted}
                        className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold py-2 rounded-md transition-colors text-sm"
                      >
                        Start Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button 
                    onClick={onGetStarted}
                    className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:-translate-y-1"
                >
                    Browse Full Catalog
                </button>
              </div>
          </div>
      </section>

      {/* 11. Community & Support */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Support & Community</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                       <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Help Center</h4>
                       <p className="text-sm text-gray-700 dark:text-gray-300">Detailed guides on how to use the AI features and dashboard.</p>
                   </div>
                   <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                       <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Instructor Chat</h4>
                       <p className="text-sm text-gray-700 dark:text-gray-300">Connect directly with course mentors for complex queries.</p>
                   </div>
                   <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                       <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">System Support</h4>
                       <p className="text-sm text-gray-700 dark:text-gray-300">Technical issues? Our support team is available 24/7.</p>
                   </div>
               </div>
           </div>
      </section>

      {/* 12. Contact HR Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Contact HR Team</h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 max-w-3xl mx-auto shadow-sm border border-gray-100 dark:border-gray-600 flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Have Questions?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">
                We are here to help! For any queries regarding the LMS, course enrollment, or technical support, please reach out to our HR team directly.
              </p>
              <a 
                href="https://forms.office.com/r/CwVkyrQ3cZ?origin=lprLink" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Open Contact Form
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
               <img 
                 src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://forms.office.com/r/CwVkyrQ3cZ?origin=lprLink" 
                 alt="Scan to Contact HR" 
                 className="w-32 h-32 mb-2"
               />
               <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Scan to open form</p>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
                <span className="text-2xl font-bold text-indigo-400 flex items-center mb-4">
                    <AcademicCapIcon className="w-8 h-8 mr-2" />
                    Smart LMS
                </span>
                <p className="text-gray-300 text-sm max-w-sm">
                    Empowering learners through Artificial Intelligence. Personalized education for everyone, everywhere.
                </p>
            </div>
            <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Platform</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                    <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Login</button></li>
                    <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Register</button></li>
                    <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Courses</button></li>
                </ul>
            </div>
             <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                    <li><button onClick={() => setLegalDoc('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                    <li><button onClick={() => setLegalDoc('terms')} className="hover:text-white transition-colors text-left">Terms & Conditions</button></li>
                    <li><button onClick={() => setLegalDoc('cookies')} className="hover:text-white transition-colors text-left">Cookie Policy</button></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Smart LMS. All rights reserved.
        </div>
      </footer>

      {/* Legal Modal */}
      {legalDoc && (
        <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
      )}
    </div>
  );
};

export default LandingPage;
