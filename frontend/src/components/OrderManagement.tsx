import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import OrderDetail from './OrderDetail';
import { Search, Filter, Package, User, Calendar, DollarSign, Eye, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import './OrderManagement.css';

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

const statusMap = {
  processing: '處理中',
  shipped: '已出貨',
  cancelled: '已取消'
};

const OrderManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/admin/orders`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();

      if (orderData.status === 'success') {
        // Debug: Log the actual response structure
        console.log('API Response:', orderData);
        console.log('First order:', orderData.data[0]);
        
        // Transform backend data to match frontend interface
        const transformedOrders = orderData.data.map((order: any) => ({
          id: order.orderNumber,
          senderName: order.sender.name,
          senderPhone: order.sender.phone,
          senderAddress: order.sender.address,
          receiverName: order.receiver.name,
          receiverPhone: order.receiver.phone,
          receiverAddress: order.receiver.address,
          items: order.orderItems?.map((item: any) => ({
            id: item._id || item.id,
            name: item.productName || item.name,
            quantity: item.quantity || 0,
            price: item.price || 0,
          })) || [],
          totalAmount: order.totalAmount || 0,
          status: order.status || 'pending',
          orderDate: order.createdAt || order.orderDate || new Date().toISOString(),
          notes: order.notes || '',
        }));
        
        setOrders(transformedOrders);
      } else {
        throw new Error(orderData.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Show empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = useCallback(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  useEffect(() => {
    filterOrders();
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, statusFilter, searchTerm, filterOrders]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${REACT_APP_API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // Update local state only after successful API call
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        // Also update selectedOrder if it's the same order being updated
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prevOrder => ({
            ...prevOrder!,
            status: newStatus
          }));
        }
      } else {
        throw new Error(result.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getTotalQuantity = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setShowOrderDetail(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white">訂單管理系統</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                <User className="w-5 h-5 text-white" />
                <span className="text-white font-medium">歡迎, {user?.username}</span>
              </div>
              <button 
                onClick={logout} 
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>登出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜尋客戶姓名或訂單編號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors duration-200"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors duration-200"
              >
                <option value="all">全部狀態</option>
                <option value="processing">處理中</option>
                <option value="shipped">已出貨</option>
                <option value="cancelled">取消</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-800">訂單列表</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-green-600">共 {filteredOrders.length} 筆訂單</span>
              </div>
            </div>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">沒有找到符合條件的訂單</h3>
              <p className="text-gray-500">請嘗試調整搜尋條件或狀態篩選</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span>訂單編號</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>寄件人</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>收件人</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">數量</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>總金額</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">狀態</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>日期</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order, index) => (
                      <tr key={order.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150"
                            onClick={() => handleViewDetails(order)}
                          >
                            <span>#{order.id}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{order.senderName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{order.receiverName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 font-medium">{getTotalQuantity(order)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-bold text-green-600">${order.totalAmount.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {statusMap[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{formatDate(order.orderDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="processing">處理中</option>
                              <option value="shipped">已出貨</option>
                              <option value="cancelled">取消</option>
                            </select>
                            <button 
                              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="w-3 h-3" />
                              <span>詳情</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>顯示第 <span className="font-semibold text-blue-600">{startIndex + 1}</span> 到 <span className="font-semibold text-blue-600">{Math.min(endIndex, filteredOrders.length)}</span> 筆，共 <span className="font-semibold text-green-600">{filteredOrders.length}</span> 筆訂單</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>上一頁</span>
                      </button>
                      
                      <div className="flex items-center">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => 
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          )
                          .map((page, index, arr) => (
                            <React.Fragment key={page}>
                              {index > 0 && arr[index - 1] !== page - 1 && (
                                <span className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300">...</span>
                              )}
                              <button
                                onClick={() => goToPage(page)}
                                className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 transition-colors duration-150 ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white border-blue-600 z-10'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))
                        }
                      </div>
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        <span>下一頁</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {showOrderDetail && selectedOrder && (
        <OrderDetail 
          order={selectedOrder} 
          onClose={closeOrderDetail}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </div>
  );
};

export default OrderManagement;