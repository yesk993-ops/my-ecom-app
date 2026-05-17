const { app } = require('./server');
const request = require('supertest');

describe('Product Service', () => {
  test('GET /api/health returns UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('product-service');
  });

  test('GET /api/products returns paginated products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.products).toBeDefined();
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test('GET /api/products with category filter', async () => {
    const res = await request(app).get('/api/products?category=Electronics');
    expect(res.statusCode).toBe(200);
    res.body.products.forEach(p => {
      expect(p.category).toBe('Electronics');
    });
  });

  test('GET /api/products with search', async () => {
    const res = await request(app).get('/api/products?search=iphone');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  test('GET /api/products/:id returns product', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.product.id).toBe('1');
    expect(res.body.product.name).toBe('iPhone 15 Pro Max 256GB');
  });

  test('GET /api/products/:id returns 404', async () => {
    const res = await request(app).get('/api/products/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });

  test('GET /api/products/categories returns categories', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.categories).toContain('Electronics');
    expect(res.body.categories).toContain('Fashion');
  });
});
