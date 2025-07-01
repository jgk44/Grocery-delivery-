// src/pages/admin/ListItemsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiFilter,
} from 'react-icons/fi';

const StatsCard = ({ icon: Icon, color, border, label, value }) => (
  <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${border}`}>
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-full mr-4`}>
        <Icon className={`${color.replace('bg-', 'text-')} text-xl`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default function ListItemsPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch items and extract categories
  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/items');
        const data = response.data;

        const withUrls = data.map(item => ({
          ...item,
          imageUrl: item.imageUrl
            ? `http://localhost:4000${item.imageUrl}`
            : null,
        }));

        // Extract unique categories
        const itemCategories = data.map(item => item.category);
        const uniqueCategories = ['All', ...new Set(itemCategories)];
        
        setCategories(uniqueCategories);
        setItems(withUrls);
        setFilteredItems(withUrls);
      } catch (err) {
        console.error('Failed to load items:', err);
        alert('Could not load products. See console for details.');
      }
    };

    loadItems();
  }, []);

  // Filter items when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, items]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
  
    try {
      await axios.delete(`http://localhost:4000/api/items/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      setFilteredItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error('Delete failed', err.response?.status, err.response?.data);
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };  

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            Product Inventory
          </h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <StatsCard
            icon={FiPackage}
            color="bg-emerald-100"
            border="border-emerald-500"
            label="Total Products"
            value={items.length}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-emerald-800">
              Products ({filteredItems.length})
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
           
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiPackage className="text-gray-500 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No products found
              </h3>
              <p className="text-gray-500">
                {selectedCategory === 'All'
                  ? 'Try adding a new product.'
                  : `No products in ${selectedCategory} category.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">
                      Product
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">
                      Category
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">
                      Price
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg mr-3"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-emerald-600">
                          ₹{item.price.toFixed(2)}
                        </div>
                        {item.oldPrice > item.price && (
                          <div className="text-xs text-gray-400 line-through">
                            ₹{item.oldPrice.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              window.location.assign(
                                `/admin/add-item?edit=${item._id}`
                              )
                            }
                            className="text-gray-500 hover:text-emerald-600"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}