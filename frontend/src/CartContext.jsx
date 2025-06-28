// src/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

// Utility to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Normalize backend cart items into a consistent shape
const normalizeItems = (rawItems = []) => {
  return rawItems.map(item => {
    return {
      id:
        item.productId ||
        item._id ||
        (item.product && item.product._id),  // use nested product._id if needed
      quantity: item.quantity,
      price: item.price,
      ...item,
    };
  }).filter(item => item.id != null);
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart from backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:4000/api/cart',
          getAuthHeader()
        );

        // Normalize into an array
        let rawItems = [];
        if (Array.isArray(data)) {
          rawItems = data;
        } else if (Array.isArray(data.items)) {
          rawItems = data.items;
        } else if (data.cart && Array.isArray(data.cart.items)) {
          rawItems = data.cart.items;
        } else {
          console.warn('Unexpected cart response:', data);
        }

        const items = normalizeItems(rawItems);
        setCart(normalizeItems(items));
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Helper to refresh cart
  const refreshCart = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:4000/api/cart',
        getAuthHeader()
      );
      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
        ? data.items
        : [];
      const items = normalizeItems(rawItems);
      setCart(normalizeItems(items));
    } catch (err) {
      console.error('Error refreshing cart:', err);
    }
  };

  // Add a product
  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        'http://localhost:4000/api/cart',
        { productId, quantity },
        getAuthHeader()
      );
      await refreshCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put(
        `http://localhost:4000/api/cart/${productId}`,
        { quantity },
        getAuthHeader()
      );
      await refreshCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  // Remove a line item
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/cart/${productId}`,
        getAuthHeader()
      );
      await refreshCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  // Clear all
  const clearCart = async () => {
    try {
      await axios.post(
        'http://localhost:4000/api/cart/clear',
        {},
        getAuthHeader()
      );
      setCart([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  // Totals
  const getCartTotal = () =>
    cart.reduce((sum, { price, quantity }) => sum + price * quantity, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
