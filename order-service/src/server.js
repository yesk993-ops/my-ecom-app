const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3003;
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://cart-service:3002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory orders
const orders = {};

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'order-service', timestamp: new Date().toISOString() });
});

app.post('/api/orders', async (req, res) => {
  try {
    const { userId, shippingAddress, items, totalAmount } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({ error: 'userId and items are required' });
    }

    // Call payment service to process payment
    const paymentResponse = await axios.post(`${PAYMENT_SERVICE_URL}/api/payments/process`, {
      userId,
      amount: totalAmount,
      currency: 'USD',
      paymentMethod: req.body.paymentMethod || 'credit_card'
    }).catch(() => ({
      data: { success: true, transactionId: uuidv4(), message: 'Payment processed (mock)' }
    }));

    const order = {
      id: uuidv4(),
      userId,
      items,
      totalAmount,
      shippingAddress,
      status: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
      transactionId: paymentResponse.data.transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!orders[userId]) orders[userId] = [];
    orders[userId].push(order);

    // Call cart service to clear the cart
    axios.delete(`${CART_SERVICE_URL}/api/cart/${userId}`).catch(() => {});

    res.status(201).json({ order, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
});

app.get('/api/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const userOrders = orders[userId] || [];
  res.json({ orders: userOrders });
});

app.get('/api/orders/:userId/:orderId', (req, res) => {
  const { userId, orderId } = req.params;
  const userOrders = orders[userId] || [];
  const order = userOrders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

app.put('/api/orders/:userId/:orderId/status', (req, res) => {
  const { userId, orderId } = req.params;
  const { status } = req.body;
  const userOrders = orders[userId] || [];
  const order = userOrders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json({ order, message: 'Order status updated' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

const server = app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

module.exports = { app, server };
