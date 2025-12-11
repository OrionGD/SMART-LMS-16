
import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, User, QuizQuestion, Progress, QuizFeedback, UserPreferences } from '../types';
import { summarizeLesson, generateQuizForLesson, getQuizFeedback, generateAdaptiveLessonContent, generateSpeech } from '../services/geminiService';
import { BackIcon, SparklesIcon, QuestionMarkCircleIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftRightIcon, ClockIcon, StarIcon, AwardIcon, BookmarkIcon, SpeakerWaveIcon } from './icons';
import CertificateModal from './CertificateModal';
import LearningPreferencesModal from './LearningPreferencesModal';
import AskInstructorModal from './AskInstructorModal';

interface CourseDetailProps {
  course: Course;
  user: User;
  allUsers: User[];
  onBack: () => void;
  allProgress: Progress[];
  onToggleLesson: (userId: number, courseId: number, lessonId: number) => void;
  onToggleBookmark: (userId: number, courseId: number, lessonId: number) => void;
  onUpdateQuizScore: (userId: number, courseId: number, lessonId: number, score: number) => void;
  onUpdateTimeSpent: (userId: number, courseId: number, lessonId: number, timeToAdd: number) => void;
  onAddReview: (courseId: number, review: { studentId: number; rating: number; comment: string }) => void;
  onSendMessage: (courseId: number, studentId: number, content: string, senderId: number) => void;
  onOpenChat: () => void; 
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onNotifyInstructor: (studentId: number, courseId: number, prefs: UserPreferences) => void;
}

// Audio Helper Functions
function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

export const playPCM = async (base64: string, audioContext: AudioContext, speed: number = 1) => {
    const bytes = decodeBase64(base64);
    // Gemini TTS uses 24kHz, Mono, Int16 PCM
    const int16Data = new Int16Array(bytes.buffer);
    const sampleRate = 24000;
    const channels = 1;
    
    const buffer = audioContext.createBuffer(channels, int16Data.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < int16Data.length; i++) {
        // Convert Int16 to Float32
        channelData[i] = int16Data[i] / 32768.0;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speed;
    source.connect(audioContext.destination);
    source.start();
    return source;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ 
    course, user, allUsers, onBack, allProgress, 
    onToggleLesson, onToggleBookmark, onUpdateQuizScore, onUpdateTimeSpent, onAddReview, onSendMessage, onOpenChat,
    onUpdatePreferences, onNotifyInstructor
}) => {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summarizedLessonId, setSummarizedLessonId] = useState<number | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizForLessonId, setQuizForLessonId] = useState<number | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback[] | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Adaptive Learning State
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false);
  const [adaptiveContentCache, setAdaptiveContentCache] = useState<Record<number, string>>({});
  const [loadingAdaptive, setLoadingAdaptive] = useState(false);
  const [adaptiveError, setAdaptiveError] = useState<string | null>(null);
  const [showPrefModal, setShowPrefModal] = useState(false);
  
  // Ask Question State
  const [askQuestionLesson, setAskQuestionLesson] = useState<Lesson | null>(null);
  
  // Audio/TTS State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingLessonId, setPlayingLessonId] = useState<number | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Helper to map tone to voice
  const getVoiceFromPreference = (tone?: string) => {
    switch (tone) {
      case 'Friendly': return 'Kore';
      case 'Formal': return 'Charon';
      case 'Concise': return 'Puck';
      case 'Detailed': return 'Fenrir';
      case 'Motivational': return 'Zephyr';
      default: return 'Kore';
    }
  };

  // Helper to map pace to speed
  const getSpeedFromPreference = (pace?: string) => {
    switch (pace) {
      case 'Slow': return 0.75;
      case 'Fast': return 1.5;
      default: return 1.0;
    }
  };

  const [selectedVoice, setSelectedVoice] = useState(getVoiceFromPreference(user.preferences?.tonePreference));
  const [playbackSpeed, setPlaybackSpeed] = useState(getSpeedFromPreference(user.preferences?.pacePreference));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);


  // Rating State
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Certificate State
  const [showCertificate, setShowCertificate] = useState(false);

  const progress = allProgress.find(p => p.userId === user.id && p.courseId === course.id);
  const completedLessonIds = new Set(progress?.completedLessons || []);
  const bookmarkedLessonIds = new Set(progress?.bookmarkedLessonIds || []);
  const isCourseCompleted = course.lessons.length > 0 && completedLessonIds.size === course.lessons.length;
  
  // Effect to track time when a lesson is expanded
  useEffect(() => {
      if (expandedLessonId !== null) {
          // Start timer when lesson expands
          startTimeRef.current = Date.now();
          
          // Trigger Adaptive Load if mode is on and not cached
          if (isAdaptiveMode && !adaptiveContentCache[expandedLessonId]) {
              loadAdaptiveContent(expandedLessonId);
          }
      }
      return () => {
          // Stop timer when lesson collapses or component unmounts
          if (startTimeRef.current && expandedLessonId !== null) {
              const endTime = Date.now();
              // Calculate duration in seconds
              const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
              // Only update if significant time passed (> 1 second)
              if (durationSeconds > 0) {
                  onUpdateTimeSpent(user.id, course.id, expandedLessonId, durationSeconds);
              }
          }
          startTimeRef.current = null;
          // If the lesson collapsing is the one playing, we generally keep playing, 
          // but if we navigate away from the component, we stop.
      };
  }, [expandedLessonId, user.id, course.id, onUpdateTimeSpent, isAdaptiveMode]);
  
  // Stop audio on unmount
  useEffect(() => {
      return () => stopAudio();
  }, []);

  // Update playback speed dynamically if audio is playing
  useEffect(() => {
      if (audioSourceRef.current) {
          audioSourceRef.current.playbackRate.value = playbackSpeed;
      }
  }, [playbackSpeed]);

  // Sync audio settings with user preferences if they change
  useEffect(() => {
      setSelectedVoice(getVoiceFromPreference(user.preferences?.tonePreference));
      setPlaybackSpeed(getSpeedFromPreference(user.preferences?.pacePreference));
  }, [user.preferences]);

  const loadAdaptiveContent = async (lessonId: number, prefsToUse?: UserPreferences) => {
      const lesson = course.lessons.find(l => l.id === lessonId);
      if (!lesson) return;

      // Use explicitly passed prefs (just saved) or fallback to user state
      const effectivePreferences = prefsToUse || user.preferences || {
          learningLevel: 'Intermediate',
          learningStyle: 'Scenario-based',
          tonePreference: 'Friendly',
          pacePreference: 'Normal'
      };

      setLoadingAdaptive(true);
      setAdaptiveError(null);
      try {
          const content = await generateAdaptiveLessonContent(effectivePreferences, lesson.title, lesson.content);
          setAdaptiveContentCache(prev => ({ ...prev, [lessonId]: content }));
      } catch (error) {
          setAdaptiveError("Could not generate adaptive content. Showing original.");
      } finally {
          setLoadingAdaptive(false);
      }
  };

  const handleAdaptiveToggle = () => {
    if (!isAdaptiveMode) {
        // Before enabling, ask for preferences explicitly
        setShowPrefModal(true);
    } else {
        setIsAdaptiveMode(false);
    }
  };

  const handleSavePreferences = (prefs: UserPreferences) => {
      // 1. Save to global state
      onUpdatePreferences(prefs);
      
      // 2. Notify Instructor
      onNotifyInstructor(user.id, course.id, prefs);

      // 3. Enable Mode & Close Modal
      setIsAdaptiveMode(true);
      setShowPrefModal(false);

      // 4. Clear cache to ensure new prefs are used if re-opening lessons
      setAdaptiveContentCache({});

      // 5. Trigger load if a lesson is currently open
      if (expandedLessonId) {
          loadAdaptiveContent(expandedLessonId, prefs);
      }
  };

  const handleToggleExpand = (lessonId: number) => {
      setExpandedLessonId(prev => prev === lessonId ? null : lessonId);
  };

  const handleSummarize = async (lesson: Lesson) => {
    setQuiz(null); setQuizForLessonId(null); setQuizFeedback(null);
    setSummaryError(null);
    if (summarizedLessonId === lesson.id && summary) {
        setSummary(''); setSummarizedLessonId(null); return;
    }
    setLoadingSummary(true); setSummarizedLessonId(lesson.id);
    try {
        const result = await summarizeLesson(lesson.title, lesson.content);
        setSummary(result);
    } catch (e) {
        setSummaryError('AI summary unavailable at this time.');
    } finally {
        setLoadingSummary(false);
    }
  };

  const handleGenerateQuiz = async (lesson: Lesson) => {
    setSummary(''); setSummarizedLessonId(null); setQuizFeedback(null);
    setQuizError(null);
    if (quizForLessonId === lesson.id && quiz) {
        setQuiz(null); setQuizForLessonId(null); return;
    }
    setLoadingQuiz(true); setQuizForLessonId(lesson.id);
    setSelectedAnswers({}); setSubmittedQuiz(false);
    try {
        // Pass user preferences for adaptive quiz generation
        const result = await generateQuizForLesson(lesson, user.preferences);
        setQuiz(result);
    } catch (e) {
        setQuizError('AI quiz generation unavailable at this time.');
    } finally {
        setLoadingQuiz(false);
    }
  };
  
  const stopAudio = () => {
      if (audioSourceRef.current) {
          audioSourceRef.current.stop();
          audioSourceRef.current = null;
      }
      setIsPlayingAudio(false);
      setPlayingLessonId(null);
  };
  
  const handleImmersiveReader = async (lesson: Lesson) => {
      // If clicking the same lesson that is playing, stop it.
      if (isPlayingAudio && playingLessonId === lesson.id) {
          stopAudio();
          return;
      }
      
      // If clicking a different lesson while one is playing, stop the old one.
      if (isPlayingAudio) {
          stopAudio();
      }

      setLoadingAudio(true);
      setPlayingLessonId(lesson.id);
      
      // Determine text to read: Adaptive content if enabled and available, otherwise original
      let textToRead = lesson.content;
      if (isAdaptiveMode && adaptiveContentCache[lesson.id]) {
          // Strip simple HTML tags for better reading if adaptive content has them
          const adaptiveText = adaptiveContentCache[lesson.id].replace(/<[^>]*>?/gm, '');
          textToRead = adaptiveText;
      }
      
      // Basic cleanup to remove markdown artifacts or excessive newlines which might affect flow
      textToRead = textToRead.replace(/[*#_]/g, '').trim();

      try {
          const base64Audio = await generateSpeech(textToRead, selectedVoice);
          
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }

          const source = await playPCM(base64Audio, audioContextRef.current, playbackSpeed);
          audioSourceRef.current = source;
          setIsPlayingAudio(true);
          
          source.onended = () => {
              setIsPlayingAudio(false);
              setPlayingLessonId(null);
              audioSourceRef.current = null;
          };

      } catch (error) {
          alert("Failed to generate speech. Please try again.");
          setPlayingLessonId(null);
      } finally {
          setLoadingAudio(false);
      }
  };
  
  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quizForLessonId) return;
    
    let score = 0;
    quiz.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    const percentage = Math.round((score / quiz.length) * 100);
    onUpdateQuizScore(user.id, course.id, quizForLessonId, percentage);

    setSubmittedQuiz(true);
    setLoadingFeedback(true);
    setFeedbackError(null);
    try {
        // Pass user preferences for adaptive feedback
        const feedbackResult = await getQuizFeedback(quiz, selectedAnswers, user.preferences);
        setQuizFeedback(feedbackResult);
    } catch (e) {
        setFeedbackError('Could not retrieve AI feedback.');
    } finally {
        setLoadingFeedback(false);
    }
  }
  
  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      onAddReview(course.id, { studentId: user.id, rating: userRating, comment: userReview });
      setReviewSubmitted(true);
  };

  const handleAskQuestionSubmit = (question: string, attachment?: string) => {
      if (!askQuestionLesson) return;
      
      const messageContent = `[Question regarding lesson: ${askQuestionLesson.title}]\n${question}${attachment ? `\n\n📎 Attachment: ${attachment}` : ''}`;
      
      onSendMessage(course.id, user.id, messageContent, user.id);
      setAskQuestionLesson(null);
      
      // Optionally notify user or open chat to show sent message
      // For better UX, we could show a toast notification, but opening chat works too
      onOpenChat();
  };

  const LessonIcon = ({ type }: { type: Lesson['type'] }) => {
    switch (type) {
      case 'video': return <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a1 1 0 011.45.89V13a1 1 0 01-1.45.89L15 12.11V10zM4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>;
      case 'text': return <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'quiz': return <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default: return null;
    }
  };

  const getOptionLabelClass = (questionIndex: number, option: string) => {
    if (!submittedQuiz) return "text-gray-800 dark:text-gray-300 font-medium";
    const isCorrect = option === quiz?.[questionIndex].correctAnswer;
    const isSelected = selectedAnswers[questionIndex] === option;
    if (isCorrect) return "text-green-700 dark:text-green-400 font-bold";
    if (isSelected && !isCorrect) return "text-red-700 dark:text-red-400 line-through";
    return "text-gray-600 dark:text-gray-400";
  };

  const formatTime = (seconds: number) => {
      if (!seconds) return '0m';
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s}s`;
  };

  const instructors = allUsers.filter(u => course.instructorIds.includes(u.id)).map(u => u.name.split(' ')[0]).join(', ');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <button onClick={onBack} className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 hover:underline font-medium">
            <BackIcon className="w-5 h-5" />
            <span>Back to Dashboard</span>
        </button>
        <div className="flex flex-wrap justify-center items-center gap-3">
             {isCourseCompleted && (
                 <button 
                    onClick={() => setShowCertificate(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 shadow-sm transition-colors text-sm font-bold animate-bounce"
                 >
                    <AwardIcon className="w-5 h-5" />
                    <span>View Certificate</span>
                 </button>
             )}
             <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-300 dark:border-gray-700">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-300">Adaptive Mode</span>
                <button 
                    onClick={handleAdaptiveToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAdaptiveMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    title="Toggle AI Adaptive Content based on your learning preferences"
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdaptiveMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <button 
                onClick={onOpenChat} 
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-sm transition-colors text-sm font-medium"
            >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                <span>Chat with Mentors</span>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
        <img className="h-64 w-full object-cover" src={course.imageUrl} alt={course.title} />
        <div className="p-6">
          <div className="flex justify-between items-start">
              <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
                  <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400 font-semibold">Instructors: {instructors}</p>
              </div>
          </div>
          <p className="mt-4 text-gray-800 dark:text-gray-300 leading-relaxed font-medium">{course.description}</p>
        </div>
        
        {/* Rating Section */}
        <div className="px-6 py-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Rate this Course</h3>
            {!reviewSubmitted && !course.reviews.some(r => r.studentId === user.id) ? (
                <form onSubmit={handleSubmitReview} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <span className="mr-2 text-gray-800 dark:text-gray-300 font-medium">Rating:</span>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button type="button" key={star} onClick={() => setUserRating(star)} className={`focus:outline-none ${star <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    <StarIcon solid={true} className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                        placeholder="Write a brief review..."
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mb-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white"
                        rows={2}
                        required
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">Submit Review</button>
                </form>
            ) : (
                <p className="text-green-700 dark:text-green-400 flex items-center font-medium">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    You have rated this course. Thank you!
                </p>
            )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Course Content</h3>
          <ul className="space-y-3">
            {course.lessons.map(lesson => {
                const timeSpent = progress?.timeSpent?.[lesson.id] || 0;
                const quizScore = progress?.quizScores?.[lesson.id];
                const isCompleted = completedLessonIds.has(lesson.id);
                const isBookmarked = bookmarkedLessonIds.has(lesson.id);
                const isPlayingThis = playingLessonId === lesson.id;
                
                return (
              <li key={lesson.id} className={`rounded-lg overflow-hidden border transition-all duration-500 ease-in-out ${
                  isPlayingThis ? 'border-purple-500 ring-1 ring-purple-400 bg-purple-50 dark:bg-purple-900/10' : 
                  isCompleted 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 transform scale-[1.01] shadow-sm' 
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm'
              }`}>
                <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                    onClick={() => handleToggleExpand(lesson.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div onClick={(e) => { e.stopPropagation(); onToggleLesson(user.id, course.id, lesson.id); }} className="flex items-center cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors" title={isCompleted ? "Mark as incomplete" : "Mark as complete"}>
                         {isCompleted ? (
                             <CheckCircleIcon className="w-7 h-7 text-green-600 transition-all duration-300 transform scale-110 drop-shadow-sm" />
                         ) : (
                             <div className="w-6 h-6 rounded-full border-2 border-gray-400 dark:border-gray-500 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-white dark:bg-gray-800"></div>
                         )}
                    </div>
                    <LessonIcon type={lesson.type} />
                    <div>
                        <span className={`font-bold block transition-colors duration-300 ${isCompleted ? 'text-green-800 dark:text-green-200 line-through decoration-green-500/50' : 'text-gray-900 dark:text-white'}`}>{lesson.title}</span>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                            <span className="flex items-center"><ClockIcon className="w-3 h-3 mr-1" /> {formatTime(timeSpent)}</span>
                            {quizScore !== undefined && (
                                <span className={`font-bold ${quizScore >= 80 ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                                    Score: {quizScore}%
                                </span>
                            )}
                        </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                       <button
                         onClick={(e) => { e.stopPropagation(); onToggleBookmark(user.id, course.id, lesson.id); }}
                         className={`p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 ${isBookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
                         title={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}
                       >
                         <BookmarkIcon className="w-5 h-5" solid={isBookmarked} />
                       </button>
                       
                       <button
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (expandedLessonId !== lesson.id) setExpandedLessonId(lesson.id);
                                handleImmersiveReader(lesson); 
                            }}
                            className={`p-1.5 rounded-full transition-all duration-200 shadow-sm ${
                                isPlayingThis 
                                ? 'bg-purple-600 text-white animate-pulse ring-2 ring-purple-300' 
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-gray-600 dark:text-indigo-300 dark:hover:bg-gray-500'
                            }`}
                            title="Listen to Lesson"
                        >
                            {loadingAudio && playingLessonId === lesson.id ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <SpeakerWaveIcon className="w-5 h-5" />
                            )}
                        </button>

                       <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold hidden sm:inline">
                           {expandedLessonId === lesson.id ? 'Hide Content' : 'View Content'}
                       </span>
                       <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedLessonId === lesson.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                  </div>
                </div>
                
                {/* Expanded Content */}
                {expandedLessonId === lesson.id && (
                    <div className="px-4 pb-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 transition-all duration-300 ease-in-out">
                        
                        {/* Adaptive Content Section */}
                        {isAdaptiveMode ? (
                             <div className="prose prose-sm dark:prose-invert max-w-none py-4">
                                {loadingAdaptive ? (
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                                        <div className="flex items-center text-indigo-600 space-x-2 text-sm mt-2 font-medium">
                                            <SparklesIcon className="w-4 h-4 animate-spin" />
                                            <span>Personalizing content based on your preferences...</span>
                                        </div>
                                    </div>
                                ) : adaptiveError ? (
                                    <div>
                                        <p className="text-red-600 text-sm font-medium">{adaptiveError}</p>
                                        <p className="text-gray-800 dark:text-gray-200 mt-2">{lesson.content}</p>
                                    </div>
                                ) : (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                                         <div className="flex items-center mb-4 text-indigo-800 dark:text-indigo-400 text-sm font-bold">
                                            <SparklesIcon className="w-5 h-5 mr-2" />
                                            Adapted for: {user.preferences?.learningLevel || 'Intermediate'} • {user.preferences?.learningStyle || 'Scenario-based'}
                                         </div>
                                        <div className="text-gray-800 dark:text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: (adaptiveContentCache[lesson.id] || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}></div>
                                    </div>
                                )}
                             </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none py-4 text-gray-900 dark:text-gray-100 leading-relaxed">
                                <p>{lesson.content}</p>
                            </div>
                        )}

                        
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                             
                             {/* IMMERSIVE READER CONTROL BAR */}
                             <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-lg border border-purple-200 dark:border-purple-800/50">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleImmersiveReader(lesson); }}
                                    disabled={loadingAudio}
                                    className={`flex items-center justify-center h-8 px-3 rounded-md transition-colors ${
                                        isPlayingThis 
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                    title={isPlayingThis ? "Stop Reading" : "Start Immersive Reader"}
                                 >
                                     {loadingAudio && playingLessonId === lesson.id ? (
                                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                     ) : (
                                         isPlayingThis ? <div className="h-3 w-3 rounded-sm bg-white"></div> : <SpeakerWaveIcon className="w-4 h-4" />
                                     )}
                                 </button>
                                 
                                 {/* Audio Controls (only show when playing or ready) */}
                                 <div className="flex items-center space-x-2 pl-1 border-l border-purple-200 dark:border-purple-700/50">
                                     <select 
                                        value={selectedVoice} 
                                        onChange={(e) => setSelectedVoice(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-8 text-xs bg-white dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-md px-2 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none font-medium"
                                        title="Select Voice Persona"
                                     >
                                         <option value="Kore">Kore (Calm Female)</option>
                                         <option value="Puck">Puck (Energetic Male)</option>
                                         <option value="Charon">Charon (Deep Male)</option>
                                         <option value="Fenrir">Fenrir (Strong Male)</option>
                                         <option value="Zephyr">Zephyr (Soft Female)</option>
                                     </select>

                                     <select 
                                        value={playbackSpeed} 
                                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-8 text-xs bg-white dark:bg-gray-700 border border-purple-200 dark:border-gray-600 rounded-md px-2 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none w-20 font-medium"
                                        title="Playback Speed"
                                     >
                                         <option value="0.75">0.75x</option>
                                         <option value="1">1.0x</option>
                                         <option value="1.25">1.25x</option>
                                         <option value="1.5">1.5x</option>
                                         <option value="2">2.0x</option>
                                     </select>
                                 </div>
                                 
                                 {isPlayingThis && (
                                     <div className="flex space-x-1 h-4 items-center px-2">
                                         <div className="w-1 h-full bg-purple-500 animate-[bounce_1s_infinite]"></div>
                                         <div className="w-1 h-3/4 bg-purple-500 animate-[bounce_1.2s_infinite]"></div>
                                         <div className="w-1 h-1/2 bg-purple-500 animate-[bounce_0.8s_infinite]"></div>
                                         <div className="w-1 h-full bg-purple-500 animate-[bounce_1.1s_infinite]"></div>
                                     </div>
                                 )}
                             </div>

                            {lesson.type === 'text' && (
                                <>
                                    <button onClick={(e) => {e.stopPropagation(); handleSummarize(lesson);}} className="flex items-center space-x-1 text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors font-medium border border-indigo-200 dark:border-indigo-800">
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>{summarizedLessonId === lesson.id && summary ? 'Hide Summary' : 'AI Summary'}</span>
                                    </button>
                                    <button onClick={(e) => {e.stopPropagation(); handleGenerateQuiz(lesson);}} className="flex items-center space-x-1 text-sm px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900 transition-colors font-medium border border-green-200 dark:border-green-800">
                                        <QuestionMarkCircleIcon className="w-4 h-4" />
                                        <span>{quizForLessonId === lesson.id && quiz ? 'Hide Quiz' : 'AI Quiz'}</span>
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={(e) => {e.stopPropagation(); setAskQuestionLesson(lesson); }} 
                                className="flex items-center space-x-1 text-sm px-3 py-1.5 bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 rounded hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors font-medium border border-orange-200 dark:border-orange-800"
                            >
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                <span>Ask Instructor</span>
                            </button>
                        </div>

                        {/* AI & Quiz Results Area */}
                        {summarizedLessonId === lesson.id && (
                        <div className="mt-3 pl-4 pr-4 py-3 bg-indigo-50 dark:bg-gray-700 rounded-md border-l-4 border-indigo-500 shadow-sm">
                            {loadingSummary ? <p className="italic text-sm text-gray-600 dark:text-gray-300">Generating summary...</p> : 
                             summaryError ? <p className="text-sm text-red-600 dark:text-red-400 font-medium">{summaryError}</p> :
                             <div className="prose prose-sm dark:prose-invert text-gray-900 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: summary.replace(/\*/g, '•').replace(/\n/g, '<br/>') }}></div>}
                        </div>
                        )}
                        
                        {quizForLessonId === lesson.id && (
                            <div className="mt-3 pl-4 pr-4 py-3 bg-green-50 dark:bg-gray-700 rounded-md border-l-4 border-green-500 shadow-sm">
                                {loadingQuiz && <p className="italic text-sm text-gray-600 dark:text-gray-300">Generating quiz...</p>}
                                {quizError && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{quizError}</p>}
                                {!loadingQuiz && !quizError && quiz && quiz.length > 0 && (
                                    <div className="space-y-4">
                                        {/* Adaptive Quiz Badge */}
                                        {user.preferences && (
                                             <div className="mb-2 flex items-center text-xs text-green-800 dark:text-green-300 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded w-fit">
                                                <SparklesIcon className="w-3 h-3 mr-1" />
                                                Adapted for {user.preferences.learningStyle}
                                             </div>
                                        )}
                                        {quiz.map((q, index) => (
                                            <div key={index}>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{index + 1}. {q.question}</p>
                                                <div className="mt-2 space-y-1 pl-4">
                                                    {q.options.map((option, optionIndex) => (
                                                        <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                                                            <input type="radio" name={`question-${index}`} value={option} checked={selectedAnswers[index] === option} onChange={() => handleAnswerChange(index, option)} disabled={submittedQuiz} className="text-green-600 focus:ring-green-500" />
                                                            <span className={`text-sm ${getOptionLabelClass(index, option)}`}>{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {!submittedQuiz && ( <button onClick={handleSubmitQuiz} className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-green-400 shadow-sm" disabled={Object.keys(selectedAnswers).length !== quiz.length}>Submit Quiz</button>)}
                                    </div>
                                )}
                                {loadingFeedback && <p className="italic mt-4 text-sm text-gray-600 dark:text-gray-300">Generating feedback...</p>}
                                {feedbackError && <p className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">{feedbackError}</p>}
                                
                                {quizFeedback && quizFeedback.length > 0 && (
                                    <div className="mt-6 space-y-4 animate-fade-in">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                            AI Performance Analysis
                                        </h4>
                                        {quizFeedback.map((fb, index) => (
                                            <div 
                                                key={index} 
                                                className={`p-4 rounded-lg border shadow-sm transition-all ${
                                                    fb.isCorrect 
                                                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                                        : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`flex-shrink-0 p-1.5 rounded-full ${fb.isCorrect ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
                                                        {fb.isCorrect 
                                                            ? <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" /> 
                                                            : <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-3">
                                                            {fb.question}
                                                        </p>
                                                        
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                                            <div className={`p-2 rounded border ${fb.isCorrect ? 'bg-green-100/50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-100/50 border-red-200 dark:bg-red-900/30 dark:border-red-800'}`}>
                                                                <span className={`text-xs font-bold uppercase tracking-wider block mb-0.5 ${fb.isCorrect ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                                                                    Your Answer
                                                                </span>
                                                                <span className={`text-sm font-bold ${
                                                                    fb.isCorrect 
                                                                        ? 'text-green-800 dark:text-green-300' 
                                                                        : 'text-red-700 dark:text-red-300 line-through decoration-red-400'
                                                                }`}>
                                                                    {fb.userAnswer}
                                                                </span>
                                                            </div>
                                                            
                                                            {!fb.isCorrect && (
                                                                <div className="p-2 rounded border bg-green-100/50 border-green-200 dark:bg-green-900/30 dark:border-green-800">
                                                                    <span className="text-xs font-bold uppercase tracking-wider block mb-0.5 text-green-800 dark:text-green-400">
                                                                        Correct Answer
                                                                    </span>
                                                                    <span className="text-sm font-bold text-green-800 dark:text-green-400">
                                                                        {fb.correctAnswer}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="relative pl-3 border-l-2 border-indigo-400 dark:border-indigo-500">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <SparklesIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                                                                    Personalized Feedback
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-800 dark:text-gray-300 italic leading-relaxed font-medium">
                                                                "{fb.explanation}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {quiz && quiz.length === 0 && !loadingQuiz && !quizError && <p className="text-sm text-red-600">Could not generate a quiz for this lesson.</p>}
                            </div>
                        )}
                    </div>
                )}
              </li>
            )})}
          </ul>
        </div>
        
        {/* Certificate Modal */}
        {showCertificate && (
            <CertificateModal 
                studentName={user.name.replace(/ \(.+\)/, '')}
                courseTitle={course.title}
                completionDate={new Date().toLocaleDateString()}
                instructors={allUsers.filter(u => course.instructorIds.includes(u.id)).map(u => u.name.replace(/ \(.+\)/, ''))}
                onClose={() => setShowCertificate(false)}
            />
        )}

        {/* Preferences Modal within Course Context */}
        {showPrefModal && (
            <LearningPreferencesModal 
                currentPreferences={user.preferences}
                onSave={handleSavePreferences}
                onClose={() => setShowPrefModal(false)}
            />
        )}

        {/* Ask Instructor Modal */}
        {askQuestionLesson && (
            <AskInstructorModal 
                course={course}
                lesson={askQuestionLesson}
                onClose={() => setAskQuestionLesson(null)}
                onSubmit={handleAskQuestionSubmit}
            />
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
