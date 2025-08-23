import React from 'react';
import { X, User, Phone, MapPin, Package, Calendar } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingFee?: number;
  totalAmount: number;
  status: 'processing' | 'shipped' | 'cancelled';
  orderDate: string;
  notes: string;
}

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
}

const statusMap = {
  processing: '處理中',
  shipped: '已出貨',
  cancelled: '已取消'
};

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose, onStatusUpdate }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'shipped': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTotalQuantity = () => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = (item: OrderItem) => {
    return item.quantity * item.price;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">訂單詳情 - #{order.id}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-bold text-gray-600">{formatDate(order.orderDate)}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(order.status)}`}>
                {statusMap[order.status] || order.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text font-bold text-gray-600">{getTotalQuantity()} 箱</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">${order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sender and Receiver Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Block */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                寄件人資訊
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{order.senderName}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{order.senderPhone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{order.senderAddress}</span>
                </div>
              </div>
            </div>

            {/* Receiver Block */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                收件人資訊
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{order.receiverName}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{order.receiverPhone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{order.receiverAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                商品明細
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">價錢</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">數量</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">小計</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">${item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">${getSubtotal(item).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">總計:</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">${order.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <label htmlFor="status-select" className="text-sm font-medium text-gray-700">更新訂單狀態:</label>
              <select
                id="status-select"
                value={order.status}
                onChange={(e) => onStatusUpdate(order.id, e.target.value as Order['status'])}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="processing">處理中</option>
                <option value="shipped">已出貨</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;