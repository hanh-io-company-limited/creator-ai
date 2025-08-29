const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting cho authentication
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // tối đa 5 lần thử đăng nhập trong 15 phút
    message: {
        error: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Temporary in-memory user storage (trong production nên dùng database)
const users = new Map();

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token không được cung cấp' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token không hợp lệ' });
        }
        req.user = user;
        next();
    });
};

// Đăng ký người dùng
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp đầy đủ thông tin: username, password, email'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        if (users.has(username)) {
            return res.status(409).json({
                error: 'Tên người dùng đã tồn tại'
            });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
        
        const user = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            preferences: {
                language: 'vi',
                theme: 'artistic',
                aiPersonality: 'creative'
            }
        };

        users.set(username, user);

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Lỗi hệ thống trong quá trình đăng ký'
        });
    }
});

// Đăng nhập
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Vui lòng cung cấp username và password'
            });
        }

        const user = users.get(username);
        if (!user) {
            return res.status(401).json({
                error: 'Tên đăng nhập hoặc mật khẩu không chính xác'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Tên đăng nhập hoặc mật khẩu không chính xác'
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Lỗi hệ thống trong quá trình đăng nhập'
        });
    }
});

// Lấy thông tin user hiện tại
router.get('/me', authenticateToken, (req, res) => {
    const user = users.get(req.user.username);
    if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
    });
});

// Cập nhật preferences
router.patch('/preferences', authenticateToken, (req, res) => {
    const user = users.get(req.user.username);
    if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const { language, theme, aiPersonality } = req.body;
    
    if (language) user.preferences.language = language;
    if (theme) user.preferences.theme = theme;
    if (aiPersonality) user.preferences.aiPersonality = aiPersonality;

    users.set(req.user.username, user);

    res.json({
        message: 'Cập nhật preferences thành công',
        preferences: user.preferences
    });
});

// Export middleware để các routes khác sử dụng
module.exports = router;
module.exports.authenticateToken = authenticateToken;