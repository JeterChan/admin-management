const jwt = require('jsonwebtoken');
require('dotenv').config();

// admin login - 透過核心服務 API 驗證
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 驗證必填欄位
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        // TODO: 呼叫核心服務的 API 來驗證管理員登入
        // const coreServiceResponse = await fetch(`${process.env.CORE_SERVICE_URL}/api/admin/login`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ email, password })
        // });
        
        // const authResult = await coreServiceResponse.json();
        
        // if (!coreServiceResponse.ok) {
        //     return res.status(401).json({
        //         status: 'error',
        //         message: 'Invalid credentials'
        //     });
        // }

        // 暫時的硬編碼驗證 (僅供開發測試使用)
        // 在實際環境中，這應該替換為核心服務 API 呼叫
        if (email === 'admin@test.com' && password === 'password123') {
            // 驗證成功, 簽發JWT
            const payload = {
                sub: 'admin-id-123', // subject (應該從核心服務取得)
                email: email,
                iat: Math.floor(Date.now() / 1000) // issued at
            };

            // 簽署 token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '3h'});

            return res.json({
                status:'success',
                admin:{
                    id: 'admin-id-123',
                    email: email,
                },
                token: token
            });
        } else {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

    } catch (error) {
        console.error('❌ [Admin] Login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
}

// 創建管理員帳號 - 透過核心服務 API
const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 驗證必填欄位
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Admin email and password are required'
            });
        }

        // TODO: 呼叫核心服務的 API 來創建管理員
        // const coreServiceResponse = await fetch(`${process.env.CORE_SERVICE_URL}/api/admin/create`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ email, password })
        // });
        
        // const result = await coreServiceResponse.json();
        // return res.status(coreServiceResponse.status).json(result);

        // 暫時返回訊息，直到核心服務 API 完成
        return res.status(501).json({
            status: 'error',
            message: 'Create admin API will be connected to core service'
        });

    } catch (error) {
        console.error('❌ [Admin] Create admin error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Create admin failed'
        });
    }
};

module.exports = {
    adminLogin,
    createAdmin
}