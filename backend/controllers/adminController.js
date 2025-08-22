const { getModels } = require('../models');

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

module.exports = {
    getAllOrders
};