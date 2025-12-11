import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, User, Role } from '../types';
import { ChatBubbleLeftRightIcon, PaperClipIcon, ArrowRightIcon, XCircleIcon } from './icons';

interface ChatWindowProps {
  session: ChatSession | undefined;
  currentUser: User;
  courseTitle: string;
  instructors: User[];
  onSendMessage: (content: string) => void;
  onClose: () => void;
}

const TypingIndicator = () => (
  <div className="flex space-x-1.5 p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm w-fit items-center h-12 animate-fade-in shadow-sm border border-gray-200 dark:border-gray-600">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ session, currentUser, courseTitle, instructors, onSendMessage, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(session?.messages.length || 0);

  // Smart Scroll Logic
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // Initial scroll
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // Handle new messages and typing state simulation
  useEffect(() => {
    if (!session) return;

    const currentCount = session.messages.length;
    
    // Check if a new message arrived
    if (currentCount > prevMessageCount.current) {
        const lastMsg = session.messages[currentCount - 1];
        const isMe = lastMsg.senderId === currentUser.id;

        // If I sent it, turn ON typing indicator (simulating AI thinking)
        if (isMe) {
            setIsTyping(true);
            scrollToBottom();
        } 
        // If AI/Instructor sent it, turn OFF typing indicator
        else {
            setIsTyping(false);
            // Play notification sound (optional, unobtrusive)
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(500, ctx.currentTime);
                    gain.gain.setValueAtTime(0.02, ctx.currentTime); // Very low volume
                    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.3);
                }
            } catch (e) {
                // Ignore audio errors
            }
            scrollToBottom();
        }
    }
    
    prevMessageCount.current = currentCount;
  }, [session, currentUser.id]);

  // Safety timeout to turn off typing indicator if no response comes quickly (fallback)
  useEffect(() => {
      if (isTyping) {
          const timeout = setTimeout(() => setIsTyping(false), 8000);
          return () => clearTimeout(timeout);
      }
  }, [isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    setNewMessage('');
    // Focus stays on input
  };

  const instructorNames = instructors.map(i => i.name.split(' ')[0]).join(', ');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop with blur - clicking it closes panel */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Side Panel */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in-right">
        
        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-6 py-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-full relative border border-indigo-100 dark:border-indigo-800">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 bg-green-500 animate-pulse"></span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate">{courseTitle}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium mt-0.5">
                        With: <span className="text-indigo-600 dark:text-indigo-400">{instructorNames || "AI Tutor"}</span>
                    </p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close Chat"
            >
                <XCircleIcon className="w-8 h-8" />
            </button>
        </div>

        {/* Messages Area */}
        <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/50 dark:bg-gray-950/50 space-y-5 scroll-smooth"
        >
            {!session || session.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-full mb-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <ChatBubbleLeftRightIcon className="w-10 h-10 text-indigo-400/80" />
                    </div>
                    <p className="font-bold text-base mb-2 text-gray-800 dark:text-gray-200">No messages yet</p>
                    <p className="text-sm max-w-xs leading-relaxed">
                        This is the beginning of your conversation. Feel free to ask questions or discuss course materials.
                    </p>
                </div>
            ) : (
                <>
                    {session.messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser.id;
                        const isInstructor = msg.role === Role.Instructor;
                        
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}>
                                {!isMe && (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0 self-end mb-1 text-xs font-bold text-white shadow-md border-2 border-white dark:border-gray-800">
                                        {msg.senderName.charAt(0)}
                                    </div>
                                )}
                                <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && (
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1">{msg.senderName}</span>
                                    )}
                                    <div 
                                        className={`rounded-2xl px-5 py-3.5 shadow-sm relative text-[15px] leading-relaxed break-words ${
                                        isMe 
                                            ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/20' 
                                            : isInstructor 
                                                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                                    }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    <span className={`text-[10px] font-medium text-gray-400 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-fade-in mb-2">
                             <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0 self-end mb-1 border-2 border-white dark:border-gray-800">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 animate-pulse">•••</span>
                             </div>
                             <TypingIndicator />
                        </div>
                    )}
                </>
            )}
            <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-end space-x-3 relative z-20 flex-shrink-0">
            <button 
                type="button" 
                className="p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50"
                title="Attach file (Not available in demo)"
            >
                <PaperClipIcon className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all shadow-inner text-sm font-medium placeholder-gray-500 dark:placeholder-gray-400"
                />
            </div>
            <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white p-3.5 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-indigo-500/30 transform hover:scale-105 active:scale-95 flex items-center justify-center group"
            >
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;