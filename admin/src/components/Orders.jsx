import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiDollarSign, FiTruck, FiPackage, FiCreditCard, FiUser, FiMapPin, FiPhone, FiMail, FiEdit } from 'react-icons/fi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Fetch orders from backend
  // 🌐 Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('http://localhost:4000/api/orders');
      console.log('🖼️ fetched orders:', data);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.customer.name.toLowerCase().includes(term) ||
        order.customer.phone.includes(term) ||
        (order.customer.email && order.customer.email.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'All') {
      result = result.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Update order status on backend
  // 🌐 Update order status on backend
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:4000/api/orders/${orderId}`,
        { status: newStatus }
      );
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setFilteredOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
    }
    catch (error) {
      console.error('Error updating order status:', error);
    }
  };


  const cancelOrder = (orderId) => {
    updateOrderStatus(orderId, 'Cancelled');
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">
            View, manage, and track customer orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiPackage className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-amber-500">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <FiTruck className="text-amber-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Processing</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'Processing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <FiCheck className="text-emerald-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Delivered</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'Delivered').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiDollarSign className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pending Payment</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.paymentStatus === 'Unpaid').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Order ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Items</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Total</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Payment</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiPackage className="text-gray-400 text-4xl mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                        <p className="text-gray-500">Try changing your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-emerald-700">
                        {order.orderId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {order.items.length} items
                      </td>
                      <td className="py-4 px-4 font-medium">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'Processing' || order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          order.paymentStatus === 'COD' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-1 px-3 rounded-full transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className={`text-sm bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded-full transition-colors ${order.status === 'Cancelled' || order.status === 'Delivered' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-800">
                  Order Details: {selectedOrder._id}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                Ordered on {selectedOrder.date} • Delivery scheduled for {selectedOrder.deliveryDate}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  {/* Customer Info */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                      <FiUser className="mr-2" />
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <div className="font-medium">{selectedOrder.customer.name}</div>
                        {/* In the Customer Information section of the modal */}
                        <div className="text-gray-600 flex items-center mt-1">
                          <FiMail className="mr-2 flex-shrink-0" />
                          {selectedOrder.customer.email || 'No email provided'}
                        </div>
                        <div className="text-gray-600 flex items-center mt-1">
                          <FiPhone className="mr-2 flex-shrink-0" />
                          {selectedOrder.customer.phone}
                        </div>
                      </div>
                      <div className="flex items-start mt-3">
                        <FiMapPin className="text-gray-500 mr-2 mt-1 flex-shrink-0" />
                        <div className="text-gray-600">{selectedOrder.customer.address}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                        <FiEdit className="mr-2" />
                        Delivery Notes
                      </h3>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-gray-700">{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Status Controls */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-emerald-800 mb-4">
                      Update Order Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Status
                        </label>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setSelectedOrder({ ...selectedOrder, status: newStatus });
                            updateOrderStatus(selectedOrder._id, newStatus);  // ← use _id here
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {statusOptions.filter(o => o !== 'All').map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* Order Summary */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                      <FiPackage className="mr-2" />
                      Order Summary
                    </h3>
                    <div className="border border-gray-200 rounded-lg">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={item._id || index}
                          className={`flex items-center p-4 ${index !== selectedOrder.items.length - 1 ? 'border-b' : ''}`}
                        >
                          {item.imageUrl ? (
                            <img
                              src={`http://localhost:4000${item.imageUrl}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg mr-4"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                          )}
                          <div className="flex-grow">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-600">₹{item.price.toFixed(2)} × {item.quantity}</div>
                          </div>
                          <div className="font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}

                      {/* Order Totals */}
                      <div className="p-4 bg-gray-50">
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₹{selectedOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium text-emerald-600">Free</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Tax (5%)</span>
                          <span className="font-medium">₹{(selectedOrder.total * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-4 mt-2 border-t border-gray-200">
                          <span className="text-lg font-bold">Total</span>
                          <span className="text-lg font-bold text-emerald-700">
                            ₹{(selectedOrder.total * 1.05).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                      <FiCreditCard className="mr-2" />
                      Payment Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          selectedOrder.paymentStatus === 'COD' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;