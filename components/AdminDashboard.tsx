import React, { useState, useMemo } from 'react';
import { Role, User, Course, Progress, ChatSession } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { UserGroupIcon, AcademicCapIcon, ChartBarIcon, TrashIcon, PlusIcon, XCircleIcon, PencilIcon, ChatBubbleLeftRightIcon, SparklesIcon, EyeIcon } from './icons';
import { TRADITIONAL_USER_AVATAR } from '../constants';
import EditCourseModal from './EditCourseModal';
import ChatWindow from './ChatWindow';
import { generateSystemReport } from '../services/geminiService';
import UserProfileModal from './UserProfileModal';


interface AdminDashboardProps {
    user: User;
    users: User[];
    courses: Course[];
    progress: Progress[];
    chatSessions: ChatSession[];
    onDeleteUser: (userId: number) => void;
    onDeleteCourse: (courseId: number) => void;
    onEditCourse: (course: Course) => void;
    onChangeUserRole: (userId: number, newRole: Role) => void;
    onAddUser: (user: Omit<User, 'id' | 'enrolledCourseIds'>) => { success: boolean, message: string };
    onSendMessage: (courseId: number, studentId: number, content: string, senderId: number) => void;
    onUpdateUser?: (user: User) => void; // Added for saving edits from UserProfileModal
}

type AdminTab = 'analytics' | 'users' | 'courses' | 'messages';

const AdminDashboard: React.FC<AdminDashboardProps> = ({user, users, courses, progress, chatSessions, onDeleteUser, onDeleteCourse, onEditCourse, onChangeUserRole, onAddUser, onSendMessage, onUpdateUser}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
    
    // Add User Modal State
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserUsername, setNewUserUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role>(Role.Instructor); // Default to Instructor for admin creation
    const [addUserError, setAddUserError] = useState('');

    // Edit Course State
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Chat State
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);

    // Report State
    const [systemReport, setSystemReport] = useState('');
    const [generatingReport, setGeneratingReport] = useState(false);

    // View User Profile State
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    // Filter chats for Admin (Course ID 0)
    const adminChats = useMemo(() => {
        return chatSessions.filter(s => s.courseId === 0).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    }, [chatSessions]);

    // --- Handlers ---
    const handleDeleteUserClick = (user: User) => {
        if(window.confirm(`Are you sure you want to delete the user "${user.name}"? This action cannot be undone.`)) {
            onDeleteUser(user.id);
        }
    }
    
    const handleDeleteCourseClick = (course: Course) => {
        if(window.confirm(`Are you sure you want to delete the course "${course.title}"? This action cannot be undone.`)) {
            onDeleteCourse(course.id);
        }
    }

    const handleSaveEditedCourse = (updatedCourse: Course) => {
        onEditCourse(updatedCourse);
        setEditingCourse(null);
    };

    const handleAddUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAddUserError('');
        if (!newUserName || !newUserUsername || !newUserPassword) {
            setAddUserError('All fields are required.');
            return;
        }
        
        const result = onAddUser({
            name: `${newUserName} (${newUserRole})`,
            username: newUserUsername,
            password: newUserPassword,
            role: newUserRole
        });

        if (result.success) {
            setShowAddUserModal(false);
            // Reset form
            setNewUserName('');
            setNewUserUsername('');
            setNewUserPassword('');
            setNewUserRole(Role.Instructor);
        } else {
            setAddUserError(result.message);
        }
    };

    const handleGenerateSystemReport = async () => {
        setGeneratingReport(true);
        try {
            const report = await generateSystemReport(users, courses, progress);
            setSystemReport(report);
        } catch (error) {
            alert('Failed to generate system report.');
        } finally {
            setGeneratingReport(false);
        }
    };

    const handleUpdateUserProfile = (updatedUser: User) => {
        if (onUpdateUser) {
            onUpdateUser(updatedUser);
            // Update local viewing user state if it matches to reflect changes immediately
            if (viewingUser && viewingUser.id === updatedUser.id) {
                setViewingUser(updatedUser);
            }
        }
    };

    const getInstructorNames = (instructorIds: number[]) => {
        return users
            .filter(u => instructorIds.includes(u.id))
            .map(u => u.name.replace(/ \(.+\)/, ''))
            .join(', ') || 'N/A';
    };

    // --- Render Methods for Tabs ---
    const renderAnalytics = () => {
        const totalUsers = users.length;
        const totalCourses = courses.length;
        const engagedUserIds = new Set(progress.filter(p => p.completedLessons.length > 0).map(p => p.userId));
        const studentUsers = users.filter(u => u.role === Role.Student).length;
        const engagementRate = studentUsers > 0 ? (engagedUserIds.size / studentUsers) * 100 : 0;
        
        // --- CHART DATA PREPARATION ---

        // 1. Course Popularity
        const coursePopularityData = courses
            .map(c => ({
                name: c.title.substring(0, 15) + (c.title.length > 15 ? '...' : ''),
                students: users.filter(u => u.enrolledCourseIds.includes(c.id)).length
            }))
            .sort((a, b) => b.students - a.students)
            .slice(0, 10); // Top 10

        // 2. Learning Styles Distribution
        const styles = users
            .filter(u => u.role === Role.Student)
            .map(u => u.preferences?.learningStyle || 'Unspecified');
        const styleData = Object.entries(styles.reduce((acc, style) => {
            acc[style] = (acc[style] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));
        const STYLE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

        // 3. User Role Distribution (Chart for all users)
        const roleDistributionData = [
            { name: 'Students', value: users.filter(u => u.role === Role.Student).length, color: '#4F46E5' }, // Indigo
            { name: 'Instructors', value: users.filter(u => u.role === Role.Instructor).length, color: '#10B981' }, // Emerald
            { name: 'Admins', value: users.filter(u => u.role === Role.Admin).length, color: '#F59E0B' }, // Amber
        ].filter(d => d.value > 0);

        // 4. Role Interaction Activity (Comparison Chart)
        let studentMessages = 0;
        let instructorMessages = 0;
        chatSessions.forEach(s => {
            s.messages.forEach(m => {
                if (m.role === Role.Student) studentMessages++;
                if (m.role === Role.Instructor) instructorMessages++;
            });
        });

        const totalLessonsCompleted = progress.reduce((acc, p) => acc + p.completedLessons.length, 0);
        // Instructor "Activity" approximates to courses assigned/taught
        const totalInstructorAssignments = courses.reduce((acc, c) => acc + c.instructorIds.length, 0);

        const interactionData = [
            {
                name: 'Students',
                'Academic Activity': totalLessonsCompleted, // Lessons Completed
                'Communication': studentMessages
            },
            {
                name: 'Instructors',
                'Academic Activity': totalInstructorAssignments, // Courses Taught
                'Communication': instructorMessages
            }
        ];

        return (
            <div className="space-y-8 animate-fade-in pb-10">
                 {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full"><UserGroupIcon className="w-8 h-8 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Users</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{totalUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full"><AcademicCapIcon className="w-8 h-8 text-green-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Courses</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{totalCourses}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full"><ChartBarIcon className="w-8 h-8 text-indigo-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Engagement</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{engagementRate.toFixed(0)}%</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full"><ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Support Msg</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{adminChats.length}</p>
                        </div>
                    </div>
                </div>

                {/* ROW 1: Enrollment & Styles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Course Popularity Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Courses by Enrollment</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={coursePopularityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={150} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                                        itemStyle={{ color: '#f3f4f6' }}
                                        cursor={{fill: 'transparent'}}
                                    />
                                    <Bar dataKey="students" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Learning Styles Donut Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Student Learning Styles</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={styleData} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={100} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {styleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STYLE_COLORS[index % STYLE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ROW 2: User Distribution & Role Interaction */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Role Distribution */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System User Distribution</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {roleDistributionData.map((entry, index) => (
                                            <Cell key={`cell-role-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Role Activity Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Role-Based Activity Levels</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={interactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} />
                                    <YAxis tick={{fill: '#6b7280', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    />
                                    <Legend />
                                    <Bar dataKey="Academic Activity" name="Courses/Lessons" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Communication" name="Messages Sent" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2 italic">
                            *Academic Activity: Students (Lessons Completed) vs Instructors (Courses Taught)
                        </p>
                    </div>
                </div>

                {/* AI Report Section */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg border border-gray-700 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] opacity-20"></div>
                     <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center">
                                    <SparklesIcon className="w-7 h-7 mr-3 text-indigo-400" />
                                    AI System Intelligence Report
                                </h3>
                                <p className="text-gray-400 text-sm mt-2 max-w-xl">
                                    Generate a comprehensive, AI-driven analysis of user activity, course performance trends, and instructor workload distribution to inform strategic decisions.
                                </p>
                            </div>
                            <button 
                                onClick={handleGenerateSystemReport}
                                disabled={generatingReport}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 flex items-center whitespace-nowrap"
                            >
                                {generatingReport ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Analyzing Data...
                                    </>
                                ) : 'Generate AI Report'}
                            </button>
                        </div>
                        
                        {systemReport && (
                            <div className="mt-8 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 max-h-[400px] overflow-y-auto custom-scrollbar">
                                <div className="prose prose-invert prose-sm max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: systemReport.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}></div>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        );
    };

    const renderUserManagement = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Directory</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage accounts, roles, and profiles.</p>
                </div>
                <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add User</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img 
                                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 dark:border-gray-600" 
                                            src={user.profilePicture || TRADITIONAL_USER_AVATAR} 
                                            alt="" 
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{user.displayName || user.name.replace(/ \(.+\)/, '')}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {user.contactEmail || <span className="text-gray-400 italic">No email</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select 
                                        value={user.role} 
                                        onChange={(e) => {
                                            const newRole = e.target.value as Role;
                                            if (window.confirm(`Change role for ${user.name} to ${newRole}?`)) {
                                                onChangeUserRole(user.id, newRole);
                                            }
                                        }}
                                        className="py-1 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-xs font-medium"
                                    >
                                        {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => setViewingUser(user)}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                        title="View & Edit Profile"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUserClick(user)} 
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        title="Delete User"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const renderCourseManagement = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Course Catalog</h3>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course Title</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructors</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {courses.map(course => (
                            <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{course.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getInstructorNames(course.instructorIds)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => setEditingCourse(course)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title="Edit Course">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteCourseClick(course)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete Course">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMessages = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Support Inbox</h3>
            {adminChats.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {adminChats.map(session => {
                        const instructor = users.find(u => u.id === session.studentId); // In admin chat, studentId holds the requester (Instructor)
                        const lastMessage = session.messages[session.messages.length - 1];
                        return (
                             <div 
                                key={session.id} 
                                onClick={() => setActiveChatSessionId(session.id)}
                                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center space-x-4">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{instructor?.name.replace(/ \(.+\)/, '') || 'Unknown Instructor'}</p>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {instructor?.role}
                                        </span>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {new Date(session.lastMessageAt).toLocaleString()}
                                  </span>
                                </div>
                                <div className="mt-4 ml-16 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg text-sm text-gray-600 dark:text-gray-300 flex justify-between items-center">
                                    <span className="truncate pr-4">
                                        <span className="font-bold text-gray-900 dark:text-white">{lastMessage.senderName}:</span> {lastMessage.content}
                                    </span>
                                    {lastMessage.senderId !== user.id && (
                                        <span className="h-2.5 w-2.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse shadow-red-500/50 shadow-sm"></span>
                                    )}
                                </div>
                              </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No messages from instructors.</p>
                </div>
            )}
        </div>
    );

    const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
    const activeSessionUser = activeSession ? users.find(u => u.id === activeSession.studentId) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Control Center</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage system resources, users, and content.</p>
          </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('analytics')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}`}
            >
                <ChartBarIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'analytics' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>Analytics & Reports</span>
            </button>
             <button
                onClick={() => setActiveTab('users')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}`}
            >
                <UserGroupIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'users' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>Users</span>
            </button>
             <button
                onClick={() => setActiveTab('courses')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'courses' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}`}
            >
                <AcademicCapIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'courses' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>Courses</span>
            </button>
            <button
                onClick={() => setActiveTab('messages')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'messages' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}`}
            >
                <ChatBubbleLeftRightIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'messages' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>Messages</span>
                {adminChats.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{adminChats.length}</span>}
            </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'courses' && renderCourseManagement()}
          {activeTab === 'messages' && renderMessages()}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all scale-100">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h3>
                      <button onClick={() => setShowAddUserModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                          <XCircleIcon className="w-6 h-6" />
                      </button>
                  </div>
                  <form onSubmit={handleAddUserSubmit} className="space-y-5">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                          <input
                              type="text"
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                          <input
                              type="text"
                              value={newUserUsername}
                              onChange={(e) => setNewUserUsername(e.target.value)}
                              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                          <input
                              type="password"
                              value={newUserPassword}
                              onChange={(e) => setNewUserPassword(e.target.value)}
                              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                          <select
                              value={newUserRole}
                              onChange={(e) => setNewUserRole(e.target.value as Role)}
                              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                          >
                              <option value={Role.Student}>Student</option>
                              <option value={Role.Instructor}>Instructor</option>
                              <option value={Role.Admin}>Admin</option>
                          </select>
                      </div>
                      {addUserError && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">{addUserError}</p>}
                      <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={() => setShowAddUserModal(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              Cancel
                          </button>
                          <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-colors">
                              Create User
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
          <EditCourseModal 
            course={editingCourse} 
            onClose={() => setEditingCourse(null)} 
            onSave={handleSaveEditedCourse} 
          />
      )}

      {/* View User Profile Modal (Admin Mode) */}
      {viewingUser && (
          <UserProfileModal 
            user={viewingUser}
            allCourses={courses}
            userProgress={progress.filter(p => p.userId === viewingUser.id)}
            onClose={() => setViewingUser(null)}
            onUpdateUser={handleUpdateUserProfile}
          />
      )}

      {/* Chat Window */}
      {activeSession && activeChatSessionId && activeSessionUser && (
           <ChatWindow
            currentUser={user}
            session={activeSession}
            courseTitle="System Administration Support"
            instructors={[activeSessionUser]} // Reusing 'instructors' prop to show who we are talking to (the Instructor)
            onSendMessage={(content) => onSendMessage(0, activeSessionUser.id, content, user.id)}
            onClose={() => setActiveChatSessionId(null)}
          />
      )}

    </div>
  );
};

export default AdminDashboard;