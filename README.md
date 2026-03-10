# Bank Ledger System

A ledger-based banking backend API built with Node.js, Express, and MongoDB. The service simulates financial transactions using double-entry ledger principles and enforces transactional safety, idempotency, and immutable ledger entries for accurate balance computation and auditability. The codebase implements RESTful endpoints for authentication, account management, and ledger transactions. See server and app wiring in `server.js` and `src/app.js` for entry points and routing.

---

## Project Overview

### Purpose

- Provide a backend API that models accounts and transactions using a ledger-first approach.
- Support reliable transfers, initial funding, and account balance calculation through ledger entries.

### Why Ledger Systems

- Ledger entries record every debit and credit, producing auditable trails.
- Double-entry ledgers simplify reconciliation and make balances derivable from entries.

### Architectural Goals

- Data consistency via MongoDB transactions (sessions) and immutable models.
- Transaction safety with idempotency keys and atomic commit/rollback.
- Scalability via stateless API layers and indexed models supporting aggregation.

---

## Features

- User authentication using JWT with cookie support and token blacklist for logout.
- Account creation and retrieval endpoints.
- Ledger-based transaction system with immutable ledger entries.
- Atomic transactions using MongoDB sessions to commit or abort multi-step operations.
- Idempotent transaction processing via `idempotencyKey` on transactions.
- Balance calculation derived from ledger aggregates on the Account model.
- Middleware-based request authentication that verifies JWT and checks blacklist.
- RESTful API architecture with grouped routes for auth, accounts, and transactions.

---

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- cookie-parser
- dotenv

Dependency list visible in `package.json`.

---

## Project Architecture

The code follows a layered architecture:

**Controllers** — Handle HTTP requests, perform validation, and orchestrate service calls.

**Models** — Mongoose schemas for User, Account, Transaction, Ledger, and Blacklist. Account exposes a `getBalance` method backed by ledger aggregation. Ledger and Transaction models prevent modification after creation.

**Routes** — Domain-grouped routers mount under `/api/auth`, `/api/accounts`, and `/api/transactions`.

**Middleware** — Authentication middleware verifies JWT, checks blacklist, and attaches the user to `req`.

**Services** — Reusable business logic for ledger operations; ledger entries are created via a service to allow session propagation.

**Configuration** — Database connection and environment-driven configuration are centralized under `src/config`.

---

## Project Structure

```
server.js                      # Application entry, loads environment and starts server
src/
  app.js                       # Express app wiring and route mounting
  config/
    db.js                      # MongoDB connection
  controllers/
    auth.controllers.js        # register, login, logout
    account.controllers.js     # create/get account, get balance
    transaction.controller.js  # create transfer and initial funding
  models/
    user.model.js
    account.model.js
    transaction.model.js
    ledger.model.js
    blacklistModel.js
  routes/
    auth.route.js
    account.routes.js
    transaction.route.js
  middleware/
    auth.middleware.js         # JWT validation and blacklist check
  services/
    ledger.service.js          # Ledger entry creation helper
```

---

## Installation

1. Clone the repository.
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies.
   ```bash
   npm install
   ```

3. Configure environment variables (see below).

4. Start the server in development.
   ```bash
   npm run dev
   ```

Server startup wiring and graceful shutdown are implemented in `server.js`.

---

## Environment Variables

Place the following in `src/.env` or provide via environment:

| Variable | Description |
|---|---|
| `PORT` | HTTP port (e.g., `3000`) |
| `MONGO_URI` | MongoDB connection URI |
| `JWT_SECRET` | Secret used to sign JWTs |

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user. Expects `{ email, password, name }`. Returns user and JWT cookie. |
| `POST` | `/api/auth/login` | Authenticate a user. Expects `{ email, password }`. Returns JWT and sets cookie. |
| `POST` | `/api/auth/logout` | Invalidate current token via blacklist and clear cookie. Protected. |

### Accounts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/accounts` | Create an account for the authenticated user. Protected. |
| `GET` | `/api/accounts` | Retrieve the authenticated user's account details. Protected. |
| `GET` | `/api/accounts/:accountID/balance` | Return current balance computed via ledger aggregation. Protected. |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transactions` | Create a transfer between two accounts. Body: `{ fromAccount, toAccount, amount, idempotency }`. Uses MongoDB session and creates ledger debit and credit entries. Protected. |
| `POST` | `/api/transactions/initial` | Add initial funds to an account. Uses a session and creates a credit ledger entry. Protected. |

---

## Transaction Flow

Conceptual sequence for a transfer:

1. **Validation** — Verify required fields and idempotency key.
2. **Account verification** — Fetch sender and receiver; check status.
3. **Balance check** — Compute sender balance from ledger aggregation.
4. **Transaction creation** — Persist a Transaction document with status `pending` and `idempotencyKey`.
5. **Ledger debit entry** — Create immutable debit ledger entry linked to the transaction.
6. **Ledger credit entry** — Create immutable credit ledger entry for the receiver.
7. **Transaction completion** — Update transaction status to `completed` and commit the session; abort on error.

---

## Security

- JWT authentication with tokens set in `httpOnly` cookies and Authorization headers. Logout uses a token blacklist.
- Idempotency keys on transactions prevent duplicate processing.
- MongoDB transactions (sessions) ensure atomic multi-document updates.
- Input validation and model-level constraints (required fields, min amounts, ObjectId checks) are enforced in controllers and schemas.
