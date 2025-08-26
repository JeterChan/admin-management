const { getModels } = require('../models');
const bcrypt = require('bcrypt');
const passport = require('passport');

// 回傳所有訂單
const getAllOrders = async (req, res) => {
    try {
        const { Order } = getModels();
        const orders = await Order.find()
            .populate('orderItems', 'productName price quantity subtotal')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: 'success',
            data: orders
        });
    } catch(error) {
        console.error('❌ [Admin] Error fetching orders:', error);
        return res.status(500).json({
            status: 'error',
            message: 'get orders failed'
        });
    }
};

// 更新訂單狀態
const updateOrderStatus = async (req, res) => {
    // api/admin/{orderId}/status -> PATCH method
    const { orderId } = req.params; // orderNumber
    const { status } = req.body;

    try {
        // get order by orderNumber
        const { Order } = getModels();
        const orderNeedToUpdate = await Order.findOne({ orderNumber: orderId });

        if(!orderNeedToUpdate) {
            return res.status(404).json({
                status:'fail',
                message:'Order not found'
            });
        }

        // if order exists, update status
        orderNeedToUpdate.status = status;

        await orderNeedToUpdate.save();
        return res.status(200).json({
            status: 'success',
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('❌ [Admin] Error updating order status:', error);
        return res.status(500).json({
            status: false,
            message: 'Update order status failed'
        });
    }
}

// 管理員登入驗證 - 使用 Passport LocalStrategy
const adminLogin = (req, res, next) => {
    passport.authenticate('local', (err, admin, info) => {
        if (err) {
            console.error('❌ [Admin] Login error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Login failed'
            });
        }

        if (!admin) {
            return res.status(401).json({
                status: 'error',
                message: info?.message || 'Invalid credentials'
            });
        }

        console.log('✅ Passport authentication successful:', admin.email);

        // 使用 Passport 登入並建立 session
        req.logIn(admin, (err) => {
            if (err) {
                console.error('❌ [Admin] Login session error:', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Login failed'
                });
            }

            req.session.adminId = admin._id.toString();
            req.session.email = admin.email;

            console.log('✅ req.logIn successful');
            console.log('🔍 After logIn:');
            console.log('  Session ID:', req.sessionID);
            console.log('  Is Authenticated:', req.isAuthenticated());
            console.log('  User:', req.user ? req.user.email : 'null');
            console.log('  Session Passport:', req.session.passport);

            req.session.save((err) => {
                if(err) {
                    console.error('❌ [Admin] Session save error:', err);
                    return res.status(500).json({
                        status:'error',
                        message:'Session save failed'
                    });
                }

                console.log('✅ Session saved successfully');
                console.log('🍪 Response headers about to be sent:');
                console.log('  Set-Cookie header:', res.getHeaders()['set-cookie']);

                res.json({
                    status: 'success',
                    message: 'Login successful',
                    admin: {
                        id: admin._id,
                        email: admin.email
                    },
                    debug: {
                        sessionID: req.sessionID,
                        isAuthenticated: req.isAuthenticated(),
                        hasUser: !!req.user,
                        sessionPassport: req.session.passport
                    }
                });
            });
        })
    })(req, res, next);
};

// 管理員登出
const adminLogout = async (req, res) => {
    try {
        // 使用 Passport 登出
        req.logout((err) => {
            if (err) {
                console.error('❌ [Admin] Passport logout error:', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Logout failed'
                });
            }
            
            // 銷毀 session
            req.session.destroy((err) => {
                if (err) {
                    console.error('❌ [Admin] Session destroy error:', err);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Logout failed'
                    });
                }
                
                res.clearCookie('admin.sid');
                return res.status(200).json({
                    status: 'success',
                    message: 'Logout successful'
                });
            });
        });
    } catch (error) {
        console.error('❌ [Admin] Logout error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Logout failed'
        });
    }
};

// 創建管理員帳號 (用於初始化)
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
    getAllOrders,
    updateOrderStatus,
    adminLogin,
    adminLogout,
    createAdmin
};