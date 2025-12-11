
import { User, Course, Progress, ChatSession } from '../types';
import { INITIAL_USERS, INITIAL_COURSES, INITIAL_PROGRESS } from '../initialData';

// The API URL matches the port defined in server/server.js
const API_URL = 'http://127.0.0.1:5000/api';

/**
 * Helper: Get Data from Browser LocalStorage (Offline Mode)
 */
const getLocalData = () => {
    console.log("Mode: Offline (LocalStorage)");
    const users = JSON.parse(localStorage.getItem('smart_lms_users') || JSON.stringify(INITIAL_USERS));
    const courses = JSON.parse(localStorage.getItem('smart_lms_courses') || JSON.stringify(INITIAL_COURSES));
    const progress = JSON.parse(localStorage.getItem('smart_lms_progress') || JSON.stringify(INITIAL_PROGRESS));
    const chatSessions = JSON.parse(localStorage.getItem('smart_lms_chats') || '[]');
    return { users, courses, progress, chatSessions };
};

/**
 * Helper: Save Data to Browser LocalStorage (Offline Mode)
 */
const saveLocalItem = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Wrapper to attempt API calls.
 * If the server is down (Network Error), it throws so we can catch it and use LocalStorage.
 */
const safeFetch = async (endpoint: string, options?: RequestInit) => {
    try {
        // Set a timeout so the app doesn't hang if the server is unresponsive
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);

        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        return await res.json();
    } catch (error) {
        throw error; // Re-throw to trigger fallback
    }
};

export const dataService = {
    // Initialize: Try API first, fallback to LocalStorage
    async fetchAllData() {
        try {
            const data = await safeFetch('/init');
            console.log("Mode: Online (MongoDB Connected)");
            
            // Check if DB is empty (fresh install) and seed it if needed
            if ((!data.users || data.users.length === 0) && (!data.courses || data.courses.length === 0)) {
                console.log("Database empty. Seeding initial data...");
                await safeFetch('/seed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        users: INITIAL_USERS,
                        courses: INITIAL_COURSES,
                        progress: INITIAL_PROGRESS
                    })
                });
                const seededData = await safeFetch('/init');
                return { 
                    users: seededData.users || [], 
                    courses: seededData.courses || [], 
                    progress: seededData.progress || [], 
                    chatSessions: seededData.chats || [],
                    mode: 'online'
                };
            }
            
            return { 
                users: data.users || [], 
                courses: data.courses || [], 
                progress: data.progress || [], 
                chatSessions: data.chats || [],
                mode: 'online'
            };

        } catch (e) {
            console.warn("Backend unreachable (node server.js not running?). Switching to Offline Mode.");
            const localData = getLocalData();
            return { ...localData, mode: 'offline' };
        }
    },

    // --- Users CRUD ---
    async addUser(user: User) {
        try {
            return await safeFetch('/users', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(user) 
            });
        } catch (e) {
            const { users } = getLocalData();
            const updated = [...users, user];
            saveLocalItem('smart_lms_users', updated);
            return user;
        }
    },

    async updateUser(user: User) {
        try {
            return await safeFetch(`/users/${user.id}`, { 
                method: 'PUT', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(user) 
            });
        } catch (e) {
            const { users } = getLocalData();
            const updated = users.map((u: User) => u.id === user.id ? user : u);
            saveLocalItem('smart_lms_users', updated);
            return user;
        }
    },

    async deleteUser(userId: number) {
        try {
            return await safeFetch(`/users/${userId}`, { method: 'DELETE' });
        } catch (e) {
            const { users } = getLocalData();
            const updated = users.filter((u: User) => u.id !== userId);
            saveLocalItem('smart_lms_users', updated);
        }
    },

    // --- Courses CRUD ---
    async addCourse(course: Course) {
        try {
            return await safeFetch('/courses', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(course) 
            });
        } catch (e) {
            const { courses } = getLocalData();
            const updated = [...courses, course];
            saveLocalItem('smart_lms_courses', updated);
            return course;
        }
    },

    async updateCourse(course: Course) {
        try {
            return await safeFetch(`/courses/${course.id}`, { 
                method: 'PUT', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(course) 
            });
        } catch (e) {
            const { courses } = getLocalData();
            const updated = courses.map((c: Course) => c.id === course.id ? course : c);
            saveLocalItem('smart_lms_courses', updated);
            return course;
        }
    },

    async deleteCourse(courseId: number) {
        try {
            return await safeFetch(`/courses/${courseId}`, { method: 'DELETE' });
        } catch (e) {
            const { courses } = getLocalData();
            const updated = courses.filter((c: Course) => c.id !== courseId);
            saveLocalItem('smart_lms_courses', updated);
        }
    },

    // --- Progress CRUD ---
    async saveProgress(progressData: Progress) {
        try {
            return await safeFetch('/progress', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(progressData) 
            });
        } catch (e) {
            const { progress } = getLocalData();
            const idx = progress.findIndex((p: Progress) => p.userId === progressData.userId && p.courseId === progressData.courseId);
            let updated;
            if (idx >= 0) {
                updated = [...progress];
                updated[idx] = progressData;
            } else {
                updated = [...progress, progressData];
            }
            saveLocalItem('smart_lms_progress', updated);
            return progressData;
        }
    },

    // --- Chat CRUD ---
    async saveChatSession(session: ChatSession) {
        try {
            return await safeFetch('/chats', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(session) 
            });
        } catch (e) {
            const { chatSessions } = getLocalData();
            const idx = chatSessions.findIndex((s: ChatSession) => s.id === session.id);
            let updated;
            if (idx >= 0) {
                updated = [...chatSessions];
                updated[idx] = session;
            } else {
                updated = [...chatSessions, session];
            }
            saveLocalItem('smart_lms_chats', updated);
            return session;
        }
    }
};
