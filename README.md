# 🏦 Bank Ledger System

> A production-grade banking backend API built on **double-entry ledger principles** — engineered for auditability, transactional safety, and financial consistency.

Built with **Node.js · Express · MongoDB**

---

## 📌 Overview

The Bank Ledger System is a RESTful backend that models accounts and financial transactions using a ledger-first approach. Every debit and credit is recorded as an immutable ledger entry — making balances fully derivable, reconciliation straightforward, and audit trails complete by design.

### Why Ledger-First?

Traditional balance fields are mutable and lossy. A ledger-based model instead treats every financial event as a permanent record. Balances are *computed* from the ledger, never stored directly — eliminating entire classes of inconsistency.

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

- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — MongoDB + Mongoose
- **Auth** — JSON Web Tokens (JWT) + cookie-parser
- **Config** — dotenv

---

## 🗂️ Project Structure

```
bank-ledger/
│
├── server.js                        # Entry point — env loading, server startup & graceful shutdown
└── src/
    ├── app.js                       # Express wiring and route mounting
    │
    ├── config/
    │   └── db.js                    # MongoDB connection
    │
    ├── controllers/
    │   ├── auth.controllers.js      # register · login · logout
    │   ├── account.controllers.js   # create/get account · get balance
    │   └── transaction.controller.js # transfer · initial funding
    │
    ├── models/
    │   ├── user.model.js
    │   ├── account.model.js         # Exposes getBalance() via ledger aggregation
    │   ├── transaction.model.js     # Immutable after creation
    │   ├── ledger.model.js          # Immutable after creation
    │   └── blacklistModel.js
    │
    ├── routes/
    │   ├── auth.route.js
    │   ├── account.routes.js
    │   └── transaction.route.js
    │
    ├── middleware/
    │   └── auth.middleware.js       # JWT validation + blacklist check → attaches user to req
    │
    └── services/
        └── ledger.service.js        # Ledger entry creation with session propagation
```

---

## ⚙️ Getting Started

### 1 — Clone & Install

```bash
git clone <repository-url>
cd bank-ledger
npm install
```

### 2 — Configure Environment

Create `src/.env` with the following:

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/ledger` |
| `JWT_SECRET` | Secret used to sign JWTs | `your-secret-key` |

### 3 — Start the Server

```bash
npm run dev
```

---

## 🔌 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user · Body: `{ name, email, password }` |
| `POST` | `/login` | Authenticate · returns JWT + sets `httpOnly` cookie |
| `POST` | `/logout` | Blacklist current token and clear cookie · 🔒 Protected |

### Accounts — `/api/accounts`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create an account for the authenticated user · 🔒 Protected |
| `GET` | `/` | Retrieve account details · 🔒 Protected |
| `GET` | `/:accountID/balance` | Compute current balance from ledger aggregation · 🔒 Protected |

### Transactions — `/api/transactions`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Transfer between accounts · Body: `{ fromAccount, toAccount, amount, idempotency }` · 🔒 Protected |
| `POST` | `/initial` | Add initial funds to an account · creates a credit ledger entry · 🔒 Protected |

---

## 🔄 Transfer Flow

A step-by-step walkthrough of what happens during a transfer:

```
  POST /api/transactions
         │
         ▼
  1. Validate fields & idempotency key
         │
         ▼
  2. Fetch sender & receiver accounts — verify both are active
         │
         ▼
  3. Compute sender balance via ledger aggregation
         │
         ▼
  4. Persist Transaction document  [status: pending]
         │
         ├──▶  5. Create immutable DEBIT ledger entry  (sender)
         │
         ├──▶  6. Create immutable CREDIT ledger entry (receiver)
         │
         ▼
  7. Update Transaction  [status: completed]
     Commit session  ✓  —  or abort & rollback on any error  ✗
```

---

## 🔒 Security

- **JWT** tokens issued on login, transmitted via `httpOnly` cookies and `Authorization` headers.
- **Token blacklist** invalidates sessions on logout — tokens cannot be reused after sign-out.
- **Idempotency keys** on every transaction prevent duplicate processing from retries.
- **MongoDB sessions** wrap all multi-document operations — either everything commits or nothing does.
- **Model-level constraints** enforce required fields, minimum amounts, and valid ObjectIds at the schema layer.

---

## 📐 Architecture

The codebase follows a clean, layered separation of concerns:

- **Controllers** — Handle HTTP, validate input, orchestrate service calls.
- **Services** — Encapsulate reusable business logic (ledger operations, session propagation).
- **Models** — Mongoose schemas with domain rules enforced at the data layer.
- **Routes** — Domain-grouped routers; each resource owns its route file.
- **Middleware** — Cross-cutting concerns (auth, blacklist checking) applied declaratively.
- **Config** — Environment-driven DB connection, fully centralized under `src/config`.

---

## 📄 License

Open-source and free to use for learning and personal projects.
