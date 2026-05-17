const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory payment transactions
const transactions = {};

// Payment methods
const PAYMENT_METHODS = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'payment-service', timestamp: new Date().toISOString() });
});

app.post('/api/payments/process', (req, res) => {
  const { userId, amount, currency = 'USD', paymentMethod = 'credit_card' } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: 'userId and amount are required' });
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: `Invalid payment method. Supported: ${PAYMENT_METHODS.join(', ')}` });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  const transactionId = uuidv4();

  const transaction = {
    transactionId,
    userId,
    amount,
    currency,
    paymentMethod,
    status: success ? 'SUCCESS' : 'FAILED',
    message: success ? 'Payment processed successfully' : 'Payment declined',
    processedAt: new Date().toISOString()
  };

  if (!transactions[userId]) transactions[userId] = [];
  transactions[userId].push(transaction);

  if (success) {
    res.json({ success: true, transactionId, message: 'Payment processed successfully', transaction });
  } else {
    res.status(402).json({ success: false, error: 'Payment declined', transaction });
  }
});

app.get('/api/payments/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const userTransactions = transactions[userId] || [];
  res.json({ transactions: userTransactions });
});

app.get('/api/payments/transaction/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  for (const userId of Object.keys(transactions)) {
    const txn = transactions[userId].find(t => t.transactionId === transactionId);
    if (txn) return res.json({ transaction: txn });
  }
  res.status(404).json({ error: 'Transaction not found' });
});

app.post('/api/payments/refund', (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return res.status(400).json({ error: 'transactionId is required' });
  }

  for (const userId of Object.keys(transactions)) {
    const txn = transactions[userId].find(t => t.transactionId === transactionId);
    if (txn) {
      if (txn.status === 'REFUNDED') {
        return res.status(400).json({ error: 'Transaction already refunded' });
      }
      txn.status = 'REFUNDED';
      txn.refundedAt = new Date().toISOString();
      return res.json({ success: true, message: 'Refund processed successfully', transaction: txn });
    }
  }
  res.status(404).json({ error: 'Transaction not found' });
});

app.get('/api/payments/methods', (req, res) => {
  res.json({ paymentMethods: PAYMENT_METHODS });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

const server = app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

module.exports = { app, server };
