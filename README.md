# Full Stack E-commerce Store

A simple internship-ready e-commerce project built with:

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express.js
- Database: MySQL
- Authentication: JWT + bcrypt

The app includes user registration and login, product listing and details, cart management, checkout, order history, and an admin dashboard for product CRUD and order viewing.

## Features

### User

- Register and login
- Browse all products
- View product details
- Add products to cart
- Remove products from cart
- Place an order
- View order history

### Admin

- Admin login
- Add product
- Edit product
- Delete product
- View all orders

## Project Structure

```text
client/
├── index.html
├── login.html
├── register.html
├── products.html
├── product.html
├── cart.html
├── orders.html
├── admin.html
├── css/
│   └── styles.css
├── js/
│   ├── admin.js
│   ├── api.js
│   ├── cart.js
│   ├── home.js
│   ├── login.js
│   ├── main.js
│   ├── orders.js
│   ├── product.js
│   ├── products.js
│   ├── register.js
│   └── ui.js
└── assets/

server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
├── uploads/
├── .env
├── .env.example
├── package.json
└── server.js
```

## Setup

1. Install MySQL and create the database schema:

   ```bash
   mysql -u root -p < server/src/database/schema.sql
   mysql -u root -p ecommerce_store < server/src/database/seed.sql
   ```

2. Update the backend environment file:

   File: `server/.env`

   Set the correct values for:

   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `FRONTEND_ORIGIN`

3. Install backend dependencies:

   ```bash
   cd server
   npm install
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser:

   ```text
   http://localhost:5000
   ```

The Express server also serves the static frontend, so you only need to run the backend server for local development.

## Demo Credentials

- Admin
  - Email: `admin@demostore.com`
  - Password: `Admin@123`
- User
  - Email: `user@demostore.com`
  - Password: `User@123`

## Database Files

- Schema: `server/src/database/schema.sql`
- Seed data: `server/src/database/seed.sql`

## Main API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Products

- `GET /api/products`
- `GET /api/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart/add`
- `DELETE /api/cart/remove/:id`

### Orders

- `POST /api/orders`
- `GET /api/orders`

### Admin

- `POST /api/admin/login`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`

## Notes

- Passwords are hashed with bcrypt before storage.
- JWT middleware protects cart, orders, and admin routes.
- MySQL uses a connection pool with `mysql2/promise`.
- Cart data is stored as JSON on the user record to keep the schema simple.
- Order items are stored as JSON snapshots so history stays accurate even if product data changes later.
