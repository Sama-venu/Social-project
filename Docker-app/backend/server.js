const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'devops-practice-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-db',
    user: process.env.DB_USER || 'instagram_user',
    password: process.env.DB_PASSWORD || 'insta123',
    database: process.env.DB_NAME || 'instagram_clone',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// API Routes

// Register user
app.post('/api/register', async (req, res) => {
    const { username, email, password, fullname } = req.body;
    
    if (!username || !email || !password || !fullname) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = 'INSERT INTO users (username, email, password, fullname) VALUES (?, ?, ?, ?)';
        db.query(query, [username, email, hashedPassword, fullname], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(query, [username, username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                email: user.email
            }
        });
    });
});

// Check session
app.get('/api/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const query = 'SELECT id, username, email, fullname, created_at FROM users WHERE id = ?';
    db.query(query, [req.session.userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'User not found' });
        res.json({ user: results[0] });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

// Get all posts (simple feed)
app.get('/api/posts', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const query = `
        SELECT p.*, u.username, u.fullname 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC 
        LIMIT 20
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ posts: results });
    });
});

// Create a post
app.post('/api/posts', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { image_url, caption } = req.body;
    if (!image_url) {
        return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const query = 'INSERT INTO posts (user_id, image_url, caption) VALUES (?, ?, ?)';
    db.query(query, [req.session.userId, image_url, caption || ''], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ message: 'Post created', postId: result.insertId });
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
