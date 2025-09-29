// 回傳所有訂單 - 從核心服務 API 取得
const getAllOrders = async (req, res) => {
    try {
        // TODO: 呼叫核心服務的 API 來取得訂單資料
        // const coreServiceResponse = await fetch(`${process.env.CORE_SERVICE_URL}/api/orders`, {
        //     headers: {
        //         'Authorization': req.headers.authorization,
        //         'Content-Type': 'application/json'
        //     }
        // });
        // const orders = await coreServiceResponse.json();

        // 暫時返回空陣列，直到核心服務 API 完成
        return res.status(200).json({
            status: 'success',
            data: [],
            message: 'Orders API will be connected to core service'
        });
    } catch(error) {
        console.error('❌ [Admin] Error fetching orders:', error);
        return res.status(500).json({
            status: 'error',
            message: 'get orders failed'
        });
    }
};

// 更新訂單狀態 - 透過核心服務 API
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        // TODO: 呼叫核心服務的 API 來更新訂單狀態
        // const coreServiceResponse = await fetch(`${process.env.CORE_SERVICE_URL}/api/orders/${orderId}/status`, {
        //     method: 'PATCH',
        //     headers: {
        //         'Authorization': req.headers.authorization,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ status })
        // });
        
        // const result = await coreServiceResponse.json();
        // return res.status(coreServiceResponse.status).json(result);

        // 暫時返回成功訊息，直到核心服務 API 完成
        return res.status(200).json({
            status: 'success',
            message: 'Order status update API will be connected to core service'
        });
    } catch (error) {
        console.error('❌ [Admin] Error updating order status:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Update order status failed'
        });
    }
}

// 檢查認證狀態 - JWT validation happens in passport middleware
const checkAuth = async (req, res) => {
    // If we reach here, the JWT middleware has already validated the token
    // req.user is set by passport JWT strategy
    return res.status(200).json({
        status: 'success',
        isAuthenticated: true,
        admin: {
            id: req.user._id,
            email: req.user.email
        }
    });
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
    checkAuth
};