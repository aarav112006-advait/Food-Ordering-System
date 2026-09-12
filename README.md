# 🍽️ Online Food Ordering System

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js & Express">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO">
</p>

<p align="center">
  <strong>A scalable, real-time food delivery platform connecting customers, restaurant partners, and couriers.</strong>
</p>

<p align="center">
  <em>Discover • Order • Pay • Track • Review • Personalize</em>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Core Value Propositions](#-core-value-propositions)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [User Roles](#-user-roles)
- [Database Design](#-database-design)
- [Order Lifecycle](#-order-lifecycle)
- [REST API](#-rest-api)
- [Real-Time Tracking](#-real-time-order-tracking)
- [Stripe Payment Architecture](#-stripe-payment-architecture)
- [Recommendation Engine](#-personalized-recommendation-engine)
- [Frontend Architecture](#-frontend-react-architecture)
- [Security](#-security)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [Deployment Strategy](#-deployment-strategy)
- [Go-To-Market Strategy](#-go-to-market-strategy)
- [Future Enhancements](#-future-enhancements)
- [Project Objectives](#-project-objectives)
- [License](#-license)

---

# 🚀 Overview

The **Online Food Ordering System** is a full-stack, on-demand food delivery platform conceptually aligned with modern services such as Uber Eats and DoorDash.

The platform is designed around three primary actors:

```text
             ┌──────────────────┐
             │    CUSTOMER      │
             │ Browse • Order   │
             │ Pay • Track      │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ FOOD PLATFORM    │
             │ APIs • Payments  │
             │ Recommendations  │
             │ Real-Time Events  │
             └───────┬─────┬────┘
                     │     │
          ┌──────────┘     └──────────┐
          ▼                           ▼
 ┌──────────────────┐       ┌──────────────────┐
 │ RESTAURANT       │       │ COURIER          │
 │ Menu • Orders    │       │ Location • ETA   │
 │ Status           │       │ Delivery         │
 └──────────────────┘       └──────────────────┘
```

The system emphasizes **low-latency tracking, verified reviews, personalization, secure payments, and scalable separation of concerns**.

---

# 💎 Core Value Propositions

### ⚡ Real-Time Telemetry
Low-latency driver location and order-status tracking using bidirectional WebSocket communication.

### ⭐ Trust & Validation
Verified customer reviews designed to provide meaningful feedback and improve service quality.

### 🧠 Personalization
A recommendation engine that uses dietary preferences, order history, behavioral patterns, and popularity signals.

### 💳 Secure Transactions
Stripe-powered payment processing with PaymentIntents and secure webhook verification.

---

# ✨ Key Features

| Module | Capabilities |
|---|---|
| 👤 Customer | Registration, login, profile, address, ordering |
| 🏪 Restaurant | Restaurant discovery, menu management, order handling |
| 🛵 Courier | Driver assignment, location telemetry, delivery status |
| 🔐 Authentication | JWT authentication + RBAC |
| 🍔 Menu | Categories, pricing, modifiers, dietary flags |
| 🛒 Cart | Live totals, taxes, fees, tips, promo validation |
| 📦 Orders | Complete order lifecycle and tracking timeline |
| 📍 Tracking | Real-time order status, GPS, bearing, speed, ETA |
| 💳 Payments | Stripe Checkout/PaymentIntent + Webhooks |
| ⭐ Reviews | 1–5 rating, verified delivery, comments |
| 🧠 Recommendations | Personalized, collaborative and popularity-based |
| 🗺️ Maps | OpenStreetMap or Mapbox spatial visualization |

---

# 🏗️ System Architecture

The application follows a **multi-tier architecture** to maintain scalability, modularity, and separation of concerns.

```text
┌───────────────────────────────────────────────────────────┐
│                      CLIENT TIER                          │
│                                                           │
│  React 18 SPA • React Router • Context API                │
│  Socket.IO Client • Stripe Elements                       │
└──────────────────────────┬────────────────────────────────┘
                           │
                  REST API │ WebSocket
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
┌────────────────────────┐     ┌──────────────────────────┐
│ APPLICATION TIER       │     │ REAL-TIME TIER           │
│                        │     │                          │
│ Node.js + Express      │     │ Socket.IO                │
│ JWT Authentication     │     │ Room-based pub/sub       │
│ RBAC                   │     │ order:{orderId} rooms    │
│ REST APIs              │     │ Live telemetry           │
└────────────┬───────────┘     └────────────┬─────────────┘
             │                              │
             ▼                              │
┌────────────────────────┐                  │
│ PERSISTENCE TIER       │                  │
│                        │                  │
│ MongoDB + Mongoose     │                  │
│ Geospatial Indexes     │                  │
│ Timestamp Indexes      │                  │
└────────────┬───────────┘                  │
             │                              │
             └──────────────┬───────────────┘
                            ▼
                ┌────────────────────────┐
                │ THIRD-PARTY SERVICES   │
                │                        │
                │ Stripe                 │
                │ OpenStreetMap / Mapbox │
                └────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- **React 18** — Single Page Application
- **React Router** — Client-side navigation
- **Context API** — Global state management
- **Socket.IO Client** — Real-time communication
- **Stripe Elements** — Secure payment-data collection

## Backend

- **Node.js**
- **Express.js**
- **JWT Authentication**
- **Role-Based Access Control**
- **Socket.IO**
- **Mongoose ODM**

## Database

- **MongoDB**
- **2dsphere geospatial indexing**
- Timestamp indexing
- Document references

## External Integrations

- **Stripe** — Payments and webhooks
- **OpenStreetMap / Mapbox** — Spatial visualization

---

# 👥 User Roles

The platform defines four primary roles:

```text
┌───────────────┐
│   CUSTOMER    │
│               │
│ Browse        │
│ Order         │
│ Pay           │
│ Track         │
│ Review        │
└───────────────┘

┌──────────────────┐
│ RESTAURANT OWNER │
│                  │
│ Manage menu      │
│ Manage orders    │
│ Update status    │
└──────────────────┘

┌───────────────┐
│    COURIER    │
│               │
│ Delivery      │
│ GPS telemetry │
│ Status update │
└───────────────┘

┌───────────────┐
│     ADMIN     │
│               │
│ Platform      │
│ management    │
│ Authorization │
└───────────────┘
```

---

# 🗄️ Database Design

The persistence layer uses MongoDB with Mongoose.

## Core Models

```text
User
Restaurant
MenuItem
Order
Review
```

### User

Key concepts:

- Authentication information
- Roles
- Addresses
- Dietary preferences
- bcrypt authentication hashes

### Restaurant

Key concepts:

- Contact details
- GeoJSON location
- Cuisine tags
- Operating hours
- Delivery thresholds
- Rating aggregates

A **2dsphere index** supports location-aware/proximity queries.

### MenuItem

Includes:

- Category
- Pricing
- Vegetarian flag
- Vegan flag
- Gluten-free flag
- Spice level

### Order

Includes:

- Customer reference
- Restaurant reference
- Pricing breakdown
- Tax
- Delivery fee
- Tip
- Order status
- Payment status
- Driver reference
- Tracking timeline

### Review

Includes:

- Star rating from 1–5
- Verified delivery flag
- Comments
- Restaurant rating aggregation support

---

# 🔄 Order Lifecycle

Orders follow a strict state machine:

```text
PLACED
  │
  ▼
CONFIRMED
  │
  ▼
PREPARING
  │
  ▼
READY_FOR_PICKUP
  │
  ▼
OUT_FOR_DELIVERY
  │
  ▼
DELIVERED
```

Cancellation is also supported:

```text
PLACED ───────────────► CANCELLED
CONFIRMED ────────────► CANCELLED
```

### Order Journey

```text
Customer
   │
   ▼
Browse Restaurant
   │
   ▼
Select Menu Items
   │
   ▼
Cart & Checkout
   │
   ▼
Stripe Payment
   │
   ▼
Order Created
   │
   ▼
Restaurant Confirmation
   │
   ▼
Food Preparation
   │
   ▼
Ready for Pickup
   │
   ▼
Courier Delivery
   │
   ▼
Real-Time Tracking
   │
   ▼
Delivered
   │
   ▼
Verified Review
```

---

# 🔌 REST API

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | Login/session management |
| GET | `/api/auth/profile` | Retrieve profile |

---

## Restaurants

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/restaurants` | Restaurant discovery |
| GET | `/api/restaurants/search` | Search restaurants |
| GET | `/api/restaurants/:id/menu` | Retrieve restaurant menu |

---

## Orders

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Retrieve orders |
| GET | `/api/orders/:id` | Retrieve specific order |
| PATCH | `/api/orders/:id/status` | Update order status |

---

## Payments

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/payments/checkout-session` | Create Stripe checkout session |
| POST | `/api/payments/create-payment-intent` | Create PaymentIntent |
| POST | `/api/payments/webhook` | Process Stripe webhook |

---

## Recommendations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/recommendations` | Personalized recommendations |
| GET | `/api/recommendations/trending` | Trending/cold-start recommendations |

---

## Reviews

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/api/reviews` | Review management |
| GET | `/api/reviews/restaurant/:restaurantId` | Restaurant feedback |

---

# ⚡ Real-Time Order Tracking

The tracking subsystem uses **Socket.IO** with a room-based architecture.

Each order can have its own room:

```text
order:{orderId}
```

This allows events to be broadcast only to clients associated with the relevant order.

## Subscription

The customer joins an order room:

```text
join_order
     │
     ▼
order:{orderId}
     │
     ▼
Receive live events
```

## Events

### `join_order`

Client subscribes to updates for a specific order.

### `leave_order`

Client leaves an order tracking room.

### `order_status_updated`

Emitted when the restaurant or courier changes an order milestone.

### `driver_location_updated`

Used for courier telemetry.

Telemetry can include:

```text
Latitude
Longitude
Bearing
Speed
Dynamic ETA
```

---

# 💳 Stripe Payment Architecture

The payment flow is designed around secure server-side PaymentIntents and webhook confirmation.

```text
┌─────────────────────┐
│ Customer Checkout   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Stripe Elements     │
│ Card Collection     │
└──────────┬──────────┘
           │
           │ Payment data
           ▼
┌─────────────────────┐
│ Backend             │
│ Create PaymentIntent│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Stripe              │
│ Payment Processing   │
└──────────┬──────────┘
           │
           │ Webhook
           ▼
┌─────────────────────┐
│ Webhook Verification│
│ Signature Validation│
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Confirm Order       │
└─────────────────────┘
```

Security mechanisms described by the architecture include:

- Stripe Elements for card collection
- PaymentIntents
- Idempotency keys
- Webhook signature verification
- `stripe.webhooks.constructEvent`
- Order confirmation only after successful authorization

---

# 🧠 Personalized Recommendation Engine

The recommendation system uses a hybrid approach.

## 1. Content-Based Filtering

Matches users with menu items using:

```text
Favorite cuisines
Dietary restrictions
Vegan preference
Gluten-free preference
Other explicit preferences
```

## 2. Collaborative Filtering

Analyzes behavioral patterns such as:

```text
Frequently co-ordered dishes
Similar user taste profiles
Historical ordering behavior
```

## 3. Popularity Fallback

For new users without sufficient history:

```text
Highest-rated local dishes
        +
Geographic radius
        ↓
Cold-start recommendations
```

### Recommendation Pipeline

```text
              USER PROFILE
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   Preferences  History   Behavior
        │          │          │
        └──────────┼──────────┘
                   ▼
            Recommendation
                Engine
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Content     Collaborative  Popularity
   Based          Based        Fallback
       │           │           │
       └───────────┼───────────┘
                   ▼
          Personalized Results
```

---

# 🎨 Frontend React Architecture

The frontend is designed as a modular React application.

## Core UI Components

### Navbar & Address Selector

Provides global location context.

### RestaurantList

Supports:

- Dynamic restaurant grid
- Cuisine chips
- Sorting
- Delivery filters

### RestaurantDetail

Provides:

- Tabbed menu categories
- Modifiers
- Add-ons
- Spice levels

### CartDrawer

Handles:

- Cart calculations
- Taxes
- Fees
- Tips
- Promo-code validation
- Example promotion: `TASTY20`

### OrderTracker

Provides:

- Five-step visual order tracker
- Interactive map simulation
- Real-time order updates

### Recommendations

A personalized horizontal carousel integrated into:

```text
Home
Cart
```

---

# 🔐 Security Architecture

Security is treated as a cross-cutting concern.

```text
                  REQUEST
                     │
                     ▼
              JWT Authentication
                     │
                     ▼
             Role-Based Access
                     │
                     ▼
              Protected Routes
                     │
                     ▼
               Controllers
                     │
                     ▼
                 MongoDB
```

### Security Principles

- JWT-based authentication
- Role-Based Access Control
- bcrypt password hashing
- Protected API routes
- Stripe webhook signature verification
- Payment secrets stored in environment variables
- Secure payment-data collection through Stripe Elements
- Geospatial data handled through indexed database queries

---

# 📁 Project Structure

```text
Food-Ordering-System/
│
├── backend/
│   ├── config/
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── recommendationController.js
│   │   ├── restaurantController.js
│   │   └── reviewController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── Review.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── reviewRoutes.js
│   │
│   ├── sockets/
│   │   └── trackingSocket.js
│   │
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       ├── context/
│       ├── data/
│       ├── services/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
│
├── .gitignore
├── LICENSE
└── README.md
```

---

# ⚙️ Local Development

## Prerequisites

Install:

```text
Node.js
npm
MongoDB / MongoDB Atlas
Git
```

A Stripe test environment is required for payment integration.

---

## Backend

```bash
cd backend
npm install
npm run dev
```

If your package configuration uses the production/start script:

```bash
npm start
```

---

## Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

The exact commands should follow the scripts defined in the respective `package.json` files.

---

# 🔑 Environment Variables

Create local environment files and never commit production secrets.

### Backend

```env
MONGODB_URI=your_mongodb_atlas_connection_string
STRIPE_SECRET_KEY=your_stripe_secret
JWT_SECRET=your_jwt_signing_secret
SOCKET_PORT=your_socket_port
```

### Important

```text
❌ Never commit:
.env

✅ Commit:
.env.example
```

---

# 🌐 Deployment Strategy

## Recommended Production Architecture

```text
                       INTERNET
                           │
                           ▼
                    ┌────────────┐
                    │ HTTPS/CDN  │
                    └─────┬──────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       ┌─────────────┐         ┌─────────────┐
       │ React SPA   │         │ Node/Express│
       │ Vercel /    │         │ AWS ECS /   │
       │ Netlify     │         │ Render      │
       └─────────────┘         └──────┬──────┘
                                      │
                       ┌──────────────┼──────────────┐
                       ▼              ▼              ▼
                 ┌──────────┐   ┌──────────┐   ┌──────────┐
                 │ MongoDB  │   │ Stripe   │   │ Socket.IO│
                 │ Atlas    │   │          │   │ Realtime │
                 └──────────┘   └──────────┘   └──────────┘
```

### Recommended Deployment

| Layer | Recommended Platform |
|---|---|
| Frontend | Vercel / Netlify |
| Backend | AWS ECS / Render |
| Database | MongoDB Atlas |
| Payments | Stripe |
| Maps | OpenStreetMap / Mapbox |
| Realtime | Socket.IO |

---

# 📈 Scalability Considerations

The architecture is designed with scalability in mind.

### Database

- 2dsphere indexes for geographic queries
- Timestamp indexing for order history
- Mongoose references
- MongoDB Atlas scaling

### Real-Time Layer

Room-based Socket.IO architecture:

```text
Client A → order:101
Client B → order:102
Client C → order:103
```

Events remain targeted to the appropriate order room.

### Future Infrastructure

Potential production additions:

```text
Redis
Load Balancer
Docker
Container orchestration
CDN
Centralized logging
Monitoring
Automated backups
```

---

# 📣 Go-To-Market Strategy

## Phase 1 — Hyperlocal Restaurant Onboarding

Start in a high-density neighborhood.

Proposed strategy:

```text
First 50 restaurant partners
        ↓
Zero-commission introductory tier
        ↓
Build supply
        ↓
Generate initial customer demand
```

## Phase 2 — Customer Acquisition

Use:

- First-order discounts
- College campus ambassadors
- Geo-targeted advertising
- Social media campaigns

## Phase 3 — Courier Network

Incentivize reliable courier supply through:

- Guaranteed hourly minimums
- 100% tip retention
- Peak-hour performance bonuses

## Phase 4 — Retention & Loyalty

Future retention mechanisms:

- Reward points
- Personalized meal-time notifications
- Subscription-based free delivery passes

---

# 🎯 Project Objectives

The project aims to demonstrate a production-oriented full-stack architecture capable of supporting:

```text
Authentication
      +
Restaurant Discovery
      +
Food Ordering
      +
Secure Payments
      +
Real-Time Tracking
      +
Reviews
      +
Personalization
      +
Location-Aware Services
```

The key engineering objective is to combine these capabilities while maintaining a clean separation between client, application, real-time, persistence, and third-party integration layers.

---

# 🔮 Future Enhancements

- [ ] 🤖 Advanced machine-learning recommendation models
- [ ] 🗺️ Production GPS navigation
- [ ] 📱 Mobile application
- [ ] 🔔 Push notifications
- [ ] 🎁 Loyalty and reward points
- [ ] 💳 Subscription/free-delivery plans
- [ ] 📊 Restaurant analytics dashboard
- [ ] 🧑‍💼 Advanced admin dashboard
- [ ] 🐳 Dockerized production deployment
- [ ] ⚡ Redis caching
- [ ] 📈 Advanced monitoring and observability
- [ ] 🧪 Automated unit and integration testing
- [ ] 🔄 CI/CD pipeline

---

# 🧪 Engineering Concepts Demonstrated

This project demonstrates practical knowledge of:

```text
✓ Full-Stack Development
✓ RESTful API Design
✓ React SPA Architecture
✓ JWT Authentication
✓ Role-Based Authorization
✓ MongoDB Data Modeling
✓ Geospatial Indexing
✓ WebSocket Communication
✓ Real-Time Event Architecture
✓ Payment Integration
✓ Webhook Security
✓ Recommendation Systems
✓ Modular Backend Architecture
✓ Responsive Frontend Architecture
✓ Cloud Deployment Planning
```

---

# 🎓 Academic Project Summary

| Category | Details |
|---|---|
| Project | Online Food Ordering System |
| Domain | Food Delivery / E-Commerce |
| Architecture | Multi-Tier Client–Server Architecture |
| Frontend | React 18 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + RBAC |
| Payments | Stripe |
| Real-Time | Socket.IO / WebSockets |
| Mapping | OpenStreetMap / Mapbox |
| Core Differentiators | Real-Time Tracking, Reviews, Personalization |

---



# 📜 License

This project is licensed under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

---




<p align="center">

## 🍕 Discover. Order. Pay. Track. Review.

### Built for a smarter food-delivery experience. 🚀

<strong>React • Node.js • Express • MongoDB • Stripe • Socket.IO</strong>

</p>
