# E-commerce API

Node.js + Express + MongoDB REST API for an e-commerce application.

## Features

- User registration
- Login with mobile/password
- JWT authentication
- bcrypt password hashing
- Admin authorization
- Product CRUD
- Orders
- Address management inside orders
- Order status management
- Order cancellation
- Request validation
- Centralized error handling

## Requirements

- Node.js 18+
- MongoDB running locally or MongoDB Atlas

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and update:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_db
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Start development server:

```bash
npm run dev
```

Production:

```bash
npm start
```

## API

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products              Admin
PUT    /api/products/:id          Admin
DELETE /api/products/:id          Admin
```

### Orders

```text
POST  /api/orders
GET   /api/orders/my
GET   /api/orders/:id
GET   /api/orders/admin/all       Admin
PATCH /api/orders/:id/status      Admin
PATCH /api/orders/:id/cancel
```

## Register

```json
{
  "name": "Ankit",
  "mobile": "9876543210",
  "password": "123456"
}
```

## Login

```json
{
  "mobile": "9876543210",
  "password": "123456"
}
```

Use the returned JWT:

```text
Authorization: Bearer YOUR_TOKEN
```

## Product

Admin request:

```json
{
  "image": "https://example.com/product.jpg",
  "title": "Vitamin C Face Wash",
  "price": 375,
  "description": "Vitamin C and E face wash"
}
```

## Place Order

```json
{
  "items": [
    {
      "product": "PRODUCT_ID",
      "quantity": 2
    }
  ],
  "address": {
    "name": "Ankit Patel",
    "mobile": "9876543210",
    "addressLine1": "Main Road",
    "addressLine2": "",
    "city": "Valsad",
    "state": "Gujarat",
    "pincode": "396001"
  }
}
```

The backend calculates the order total using the current product price from MongoDB. Do not trust prices sent by the frontend.

## Make a user admin

After registering a user, change their role in MongoDB:

```text
role: "admin"
```

For example in MongoDB Compass, edit the user document and set:

```json
{
  "role": "admin"
}
```

Then log in again to get a JWT containing access to admin routes.

## Example order status

```text
pending
confirmed
processing
shipped
delivered
cancelled
```
# kunj-skin-backend
