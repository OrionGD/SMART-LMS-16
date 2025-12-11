
import React from 'react';
import { User, Role } from '../types';
import { LogoutIcon, AdjustmentsIcon, SunIcon, MoonIcon, UserGroupIcon } from './icons';
import { TRADITIONAL_USER_AVATAR, APP_LOGO_AVATAR } from '../constants';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onShowProfile: () => void;
  onShowPreferences: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  serverStatus: 'online' | 'offline';
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onShowProfile, onShowPreferences, darkMode, onToggleDarkMode, serverStatus }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onShowProfile}>
            <img src={APP_LOGO_AVATAR} alt="Smart LMS Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Smart LMS</h1>
          </div>
          <div className="flex items-center space-x-4">
             {/* Server Status Indicator */}
             <div 
               className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                 serverStatus === 'online' 
                   ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                   : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
               }`}
               title={serverStatus === 'online' ? "Backend is connected via MongoDB" : "Backend is disconnected. Using offline mode."}
             >
                <span className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                <span className="hidden sm:inline">{serverStatus === 'online' ? 'DB Connected' : 'Offline Mode'}</span>
             </div>

             <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>

             {user.role === Role.Student && (
                 <button
                  onClick={onShowPreferences}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  title="AI Learning Preferences"
                >
                  <AdjustmentsIcon className="h-6 w-6" />
                </button>
             )}
             
             {/* Profile Icon (Replaces About) */}
             <button
              onClick={onShowProfile}
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              title="User Profile"
            >
              <UserGroupIcon className="h-6 w-6" />
            </button>
            
            <div 
              className="hidden sm:flex items-center space-x-3 pl-2 border-l border-gray-300 dark:border-gray-700 cursor-pointer"
              onClick={onShowProfile}
            >
              <img 
                src={user.profilePicture || TRADITIONAL_USER_AVATAR}
                alt={user.name} 
                className="h-10 w-10 rounded-full object-cover border-2 border-indigo-100 dark:border-gray-600 hover:border-indigo-400 transition-colors"
              />
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.displayName || user.name.split(' (')[0]}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{user.role}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              aria-label="Logout"
              title="Logout"
            >
              <LogoutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
