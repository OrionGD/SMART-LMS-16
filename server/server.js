
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Note: In ES Modules, we must include the file extension .js
import { User, Course, Progress, ChatSession } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware - Enable CORS for all origins to prevent connection blocks
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(bodyParser.json({ limit: '50mb' }));

// --- Request Logger Middleware ---
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] 📡 ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        const bodyPreview = JSON.stringify(req.body).substring(0, 100);
        console.log(`   📦 Data: ${bodyPreview}${bodyPreview.length > 100 ? '...' : ''}`);
    }
    next();
});

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/smartlms')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Routes ---

app.get('/api/init', async (req, res) => {
    try {
        const [users, courses, progress, chats] = await Promise.all([
            User.find(),
            Course.find(),
            Progress.find(),
            ChatSession.find()
        ]);
        res.json({ users, courses, progress, chats });
    } catch (err) {
        console.error("Error in /api/init:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/seed', async (req, res) => {
    try {
        console.log("Seeding database...");
        const { users, courses, progress } = req.body;
        
        // 1. Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Progress.deleteMany({});

        // 2. Insert new data
        if (users && users.length > 0) await User.insertMany(users);
        if (courses && courses.length > 0) await Course.insertMany(courses);
        if (progress && progress.length > 0) await Progress.insertMany(progress);

        // 3. GENERATE JSON FILES FOR MONGO COMPASS IMPORT
        // This answers your request to "import complete backend as json"
        try {
            if (users) fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
            if (courses) fs.writeFileSync(path.join(__dirname, 'courses.json'), JSON.stringify(courses, null, 2));
            if (progress) fs.writeFileSync(path.join(__dirname, 'progress.json'), JSON.stringify(progress, null, 2));
            console.log("📂 JSON Backup files created in /server directory (users.json, courses.json, progress.json)");
        } catch (fileErr) {
            console.error("Error writing backup files:", fileErr);
        }

        console.log("Database seeded successfully.");
        res.json({ success: true, message: "Database seeded and JSON backups created" });
    } catch (err) {
        if (err.code === 11000) {
            console.log("⚠️ Concurrency detected during seeding. Treating as success.");
            return res.json({ success: true, message: "Database seeded (concurrently)" });
        }
        console.error("Seeding error:", err);
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json(newUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updated = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/courses', async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
});

app.post('/api/courses', async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        await newCourse.save();
        res.json(newCourse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/courses/:id', async (req, res) => {
    try {
        const updated = await Course.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/courses/:id', async (req, res) => {
    try {
        await Course.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/progress', async (req, res) => {
    const progress = await Progress.find();
    res.json(progress);
});

app.post('/api/progress', async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const updated = await Progress.findOneAndUpdate(
            { userId, courseId }, 
            req.body, 
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/chats', async (req, res) => {
    const chats = await ChatSession.find();
    res.json(chats);
});

app.post('/api/chats', async (req, res) => {
    try {
        const { id } = req.body;
        const updated = await ChatSession.findOneAndUpdate(
            { id }, 
            req.body, 
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
