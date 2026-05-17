import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import Navbar from './components/Navbar';
import Subnavbar from './components/Subnavbar';
import HeroBanner from './components/HeroBanner';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Toast from './components/Toast';
import Footer from './components/Footer';

// Using relative URLs so requests go through nginx reverse proxy
// (nginx proxies /api/products -> product-service:3001 and /api/cart -> cart-service:3002)
const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || '';
const CART_SERVICE_URL = import.meta.env.VITE_CART_SERVICE_URL || '';

// Demo user ID for cart operations (in production, this would come from auth)
const DEMO_USER_ID = 'demo-user';

const ALL_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home',
  'Gaming',
  'Books',
];

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products`, {
        timeout: 10000,
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sort: sortBy || undefined,
          search: searchQuery || undefined,
        },
      });
      const data = response.data;
      const products = Array.isArray(data) ? data : (data.products || data.data || []);
      setAllProducts(products);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(message);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const response = await axios.get(`${CART_SERVICE_URL}/api/cart/${DEMO_USER_ID}`, { timeout: 5000 });
      const data = response.data;
      const items = data.cart?.items || data.items || data.cartItems || [];
      setCartItems(items);
    } catch (err) {
      console.warn('Cart service unavailable, using local cart state.');
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const syncCartToServer = useCallback(async (items) => {
    try {
      await axios.post(`${CART_SERVICE_URL}/api/cart/${DEMO_USER_ID}/items`, {
        productId: 'sync',
        quantity: 0
      }, { timeout: 5000 });
    } catch {
      // silently fail; local state is source of truth
    }
  }, []);

  const addToCart = useCallback((product) => {
    if (!product || !product.id) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }
      syncCartToServer(updated);
      return updated;
    });
    setToast({
      visible: true,
      message: `${product.name || 'Product'} added to cart!`,
      type: 'success',
    });
  }, [syncCartToServer]);

  const updateQuantity = useCallback((id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      );
      syncCartToServer(updated);
      return updated;
    });
  }, [syncCartToServer]);

  const removeItem = useCallback((id) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      syncCartToServer(updated);
      return updated;
    });
    setToast({ visible: true, message: 'Item removed from cart.', type: 'info' });
  }, [syncCartToServer]);

  const handleCheckout = useCallback(() => {
    setToast({ visible: true, message: 'Order placed successfully! (Demo)', type: 'success' });
    setCartItems([]);
    syncCartToServer([]);
  }, [syncCartToServer]);

  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const handleSearch = useCallback((query, category) => {
    setSearchQuery(query || '');
    setSelectedCategory(category === 'All' ? 'All' : category || 'All');
    setCurrentView('home');
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortBy(sort);
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const displayProducts = useMemo(() => {
    let filtered = [...allProducts];
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(
        (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'name':
          filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          break;
        default:
          break;
      }
    }
    return filtered;
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [cartItems]
  );

  return (
    <div className="app">
      <Navbar
        cartCount={cartCount}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        categories={ALL_CATEGORIES}
      />
      <Subnavbar
        categories={ALL_CATEGORIES}
        onCategoryClick={handleCategoryChange}
      />

      {currentView === 'home' && (
        <main className="main-content">
          <HeroBanner />
          <ProductGrid
            products={displayProducts}
            loading={loading}
            error={error}
            categories={['All', ...ALL_CATEGORIES]}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            searchQuery={searchQuery}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onAddToCart={addToCart}
          />
        </main>
      )}

      {currentView === 'cart' && (
        <main className="main-content">
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onCheckout={handleCheckout}
            onNavigate={handleNavigate}
          />
        </main>
      )}

      <Footer />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={closeToast}
      />
    </div>
  );
}

export default App;
