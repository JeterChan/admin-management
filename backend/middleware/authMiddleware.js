// 管理員身份驗證中間件
const requireAdminAuth = (req, res, next) => {
    if(req.isAuthenticated() && req.user) {
        return next();
    }

    return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
    });
};

module.exports = {
    requireAdminAuth
};