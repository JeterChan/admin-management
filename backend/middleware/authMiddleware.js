// 管理員身份驗證中間件
// middleware/authMiddleware.js
const requireAdminAuth = (req, res, next) => {
    console.log('\n🔍 AUTHENTICATION MIDDLEWARE:');
    console.log('  Path:', req.path);
    console.log('  Method:', req.method);
    console.log('  Cookie Header:', req.headers.cookie || 'MISSING');
    console.log('  Session ID:', req.sessionID || 'MISSING');
    console.log('  Is Authenticated:', req.isAuthenticated());
    console.log('  User Object:', req.user ? {
        id: req.user._id,
        email: req.user.email
    } : 'MISSING');
    console.log('  Session Passport:', req.session?.passport || 'MISSING');

    // 🔥 如果沒有 cookies，這通常是前端問題
    if (!req.headers.cookie) {
        console.log('❌ NO COOKIES RECEIVED - Frontend likely not sending credentials');
        return res.status(401).json({
            status: 'error',
            message: 'No cookies received - ensure credentials are included in request'
        });
    }

    // 🔥 如果有 cookies 但沒有 session
    if (!req.sessionID) {
        console.log('❌ NO SESSION ID - Session middleware issue');
        return res.status(401).json({
            status: 'error',
            message: 'No session ID found'
        });
    }

    // 🔥 如果有 session 但沒有認證
    if (!req.isAuthenticated() || !req.user) {
        console.log('❌ NOT AUTHENTICATED - Passport authentication failed');
        console.log('  Available session data:', req.session);
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required - user not authenticated'
        });
    }

    console.log('✅ Authentication successful for:', req.user.email);
    next();
};

module.exports = {
    requireAdminAuth
};