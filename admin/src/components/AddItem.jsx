// frontend/src/pages/AddItemPage.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';

const initialFormState = {
  name: '',
  description: '',
  category: '',
  oldPrice: '',
  price: '',
  image: null,
  preview: '',
};

const categories = [
  'Fruits',
  'Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
];

export default function AddItemPage() {
  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((f) => ({
      ...f,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const removeImage = () => {
    setFormData((f) => ({ ...f, image: null, preview: '' }));
    fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // build FormData
      const body = new FormData();
      body.append('name', formData.name);
      body.append('description', formData.description);
      body.append('category', formData.category);
      body.append('oldPrice', formData.oldPrice);
      body.append('price', formData.price);
      if (formData.image) {
        body.append('image', formData.image);
      }

      const res = await axios.post(
        'http://localhost:4000/api/items',
        body,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('Created', res.data);
      alert('Product added!');

      // reset
      setFormData(initialFormState);
      fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const { name, description, category, oldPrice, price, preview } = formData;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-emerald-800 mb-4">
          Add New Product
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          {/* Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block mb-1">Category *</label>
              <select
                name="category"
                value={category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Original Price (₹) *</label>
              <input
                type="number"
                name="oldPrice"
                value={oldPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-1">Product Image</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition"
            >
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    Click to upload image (max 5 MB)
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg flex items-center justify-center"
          >
            <FiSave className="mr-2" />
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
