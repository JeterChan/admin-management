// 管理員身份驗證中間件
const requireAdminAuth = (req, res, next) => {
    // 檢查 session 中是否有 adminId
    if (!req.session || !req.session.adminId) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
    }

    // 檢查 session 是否有效
    if (!req.session.email) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid session'
        });
    }

    // 如果驗證通過，繼續執行下一個中間件或路由處理器
    next();
};

module.exports = {
    requireAdminAuth
};