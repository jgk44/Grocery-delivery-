import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaChevronRight, FaMinus, FaPlus, FaThList } from "react-icons/fa";
import { categories } from "../assets/dummyData";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import BannerHome from "../components/BannerHome";
import { itemsHomeStyles } from "../assets/dummyStyles.js";

import axios from 'axios'

const ItemsHome = () => {
  const [products, setProducts] = useState([]);
  // 1) Initialize from localStorage (or "All" if nothing is stored)
  const [activeCategory, setActiveCategory] = useState(() =>
    localStorage.getItem("activeCategory") || "All"
  );

  // 2) Whenever activeCategory changes, save it
  useEffect(() => {
    localStorage.setItem("activeCategory", activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/items")
      .then(res => {
        console.log("🔍 API returned:", res.data);
        setProducts(res.data);
      })
      .catch(err => console.error("API error:", err));
  }, []);

  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced search function
  const productMatchesSearch = (product, term) => {
    if (!term) return true;

    // Remove extra spaces and convert to lowercase
    const cleanTerm = term.trim().toLowerCase();

    // Split into individual words
    const searchWords = cleanTerm.split(/\s+/);

    // Check if all search words appear in the product name
    return searchWords.every(word =>
      product.name.toLowerCase().includes(word)
    );
  };

  // FIXED: Search across ALL products when search term exists
  const searchedProducts = searchTerm
    ? products.filter(product =>
      productMatchesSearch(product, searchTerm))
    : (activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory));

  const getQuantity = (productId) => {
    const item = cart.find((ci) => ci.id === productId);
    return item ? item.quantity : 0;
  };

  const handleIncrease = (product) => addToCart(product, 1);
  const handleDecrease = (product) => {
    const qty = getQuantity(product.id);
    if (qty > 1) updateQuantity(product.id, qty - 1);
    else removeFromCart(product.id);
  };

  const redirectToItemsPage = () => {
    navigate("/items", { state: { category: activeCategory } });
  };

  // Handle search from banner
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Create sidebar categories with "All Items" as first item
  const sidebarCategories = [
    {
      name: "All Items",
      icon: <FaThList className="text-lg" />,
      value: "All"
    },
    ...categories
  ];

  return (
    <div className={itemsHomeStyles.page}>
      {/* Banner at the top */}
      <BannerHome onSearch={handleSearch} />

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar - hidden on small devices */}
        <aside className={itemsHomeStyles.sidebar}>
          <div className={itemsHomeStyles.sidebarHeader}>
            <h1
              className={itemsHomeStyles.sidebarTitle}
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              FreshCart
            </h1>
            <div className={itemsHomeStyles.sidebarDivider} />
          </div>

          <div className={itemsHomeStyles.categoryList}>
            <ul className="space-y-3">
              {sidebarCategories.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => {
                      setActiveCategory(category.value || category.name);
                      setSearchTerm(''); // Clear search when changing category
                    }}
                    className={`${itemsHomeStyles.categoryItem} ${(activeCategory === (category.value || category.name)) && !searchTerm
                      ? itemsHomeStyles.activeCategory
                      : itemsHomeStyles.inactiveCategory
                      }`}
                  >
                    <div className={itemsHomeStyles.categoryIcon}>
                      {category.icon}
                    </div>
                    <span className={itemsHomeStyles.categoryName}>{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className={itemsHomeStyles.mainContent}>
          {/* Mobile Category Scroll */}
          <div className={itemsHomeStyles.mobileCategories}>
            <div className="flex space-x-4">
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.value || cat.name);
                    setSearchTerm(''); // Clear search when changing category
                  }}
                  className={`${itemsHomeStyles.mobileCategoryItem} ${activeCategory === (cat.value || cat.name) && !searchTerm
                    ? itemsHomeStyles.activeMobileCategory
                    : itemsHomeStyles.inactiveMobileCategory
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Header - Added */}
          {searchTerm && (
            <div className={itemsHomeStyles.searchResults}>
              <div className="flex items-center justify-center">
                <span className="text-emerald-700 font-medium">
                  Search results for: <span className="font-bold">"{searchTerm}"</span>
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-4 text-emerald-500 hover:text-emerald-700 p-1 rounded-full transition-colors"
                >
                  <span className="text-sm bg-emerald-100 px-2 py-1 rounded-full">Clear</span>
                </button>
              </div>
            </div>
          )}

          {/* Section Title - Updated to show correct title during search */}
          <div className="text-center mb-6">
            <h2
              className={itemsHomeStyles.sectionTitle}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {searchTerm
                ? "Search Results"
                : (activeCategory === "All"
                  ? "Featured Products"
                  : `Best ${activeCategory}`)
              }
            </h2>
            <div className={itemsHomeStyles.sectionDivider} />
          </div>

          {/* Products Grid */}
          <div className={itemsHomeStyles.productsGrid}>
            {searchedProducts.length > 0 ? (
              searchedProducts.map((product) => {
                const qty = getQuantity(product.id);
                return (
                  <div
                    key={product._id}
                    className={itemsHomeStyles.productCard}
                  >
                    <div className={itemsHomeStyles.imageContainer}>
                      <img
                        src={`http://localhost:4000${product.imageUrl}`}
                        alt={product.name}
                        className={itemsHomeStyles.productImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.innerHTML = `
                            <div class="flex items-center justify-center w-full h-full bg-gray-200">
                              <span class="text-gray-500 text-sm">No Image</span>
                            </div>`;
                        }}
                      />
                    </div>

                    <div className={itemsHomeStyles.productContent}>
                      <h3 className={itemsHomeStyles.productTitle}>
                        {product.name}
                      </h3>
                      <div className={itemsHomeStyles.priceContainer}>
                        <div>
                          <p className={itemsHomeStyles.currentPrice}>
                            ₹{product.price.toFixed(2)}
                          </p>
                          <span className={itemsHomeStyles.oldPrice}>
                            ₹{(product.price * 1.2).toFixed(2)}
                          </span>
                        </div>

                        {/* Add / Quantity Controls */}
                        {qty === 0 ? (
                          <button
                            onClick={() => handleIncrease(product)}
                            className={itemsHomeStyles.addButton}
                          >
                            <FaShoppingCart className="mr-2" />
                            Add
                          </button>
                        ) : (
                          <div className={itemsHomeStyles.quantityControls}>
                            <button
                              onClick={() => handleDecrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaMinus />
                            </button>
                            <span className="font-bold">{qty}</span>
                            <button
                              onClick={() => handleIncrease(product)}
                              className={itemsHomeStyles.quantityButton}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={itemsHomeStyles.noProducts}>
                <div className={itemsHomeStyles.noProductsText}>
                  No products found
                </div>
                <button
                  onClick={() => setSearchTerm('')}
                  className={itemsHomeStyles.clearSearchButton}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* View All Button - Hidden when showing search results */}
          {!searchTerm && (
            <div className="text-center">
              <button
                onClick={redirectToItemsPage}
                className={itemsHomeStyles.viewAllButton}
              >
                View All {activeCategory === "All" ? "Products" : activeCategory}
                <FaChevronRight className="ml-3" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ItemsHome;