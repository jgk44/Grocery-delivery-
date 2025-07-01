// src/components/AdminNavbar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiPackage, FiPlusCircle, FiShoppingBag,  FiX, FiMenu } from 'react-icons/fi';

const AdminNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-emerald-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-lg mr-3">
              <FiPackage className="text-emerald-800 text-xl" />
            </div>
            <h1 className="text-xl font-bold">
              <span className="text-emerald-300">Rush Basket</span> Admin
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1">
            <NavLink 
              to="/admin/add-item" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-700 text-white' 
                    : 'text-emerald-200 hover:bg-emerald-700/50'
                }`
              }
            >
              <FiPlusCircle className="mr-2" />
              Add Products
            </NavLink>
            
            <NavLink 
              to="/admin/list-items" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-700 text-white' 
                    : 'text-emerald-200 hover:bg-emerald-700/50'
                }`
              }
            >
              <FiPackage className="mr-2" />
              List Items
            </NavLink>
            
            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-700 text-white' 
                    : 'text-emerald-200 hover:bg-emerald-700/50'
                }`
              }
            >
              <FiShoppingBag className="mr-2" />
              Orders
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-md hover:bg-emerald-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <NavLink 
            to="/admin/add-item" 
            onClick={closeMobileMenu}
            className={({ isActive }) => 
              `flex items-center px-3 py-3 rounded-lg mx-2 transition-colors ${
                isActive 
                  ? 'bg-emerald-700 text-white' 
                  : 'text-emerald-200 hover:bg-emerald-700/50'
              }`
            }
          >
            <FiPlusCircle className="mr-3 ml-1" size={20} />
            Manage Products
          </NavLink>
          
          <NavLink 
            to="/admin/list-items" 
            onClick={closeMobileMenu}
            className={({ isActive }) => 
              `flex items-center px-3 py-3 rounded-lg mx-2 transition-colors ${
                isActive 
                  ? 'bg-emerald-700 text-white' 
                  : 'text-emerald-200 hover:bg-emerald-700/50'
              }`
            }
          >
            <FiPackage className="mr-3 ml-1" size={20} />
            Inventory
          </NavLink>
          
          <NavLink 
            to="/admin/orders" 
            onClick={closeMobileMenu}
            className={({ isActive }) => 
              `flex items-center px-3 py-3 rounded-lg mx-2 transition-colors ${
                isActive 
                  ? 'bg-emerald-700 text-white' 
                  : 'text-emerald-200 hover:bg-emerald-700/50'
              }`
            }
          >
            <FiShoppingBag className="mr-3 ml-1" size={20} />
            Orders
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;