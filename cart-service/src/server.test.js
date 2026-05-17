const { app } = require('./server');
const request = require('supertest');

describe('Cart Service', () => {
  const userId = 'test-user-1';
  const productId = '1';

  test('GET /api/health returns UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('cart-service');
  });

  test('GET /api/cart/:userId creates/returns cart', async () => {
    const res = await request(app).get(`/api/cart/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cart.userId).toBe(userId);
    expect(res.body.cart.items).toEqual([]);
  });

  test('POST /api/cart/:userId/items adds item', async () => {
    const res = await request(app)
      .post(`/api/cart/${userId}/items`)
      .send({ productId, quantity: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.totalItems).toBe(2);
  });

  test('PUT /api/cart/:userId/items/:productId updates quantity', async () => {
    const res = await request(app)
      .put(`/api/cart/${userId}/items/${productId}`)
      .send({ quantity: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(3);
  });

  test('DELETE /api/cart/:userId/items/:productId removes item', async () => {
    await request(app).post(`/api/cart/${userId}/items`).send({ productId, quantity: 1 });
    const res = await request(app).delete(`/api/cart/${userId}/items/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cart.items.length).toBe(0);
  });

  test('DELETE /api/cart/:userId clears cart', async () => {
    await request(app).post(`/api/cart/${userId}/items`).send({ productId, quantity: 1 });
    const res = await request(app).delete(`/api/cart/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cart.items).toEqual([]);
  });
});
