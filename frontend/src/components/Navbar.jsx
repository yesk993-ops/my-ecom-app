import React from 'react';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';

function Navbar({ cartCount = 0, onNavigate, onSearch, searchQuery, categories }) {
  const [query, setQuery] = React.useState(searchQuery || '');
  const [category, setCategory] = React.useState('All');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, category);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-main">
        <div
          className="nav-logo"
          onClick={() => onNavigate && onNavigate('home')}
          style={{ cursor: 'pointer' }}
        >
          Shop<span className="accent">Zone</span>
        </div>

        <form className="nav-search" onSubmit={handleSearch}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Select category"
          >
            <option value="All">All</option>
            {(categories || []).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search ShopZone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <FaSearch />
          </button>
        </form>

        <div className="nav-links">
          <div className="nav-item">
            <span className="top-line">Hello, User</span>
            <span className="bottom-line">Account & Lists ▾</span>
          </div>
          <div className="nav-item">
            <span className="top-line">Returns</span>
            <span className="bottom-line">& Orders</span>
          </div>
          <div
            className="nav-cart"
            onClick={() => onNavigate && onNavigate('cart')}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <FaShoppingCart className="nav-cart-icon" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="cart-count">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

Navbar.defaultProps = {
  cartCount: 0,
  categories: [],
  searchQuery: '',
};

export default Navbar;
