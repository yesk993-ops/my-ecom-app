const { app } = require('./server');
const request = require('supertest');

describe('Payment Service', () => {
  const userId = 'test-user-1';
  let transactionId;

  test('GET /api/health returns UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('payment-service');
  });

  test('POST /api/payments/process processes payment', async () => {
    const res = await request(app)
      .post('/api/payments/process')
      .send({ userId, amount: 59.99, paymentMethod: 'credit_card' });
    expect([200, 402]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.success).toBe(true);
      transactionId = res.body.transactionId;
    }
  });

  test('POST /api/payments/process fails without userId', async () => {
    const res = await request(app)
      .post('/api/payments/process')
      .send({ amount: 59.99 });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/payments/transactions/:userId returns transactions', async () => {
    const res = await request(app).get(`/api/payments/transactions/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });

  test('GET /api/payments/methods returns payment methods', async () => {
    const res = await request(app).get('/api/payments/methods');
    expect(res.statusCode).toBe(200);
    expect(res.body.paymentMethods).toContain('credit_card');
    expect(res.body.paymentMethods).toContain('paypal');
  });
});
