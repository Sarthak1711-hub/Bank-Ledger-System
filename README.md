![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)
![Architecture](https://img.shields.io/badge/Architecture-Double--Entry%20Ledger-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

# 🏦 Bank Ledger System 

> A production-grade banking backend API built on **double-entry ledger principles** — engineered for auditability, transactional safety, and financial consistency.
 
Built with **Node.js · Express · MongoDB**

--- 

## 📌 Overview

The Bank Ledger System is a RESTful backend that models accounts and financial transactions using a ledger-first approach. Every debit and credit is recorded as an immutable ledger entry — making balances fully derivable, reconciliation straightforward, and audit trails complete by design.
 
### Why Ledger-First?

Traditional balance fields are mutable and lossy. A ledger-based model instead treats every financial event as a permanent record. Balances are *computed* from the ledger, never stored directly — eliminating entire classes of inconsistency.

| Approach | Balance Source | Audit Trail | Rollback Safety |
|---|---|---|---|
| ❌ Traditional | Mutable field | Lossy / partial | Error-prone |
| ✅ Ledger-First | Computed from entries | Complete by design | Atomic via sessions |

---

## ✨ Features

| Category | Details |
|---|---|
| 🔐 **Authentication** | JWT-based auth with `httpOnly` cookies, token blacklist on logout |
| 🏛️ **Accounts** | Account creation, retrieval, and real-time balance via ledger aggregation |
| 💸 **Transactions** | Atomic transfers using MongoDB sessions with commit/rollback |
| 🔁 **Idempotency** | Duplicate transaction prevention via `idempotencyKey` |
| 📒 **Ledger Entries** | Immutable debit/credit records — append-only by design |
| 🛡️ **Middleware Auth** | JWT verification + blacklist check on every protected route |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 18+ | Server-side JavaScript |
| Framework | Express.js 4.x | Routing, middleware pipeline |
| Database | MongoDB + Mongoose | Document persistence, schema enforcement |
| Auth | JSON Web Tokens (JWT) | Stateless session tokens |
| Cookie Handling | cookie-parser | `httpOnly` cookie management |
| Config | dotenv | Environment variable loading |

---

## 🗂️ Project Structure

```
bank-ledger/
│
├── server.js                         # Entry point — env loading, server startup & graceful shutdown
└── src/
    ├── app.js                        # Express wiring and route mounting
    │
    ├── config/
    │   └── db.js                     # MongoDB connection
    │
    ├── controllers/
    │   ├── auth.controllers.js       # register · login · logout
    │   ├── account.controllers.js    # create/get account · get balance
    │   └── transaction.controller.js # transfer · initial funding
    │
    ├── models/
    │   ├── user.model.js
    │   ├── account.model.js          # Exposes getBalance() via ledger aggregation
    │   ├── transaction.model.js      # Immutable after creation
    │   ├── ledger.model.js           # Immutable after creation
    │   └── blacklistModel.js
    │
    ├── routes/
    │   ├── auth.route.js
    │   ├── account.routes.js
    │   └── transaction.route.js
    │
    ├── middleware/
    │   └── auth.middleware.js        # JWT validation + blacklist check → attaches user to req
    │
    └── services/
        └── ledger.service.js         # Ledger entry creation with session propagation
```

---

## 📐 Architecture

The codebase follows a clean, layered separation of concerns with unidirectional data flow:

```
    HTTP Request
         │
         ▼
  ┌─────────────┐
  │   Routes    │  ← Domain-grouped, declarative
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Middleware  │  ← JWT validation, blacklist check
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Controllers │  ← HTTP handling, input validation, orchestration
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Services   │  ← Reusable business logic, session propagation
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Models    │  ← Mongoose schemas, domain rules, data access
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   MongoDB   │  ← Persistent store (sessions for atomicity)
  └─────────────┘
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1 — Clone & Install

```bash
git clone <repository-url>
cd bank-ledger
npm install
```

### 2 — Configure Environment

Create `src/.env` with the following:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ledger
JWT_SECRET=your-secret-key
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/ledger` |
| `JWT_SECRET` | Secret used to sign JWTs | `your-secret-key` |

### 3 — Start the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`

---

## 🔌 API Reference

All protected routes require a valid JWT — either via `Authorization: Bearer <token>` header or the `httpOnly` cookie set at login.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register a new user · Body: `{ name, email, password }` |
| `POST` | `/login` | Public | Authenticate · returns JWT + sets `httpOnly` cookie |
| `POST` | `/logout` | 🔒 Protected | Blacklist current token and clear cookie |

**Register**
```json
POST /api/auth/register
{
  "name": "Sarthak",
  "email": "sarthak@example.com",
  "password": "securepassword"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "sarthak@example.com",
  "password": "securepassword"
}
// Response sets httpOnly cookie + returns JWT
```

---

### Accounts — `/api/accounts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | 🔒 Protected | Create an account for the authenticated user |
| `GET` | `/` | 🔒 Protected | Retrieve account details |
| `GET` | `/:accountID/balance` | 🔒 Protected | Compute current balance from ledger aggregation |

**Get Balance**
```json
GET /api/accounts/:accountID/balance
// Response
{
  "accountId": "64f3a...",
  "balance": 15000.00,
  "currency": "INR"
}
```

---

### Transactions — `/api/transactions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | 🔒 Protected | Transfer between accounts |
| `POST` | `/initial` | 🔒 Protected | Add initial funds · creates a credit ledger entry |

**Transfer**
```json
POST /api/transactions
{
  "fromAccount": "64f3a...",
  "toAccount": "64f3b...",
  "amount": 5000,
  "idempotency": "txn-uuid-here"
}
```

---

## 🔄 Transfer Flow

A step-by-step walkthrough of what happens during a transfer:

```
  POST /api/transactions
         │
         ▼
  1. Validate fields & idempotency key
     └── Reject if duplicate idempotency key found
         │
         ▼
  2. Fetch sender & receiver accounts
     └── Verify both accounts exist and are active
         │
         ▼
  3. Compute sender balance via ledger aggregation
     └── Reject if insufficient funds
         │
         ▼
  4. Persist Transaction document  [status: pending]
         │
         ├──▶  5. Create immutable DEBIT ledger entry  (sender −amount)
         │
         ├──▶  6. Create immutable CREDIT ledger entry (receiver +amount)
         │
         ▼
  7. Update Transaction  [status: completed]
     ✅ Commit session     —  all or nothing
     ❌ Abort & rollback   —  on any failure
```

---

## 🔒 Security

| Mechanism | Implementation |
|---|---|
| **JWT Auth** | Tokens issued on login, signed with `JWT_SECRET`, transmitted via `httpOnly` cookies |
| **Token Blacklist** | Logout invalidates tokens — reuse after sign-out is rejected at middleware |
| **Idempotency Keys** | Every transaction carries a unique key — duplicate requests are safely deduplicated |
| **MongoDB Sessions** | All multi-document writes wrapped in sessions — full commit or full rollback |
| **Schema Validation** | Required fields, minimum amounts, and valid ObjectIds enforced at Mongoose model layer |

---

## 📊 Data Models

### User
```
{ name, email, password (hashed), createdAt }
```

### Account
```
{ userId (ref), accountNumber, status, createdAt }
getBalance() → aggregates ledger entries
```

### Transaction
```
{ fromAccount, toAccount, amount, idempotencyKey, status: pending|completed|failed, createdAt }
Immutable after creation
```

### Ledger Entry
```
{ transactionId (ref), accountId (ref), type: debit|credit, amount, createdAt }
Append-only — never updated or deleted
```

### Token Blacklist
```
{ token, createdAt (TTL-indexed for auto-expiry) }
```

---

## 📄 License

Open-source and free to use for learning and personal projects — MIT License.

---

> Built by **Sarthak** — MCA Student, Amity University Noida
