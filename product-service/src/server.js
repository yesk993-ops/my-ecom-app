const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const products = [
  { id: '1', name: 'iPhone 15 Pro Max 256GB', category: 'Electronics', price: 1199.99, originalPrice: 1399.99, rating: 4.8, reviewCount: 2547, description: 'The most powerful iPhone ever. A17 Pro chip, 48MP camera system with 5x optical zoom, and all-day battery life.', features: ['A17 Pro Chip', '48MP Main Camera', '5x Optical Zoom', 'USB-C Connector', 'Titanium Design'], image: 'https://picsum.photos/seed/iphone15/400/400', stock: 45, badge: 'Best Seller' },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', price: 999.99, originalPrice: 1199.99, rating: 4.7, reviewCount: 1892, description: 'Galaxy AI is here. Built with titanium, Galaxy S24 Ultra features a flat display with Corning Gorilla Armor.', features: ['Galaxy AI', '200MP Camera', 'S Pen Included', 'Titanium Frame', 'Snapdragon 8 Gen 3'], image: 'https://picsum.photos/seed/samsung24/400/400', stock: 32, badge: 'New' },
  { id: '3', name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', price: 349.99, originalPrice: 399.99, rating: 4.9, reviewCount: 3218, description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling.', features: ['Industry-Leading NC', '30-Hour Battery', 'Multipoint Connection', 'Lightweight Design', 'Hi-Res Audio'], image: 'https://picsum.photos/seed/sonyheadphones/400/400', stock: 78, badge: null },
  { id: '4', name: 'MacBook Air M3 15-inch', category: 'Electronics', price: 1299.99, originalPrice: 1499.99, rating: 4.8, reviewCount: 1567, description: 'Supercharged by M3 chip. With up to 18 hours of battery life and a stunning 15.3-inch Liquid Retina display.', features: ['M3 Chip', '18-Hour Battery', '15.3" Display', '8GB Unified Memory', '256GB SSD'], image: 'https://picsum.photos/seed/macbookair/400/400', stock: 23, badge: 'Limited Offer' },
  { id: '5', name: 'Nike Air Max 270 React', category: 'Fashion', price: 149.99, originalPrice: 179.99, rating: 4.6, reviewCount: 4521, description: 'The Nike Air Max 270 React combines the oversized Air unit with React foam for a smooth, comfortable ride.', features: ['Air Max 270 Unit', 'React Foam', 'Breathable Mesh', 'Rubber Outsole', 'Padded Collar'], image: 'https://picsum.photos/seed/nike270/400/400', stock: 120, badge: null },
  { id: '6', name: 'Apple Watch Series 9 GPS 45mm', category: 'Electronics', price: 429.99, originalPrice: 499.99, rating: 4.7, reviewCount: 1893, description: 'Advanced health features, powerful S9 chip, and a brilliant always-on Retina display.', features: ['S9 Chip', 'Blood Oxygen App', 'ECG App', 'Temperature Sensing', 'Always-On Display'], image: 'https://picsum.photos/seed/applewatch9/400/400', stock: 56, badge: 'Best Seller' },
  { id: '7', name: 'Kindle Paperwhite (16GB)', category: 'Electronics', price: 139.99, originalPrice: 159.99, rating: 4.8, reviewCount: 6789, description: 'The next generation Kindle Paperwhite with a 6.8" display, adjustable warm light.', features: ['6.8" Display', 'Adjustable Warm Light', 'Weeks of Battery', 'Waterproof (IPX8)', '16GB Storage'], image: 'https://picsum.photos/seed/kindlepw/400/400', stock: 200, badge: 'Amazon Choice' },
  { id: '8', name: "Levi's 501 Original Fit Jeans", category: 'Fashion', price: 69.99, originalPrice: 89.99, rating: 4.5, reviewCount: 8912, description: 'The original blue jean since 1873. Straight leg, sits at waist, button fly, and authentic fit.', features: ['Original Fit', 'Button Fly', '100% Cotton', 'Straight Leg', '5-Pocket Design'], image: 'https://picsum.photos/seed/levis501/400/400', stock: 340, badge: null },
  { id: '9', name: 'Dyson V15 Detect Cordless Vacuum', category: 'Home', price: 749.99, originalPrice: 799.99, rating: 4.7, reviewCount: 2345, description: 'Dyson V15 Detect vacuum with laser reveals microscopic dust.', features: ['Laser Reveals Dust', 'Piezo Sensor', '60-Min Run Time', 'LCD Screen', 'Whole-Machine Filtration'], image: 'https://picsum.photos/seed/dysonv15/400/400', stock: 15, badge: 'Premium' },
  { id: '10', name: 'Instant Pot Duo 7-in-1', category: 'Home', price: 89.99, originalPrice: 119.99, rating: 4.6, reviewCount: 15678, description: 'The Instant Pot Duo 7-in-1 electric pressure cooker replaces up to 7 kitchen appliances.', features: ['Pressure Cooker', 'Slow Cooker', 'Rice Cooker', 'Steamer', 'Sauté', 'Yogurt Maker', 'Warmer'], image: 'https://picsum.photos/seed/instantpot/400/400', stock: 89, badge: 'Top Rated' },
  { id: '11', name: 'Nintendo Switch OLED Model', category: 'Gaming', price: 349.99, originalPrice: 399.99, rating: 4.9, reviewCount: 4567, description: 'Meet the newest member of the Nintendo Switch family with a vibrant 7-inch OLED screen.', features: ['7" OLED Screen', '64GB Storage', 'Wide Kickstand', 'Enhanced Audio', 'Dock with LAN Port'], image: 'https://picsum.photos/seed/switcholed/400/400', stock: 12, badge: 'Hot Deal' },
  { id: '12', name: 'The Alchemist - Paulo Coelho (Hardcover)', category: 'Books', price: 14.99, originalPrice: 24.99, rating: 4.8, reviewCount: 23456, description: 'Paulo Coelho\'s enchanting novel has inspired a devoted following around the world.', features: ['Hardcover Edition', '197 Pages', 'International Bestseller'], image: 'https://picsum.photos/seed/alchemist/400/400', stock: 500, badge: 'Bestseller' }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'product-service', timestamp: new Date().toISOString() });
});

app.get('/api/products', (req, res) => {
  const { category, search, sort, page = 1, limit = 12 } = req.query;
  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === 'popular') filtered.sort((a, b) => b.reviewCount - a.reviewCount);

  const total = filtered.length;
  const startIdx = (parseInt(page) - 1) * parseInt(limit);
  const paginated = filtered.slice(startIdx, startIdx + parseInt(limit));

  res.json({
    products: paginated,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
  });
});

app.get('/api/products/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json({ categories });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
  });
}

module.exports = { app, server };
