const { app } = require('./server');
const request = require('supertest');

describe('Order Service', () => {
  const userId = 'test-user-1';
  let orderId;

  test('GET /api/health returns UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('order-service');
  });

  test('POST /api/orders creates an order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        userId,
        items: [{ productId: '1', name: 'Test Product', quantity: 2, price: 29.99 }],
        totalAmount: 59.98,
        shippingAddress: { street: '123 Test St', city: 'Test City', zipCode: '12345' }
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.order.status).toBe('CONFIRMED');
    expect(res.body.order.userId).toBe(userId);
    orderId = res.body.order.id;
  });

  test('GET /api/orders/:userId returns user orders', async () => {
    const res = await request(app).get(`/api/orders/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  test('GET /api/orders/:userId/:orderId returns specific order', async () => {
    const res = await request(app).get(`/api/orders/${userId}/${orderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.order.id).toBe(orderId);
  });

  test('POST /api/orders fails without items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ userId, items: [] });
    expect(res.statusCode).toBe(400);
  });
});
