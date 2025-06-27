import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Store only id and quantity in localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // All product metadata from backend
  const [products, setProducts] = useState([]);

  // Fetch products once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/items');
        const data = response.data;
        // Normalize array
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];
        console.log('Fetched products:', list);
        setProducts(list);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, []);

  // Persist cartItems (id + quantity) to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Derive full cart entries with metadata
  const cart = cartItems.map(ci => {
    const prod = (products || []).find(p => p._id === ci.id || p.id === ci.id) || {};
    return {
      id: ci.id,
      quantity: ci.quantity,
      name: prod.name || 'Unknown',
      price: prod.price || 0,
      // build full URL if needed
      image: prod.imageUrl
        ? prod.imageUrl.startsWith('http')
          ? prod.imageUrl
          : `http://localhost:4000${prod.imageUrl}`
        : null,
    };
  });

  // Helpers: accept id or item object
  const addToCart = (itemOrId, quantity = 1) => {
    const id = itemOrId && typeof itemOrId === 'object' ? (itemOrId._id || itemOrId.id) : itemOrId;
    if (!id) return;
    setCartItems(prev => {
      const exists = prev.find(ci => ci.id === id);
      if (exists) {
        return prev.map(ci =>
          ci.id === id ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      }
      return [...prev, { id, quantity }];
    });
  };

  const removeFromCart = id => {
    setCartItems(prev => prev.filter(ci => ci.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev =>
      prev.map(ci => (ci.id === id ? { ...ci, quantity: newQty } : ci))
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () =>
    cart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);

  const cartCount = cart.reduce((count, ci) => count + ci.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        products,
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
