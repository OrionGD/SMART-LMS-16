import React, { useState } from 'react';
import { User, Role } from '../types';
import { APP_LOGO_AVATAR } from '../constants';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: Omit<User, 'id' | 'enrolledCourseIds'>) => { success: boolean, message: string };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Register state
  const [name, setName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNameError, setNewNameError] = useState('');
  const [newUsernameError, setNewUsernameError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  // Default role is Student for public registration
  const role = Role.Student;

  const [formError, setFormError] = useState('');

  // --- Validation Logic ---
  const validateUsername = (val: string) => {
      if (!val.trim()) return 'Username is required.';
      // Updated to allow 2 chars for admins like 'gd', 'hh', 'DB'
      if (val.length < 2) return 'Username must be at least 2 characters.';
      return '';
  };

  const validatePassword = (val: string) => {
      if (!val) return 'Password is required.';
      if (val.length < 4) return 'Password must be at least 4 characters.';
      return '';
  };

  const validateName = (val: string) => {
      if (!val.trim()) return 'Full Name is required.';
      return '';
  };

  // --- Handlers ---

  const handleLoginChange = (field: 'username' | 'password', value: string) => {
      if (field === 'username') {
          setUsername(value);
          setUsernameError(validateUsername(value));
      } else {
          setPassword(value);
          setPasswordError(validatePassword(value));
      }
      setFormError(''); // Clear global error on type
  };

  const handleRegisterChange = (field: 'name' | 'username' | 'password', value: string) => {
      if (field === 'name') {
          setName(value);
          setNewNameError(validateName(value));
      } else if (field === 'username') {
          setNewUsername(value);
          setNewUsernameError(validateUsername(value));
      } else {
          setNewPassword(value);
          setNewPasswordError(validatePassword(value));
      }
      setFormError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final Validation Check
    const uErr = validateUsername(username);
    const pErr = validatePassword(password);
    setUsernameError(uErr);
    setPasswordError(pErr);

    if (uErr || pErr) return;

    setFormError('');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setFormError('Invalid username or password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final Validation Check
    const nErr = validateName(name);
    const uErr = validateUsername(newUsername);
    const pErr = validatePassword(newPassword);
    setNewNameError(nErr);
    setNewUsernameError(uErr);
    setNewPasswordError(pErr);

    if (nErr || uErr || pErr) return;

    setFormError('');
    
    // Force role to Student
    const result = onRegister({ name: `${name} (${role})`, username: newUsername, password: newPassword, role });
    if (!result.success) {
      setFormError(result.message);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormError('');
    // Clear form fields & errors
    setUsername('');
    setPassword('');
    setUsernameError('');
    setPasswordError('');
    
    setName('');
    setNewUsername('');
    setNewPassword('');
    setNewNameError('');
    setNewUsernameError('');
    setNewPasswordError('');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      {/* LEFT COLUMN - BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center relative overflow-hidden text-white">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10 text-center px-12">
          <img src={APP_LOGO_AVATAR} alt="Smart LMS Logo" className="h-48 w-48 mx-auto mb-8 object-contain drop-shadow-2xl" />
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">Smart LMS</h1>
          <p className="text-xl text-indigo-100 font-medium leading-relaxed max-w-md mx-auto">
            Experience education evolved. <br/>
            AI-Enhanced personalized learning tailored just for you.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN - FORMS */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 p-8">
          
          {/* Mobile Logo & Header */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
               <img src={APP_LOGO_AVATAR} alt="Smart LMS" className="h-24 w-24 object-contain drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isRegistering ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
              {isRegistering ? 'Join our AI-Enhanced Learning Platform' : 'Sign in to continue your progress'}
            </p>
          </div>

          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      required 
                      value={name} 
                      onChange={e => handleRegisterChange('name', e.target.value)} 
                      className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm font-medium bg-gray-700 text-white ${newNameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'}`} 
                      placeholder="John Doe"
                  />
                  {newNameError && <p className="mt-1 text-xs text-red-500 font-medium">{newNameError}</p>}
              </div>
               <div>
                  <label htmlFor="new-username" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input 
                      id="new-username" 
                      name="new-username" 
                      type="text" 
                      required 
                      value={newUsername} 
                      onChange={e => handleRegisterChange('username', e.target.value)} 
                      className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm font-medium bg-gray-700 text-white ${newUsernameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'}`} 
                      placeholder="johndoe"
                  />
                  {newUsernameError && <p className="mt-1 text-xs text-red-500 font-medium">{newUsernameError}</p>}
              </div>
              <div>
                  <label htmlFor="new-password"className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input 
                      id="new-password" 
                      name="new-password" 
                      type="password" 
                      required 
                      value={newPassword} 
                      onChange={e => handleRegisterChange('password', e.target.value)} 
                      className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm font-medium bg-gray-700 text-white ${newPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'}`} 
                      placeholder="••••••••"
                  />
                  {newPasswordError && <p className="mt-1 text-xs text-red-500 font-medium">{newPasswordError}</p>}
              </div>
              
              {formError && <p className="text-sm text-red-600 font-medium text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{formError}</p>}
              
              <button 
                  type="submit" 
                  disabled={!!(newNameError || newUsernameError || newPasswordError)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                  Create Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input 
                  id="username" 
                  name="username" 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => handleLoginChange('username', e.target.value)} 
                  className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm font-medium bg-gray-700 text-white ${usernameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'}`} 
                  placeholder="Enter your username"
                />
                {usernameError && <p className="mt-1 text-xs text-red-500 font-medium">{usernameError}</p>}
              </div>
              <div>
                <label htmlFor="password"className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => handleLoginChange('password', e.target.value)} 
                  className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm font-medium bg-gray-700 text-white ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'}`} 
                  placeholder="Enter your password"
                />
                {passwordError && <p className="mt-1 text-xs text-red-500 font-medium">{passwordError}</p>}
              </div>
               
               {formError && <p className="text-sm text-red-600 font-medium text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{formError}</p>}
              
              <button 
                  type="submit" 
                  disabled={!!(usernameError || passwordError)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                  Sign In
              </button>
            </form>
          )}
          
          <div className="text-sm text-center lg:text-left mt-6">
              <span className="text-gray-600 dark:text-gray-400">
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button onClick={toggleMode} className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-1">
                  {isRegistering ? 'Sign In' : "Register Now"}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;