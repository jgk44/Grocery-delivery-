import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';

const initialFormState = {
  name: '',
  description: '',
  category: '',
  oldPrice: '',
  price: '',
  image: null,
  preview: ''
};

const AddItemPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData(prev => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file)
    }));
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null, preview: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare form data to log
    const formDataToLog = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      oldPrice: formData.oldPrice,
      price: formData.price,
      image: formData.image,
    };

    // Log all form data to console
    console.log('Form submitted with data:', formDataToLog);

    // Reset form
    setFormData(initialFormState);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const categories = [
    "Fruits", "Vegetables", "Dairy & Eggs", 
    "Meat & Seafood", "Bakery", "Pantry"
  ];

  const { name, description, category, oldPrice, price, preview } = formData;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            Add New Product
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Fill out the form below to add a new product to your inventory
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Organic Apples"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Brief description..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  name="oldPrice"
                  value={oldPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. 199"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. 149"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <div className="relative">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-48 md:h-64 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="p-6 md:p-8">
                    <FiUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                    <p className="text-gray-500 mb-1">Click to upload image</p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG up to 2MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center transition-colors"
              >
                <FiSave className="mr-2" />
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemPage;