import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCreditCard, FiTruck,  FiUser , FiPackage } from 'react-icons/fi';
import { useCart } from '../CartContext';

const CheckoutPage = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Create order object
    const order = {
      id: `ORD-${Date.now()}`,
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      },
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      date: new Date().toISOString().split('T')[0],
      total: getCartTotal(),
      status: 'Pending',
      paymentStatus: formData.paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
      paymentMethod: formData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment',
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: formData.notes
    };
    
    // Save order to localStorage (for admin)
    const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    localStorage.setItem('adminOrders', JSON.stringify([order, ...existingOrders]));
    
    // Clear cart
    clearCart();
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/confirmation/${order.id}`);
    }, 1500);
  };
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-emerald-500 text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-emerald-800 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">
            You don't have any items to checkout. Please add some products first.
          </p>
          <Link
            to="/items"
            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  const total = getCartTotal();
  const tax = total * 0.05;
  const grandTotal = total + tax;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/cart" className="inline-flex items-center text-emerald-600 hover:text-emerald-800">
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
          Checkout
        </h1>
        <p className="text-gray-600 mb-8">
          Complete your purchase with secure checkout
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-emerald-800 mb-6 flex items-center">
              <FiUser className="mr-2" />
              Customer Information
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-2 border ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    placeholder="Full address including landmark"
                  ></textarea>
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Special instructions, gate code, etc."
                  ></textarea>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                    <FiCreditCard className="mr-2" />
                    Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={handleChange}
                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-3">
                        <span className="block font-medium">Cash on Delivery (COD)</span>
                        <span className="block text-sm text-gray-500">Pay when you receive your order</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Online"
                        checked={formData.paymentMethod === 'Online'}
                        onChange={handleChange}
                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-3">
                        <span className="block font-medium">Online Payment</span>
                        <span className="block text-sm text-gray-500">Pay securely with credit/debit card or UPI</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-emerald-800 mb-6 flex items-center">
              <FiPackage className="mr-2" />
              Order Summary
            </h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Your Items ({cart.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex-shrink-0 mr-4">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-500">₹{item.price.toFixed(2)} × {item.quantity}</span>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full mt-6 py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
                    {formData.paymentMethod === 'COD' ? 'Place Order' : 'Pay Securely'}
                  </>
                )}
              </button>
              
              <p className="mt-4 text-center text-sm text-gray-500">
                By placing your order, you agree to our{' '}
                <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
          <h3 className="font-bold text-amber-800 flex items-center mb-2">
            <FiTruck className="mr-2" />
            Delivery Information
          </h3>
          <p className="text-amber-700">
            We deliver within 30-45 minutes in your area. Orders placed after 9 PM will be delivered the next morning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;