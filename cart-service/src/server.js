const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3002;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3001';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory cart storage
const carts = {};

// Get or create cart
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'cart-service', timestamp: new Date().toISOString() });
});

app.get('/api/cart/:userId', (req, res) => {
  const { userId } = req.params;
  if (!carts[userId]) {
    carts[userId] = { userId, items: [], totalItems: 0, totalPrice: 0 };
  }
  res.json({ cart: carts[userId] });
});

app.post('/api/cart/:userId/items', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity = 1 } = req.body;

  if (!carts[userId]) {
    carts[userId] = { userId, items: [], totalItems: 0, totalPrice: 0 };
  }

  const cart = carts[userId];
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Simulate fetching product details (in production, call product service)
    cart.items.push({
      productId,
      quantity,
      name: `Product ${productId}`,
      price: 0,
      image: ''
    });
  }

  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.json({ cart, message: 'Item added to cart' });
});

app.put('/api/cart/:userId/items/:productId', (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const cart = carts[userId];
  const item = cart.items.find(i => i.productId === productId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  item.quantity = quantity;

  if (item.quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  }

  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.json({ cart });
});

app.delete('/api/cart/:userId/items/:productId', (req, res) => {
  const { userId, productId } = req.params;

  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  carts[userId].items = carts[userId].items.filter(i => i.productId !== productId);
  carts[userId].totalItems = carts[userId].items.reduce((sum, item) => sum + item.quantity, 0);
  carts[userId].totalPrice = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.json({ cart: carts[userId], message: 'Item removed from cart' });
});

app.delete('/api/cart/:userId', (req, res) => {
  const { userId } = req.params;
  carts[userId] = { userId, items: [], totalItems: 0, totalPrice: 0 };
  res.json({ cart: carts[userId], message: 'Cart cleared' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

const server = app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});

module.exports = { app, server };
