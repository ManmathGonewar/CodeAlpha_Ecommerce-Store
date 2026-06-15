USE ecommerce_store;

INSERT INTO users (name, email, password_hash, role, cart_json)
VALUES
  ('Store Admin', 'admin@demostore.com', '$2b$10$.BjSzE7DP3F9.almwnJyzeUku91b8SmqHxjaGQiuvY9TmfS9bVQB2', 'admin', JSON_ARRAY()),
  ('Demo Shopper', 'user@demostore.com', '$2b$10$HiZhvWR219lL5xCitnLDQ..sx4pCMfl48A64WNoCtor8jCFoe3Stu', 'user', JSON_ARRAY())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

INSERT INTO products (name, description, price, image_url, category, stock)
VALUES
  (
    'CodeAlpha Desk Lamp',
    'A clean matte desk lamp with warm light output and a compact profile for focused work setups.',
    3199.00,
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    'Home Office',
    18
  ),
  (
    'Canvas Weekender Bag',
    'A roomy carry bag with reinforced straps, a structured base, and everyday travel-friendly styling.',
    4399.00,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    'Accessories',
    12
  ),
  (
    'Stoneware Water Bottle',
    'An insulated bottle designed to keep drinks cold for hours while still looking polished on your desk.',
    1999.00,
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    'Lifestyle',
    25
  ),
  (
    'Wireless Keyboard',
    'A slim keyboard with tactile keys, Bluetooth pairing, and a layout that fits compact workstations.',
    5599.00,
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80',
    'Electronics',
    15
  ),
  (
    'Minimal Wall Clock',
    'A simple statement clock with a silent sweep movement and neutral finish for home or studio spaces.',
    2599.00,
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    'Decor',
    10
  )
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  price = VALUES(price),
  image_url = VALUES(image_url),
  category = VALUES(category),
  stock = VALUES(stock);
