import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

function Cart({ cartItems = [], onUpdateQuantity, onRemoveItem, onCheckout, onNavigate }) {
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const formatPrice = (val) => Number(val || 0).toFixed(2);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1>Shopping Cart</h1>
        <div className="cart-empty">
          <FaShoppingCart style={{ fontSize: 64, color: '#ddd', marginBottom: 16 }} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            style={{
              marginTop: 16,
              padding: '10px 28px',
              background: '#ffd814',
              border: 'none',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Shop now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={item.image || 'https://via.placeholder.com/120x120?text=No+Image'}
              alt={item.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
              }}
            />
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <div className="cart-item-price">${formatPrice(item.price)}</div>
              <div className="cart-item-quantity">
                <button
                  onClick={() =>
                    onUpdateQuantity && onUpdateQuantity(item.id, (item.quantity || 1) - 1)
                  }
                  disabled={(item.quantity || 1) <= 1}
                  style={(item.quantity || 1) <= 1 ? { opacity: 0.5 } : {}}
                >
                  −
                </button>
                <span>{item.quantity || 1}</span>
                <button
                  onClick={() =>
                    onUpdateQuantity && onUpdateQuantity(item.id, (item.quantity || 1) + 1)
                  }
                >
                  +
                </button>
                <button
                  className="cart-item-remove"
                  onClick={() => onRemoveItem && onRemoveItem(item.id)}
                  style={{ marginLeft: 12 }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap' }}>
              ${formatPrice((item.price || 0) * (item.quantity || 1))}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>
          Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}):{' '}
          <span style={{ color: '#b12704' }}>${formatPrice(totalPrice)}</span>
        </h3>
        <button className="checkout-btn" onClick={onCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

Cart.defaultProps = {
  cartItems: [],
};

export default Cart;
