import React from 'react';
import ProductCard from './ProductCard';

const DEFAULT_CATEGORIES = [
  "All",
  "Today's Deals",
  'Electronics',
  'Fashion',
  'Home',
  'Gaming',
  'Books',
];

function ProductGrid({
  products = [],
  loading = false,
  error = null,
  categories = DEFAULT_CATEGORIES,
  selectedCategory = 'All',
  sortBy = '',
  searchQuery = '',
  onCategoryChange,
  onSortChange,
  onAddToCart,
}) {
  const [localCategory, setLocalCategory] = React.useState(selectedCategory);
  const [localSort, setLocalSort] = React.useState(sortBy);

  const handleCategoryClick = (cat) => {
    setLocalCategory(cat);
    if (onCategoryChange) onCategoryChange(cat);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setLocalSort(val);
    if (onSortChange) onSortChange(val);
  };

  if (loading) {
    return (
      <div className="products-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: 16, color: '#565959' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-section">
        <div className="loading-container">
          <p style={{ color: '#b12704', fontSize: 16 }}>Failed to load products.</p>
          <p style={{ color: '#565959', fontSize: 14, marginTop: 8 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              padding: '8px 20px',
              background: '#146eb4',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="products-section">
        <div className="section-header">
          <h2>Products</h2>
        </div>
        <div className="loading-container">
          <p style={{ color: '#565959', fontSize: 16 }}>
            {searchQuery
              ? `No products found matching "${searchQuery}".`
              : 'No products available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-section">
      <div className="section-header">
        <div className="filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={localCategory === cat ? 'active' : ''}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="filters">
          <select value={localSort} onChange={handleSortChange}>
            <option value="">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Avg. Rating</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

ProductGrid.defaultProps = {
  products: [],
  categories: DEFAULT_CATEGORIES,
  selectedCategory: 'All',
  sortBy: '',
  searchQuery: '',
};

export default ProductGrid;
