const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// admin login
const adminLogin = async (req, res) => {
    // use 'local' strategy
    // need to use session:false
    passport.authenticate('local', { session: false }, (err, admin, info) => {
        if(err || !admin) {
            return res.status(500).json({
                status:'error',
                message: 'Login failed',
                admin:admin
            });
        }

        req.login(admin, {session:false}, (err) =>{
            if(err) {
                res.send(err);
            }

            // 驗證成功, 簽發JWT
            const payload = {
                sub: admin._id, // subject
                iat: Math.floor(Date.now() / 1000) // issued at
            };

            // 簽署 token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '3h'});

            return res.json({
                admin:{
                    email:admin.email,
                },
                token: `Bearer ${token}`
            });
        });
    })(req,res,next);
}

// 創建管理員帳號
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

        // 檢查是否已存在
        const { Admin } = getModels();
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                status: 'error',
                message: 'Admin already exists'
            });
        }

        // 創建管理員
        const newAdmin = new Admin({
            email,
            password
        });

        await newAdmin.save();

        return res.status(201).json({
            status: 'success',
            message: 'Admin created successfully',
            data: {
                adminId: newAdmin._id,
                email: newAdmin.email
            }
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