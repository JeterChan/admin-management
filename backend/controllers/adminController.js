const { getModels } = require('../models');

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

module.exports = {
    getAllOrders,
    updateOrderStatus
};