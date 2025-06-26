// backend/middleware/auth.js

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export default async function authMiddleware(req, res, next) {
    // 1. Try cookie first, then Authorization header
    const token =
        // If you're using cookie-parser middleware
        req.cookies?.token ||
        // Fallback to header
        (req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null);

    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: 'Not authorized – token missing' });
    }

    try {
        // 2. Verify signature & expiration
        const payload = jwt.verify(token, JWT_SECRET);

        // 3. Load fresh user data (minus password)
        const user = await User.findById(payload.id).select('-password');
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: 'User no longer exists' });
        }

        // 4. Attach to request
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        const message =
            err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        res.status(401).json({ success: false, message });
    }
}
