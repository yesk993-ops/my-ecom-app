import React from 'react';

function renderStars(rating) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="stars">
      {Array(full).fill(null).map((_, i) => (
        <span key={`full-${i}`}>★</span>
      ))}
      {half && <span>★</span>}
      {Array(empty).fill(null).map((_, i) => (
        <span key={`empty-${i}`} style={{ color: '#ddd' }}>☆</span>
      ))}
    </span>
  );
}

function formatPrice(price) {
  if (price === undefined || price === null) return '0.00';
  return Number(price).toFixed(2);
}

function ProductCard({ product, onAddToCart }) {
  if (!product) return null;

  const {
    id,
    name = 'Product Name',
    price = 0,
    originalPrice,
    image = 'https://via.placeholder.com/300x260?text=No+Image',
    category = '',
    rating = 0,
    reviews = 0,
    badge,
    stock = 10,
  } = product;

  const badgeClass = badge ? `product-badge ${badge.toLowerCase().replace(/\s+/g, '-')}` : '';
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock === 0;

  return (
    <div className="product-card">
      {badge && <span className={badgeClass}>{badge}</span>}

      <div className="product-image-container">
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x260?text=No+Image';
          }}
        />
      </div>

      <div className="product-info">
        {category && <div className="product-category">{category}</div>}
        <div className="product-name" title={name}>{name}</div>

        <div className="product-rating">
          {renderStars(rating)}
          <span className="review-count">({reviews || 0})</span>
        </div>

        <div className="product-price-row">
          <span className="price-symbol">$</span>
          <span className="price-main">
            {formatPrice(price).split('.')[0]}
          </span>
          <span className="price-cents">
            .{formatPrice(price).split('.')[1]}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="original-price">${formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className={`product-stock ${isLowStock ? 'low' : ''}`}>
          {isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${stock} left in stock` : 'In Stock'}
        </div>

        <button
          className="add-to-cart-btn"
          onClick={() => onAddToCart && onAddToCart(product)}
          disabled={isOutOfStock}
          style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

ProductCard.defaultProps = {
  product: {
    id: null,
    name: 'Product Name',
    price: 0,
    image: 'https://via.placeholder.com/300x260?text=No+Image',
    category: '',
    rating: 0,
    reviews: 0,
    stock: 10,
  },
};

export default ProductCard;
