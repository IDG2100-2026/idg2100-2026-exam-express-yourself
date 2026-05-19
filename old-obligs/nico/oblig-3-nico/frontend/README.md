# PokerDados — Spanish Poker Dice Platform

Front-end for the Spanish Poker Dice platform, built with React and Vite.
Developed as Obligatory Assignment 3 for IDG2100 at NTNU by Nicolai Buseth.

---

## Requirements

- Node.js (v18 or newer)
- MongoDB running locally or a MongoDB Atlas connection string
- The backend from this same repository must be running before starting the frontend

---

## Installation and Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```
MONGODB_URI=mongodb://localhost:27017/pokerdados
PORT=3000
JWT_SECRET=somesecret
```

Seed the database with dummy data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The backend runs on `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## Seed Users

All seed users have the password: `password123`

| Username | Email | Role | Elo |
|----------|-------|------|-----|
| admin | admin@test.com | admin | 1200 |
| nicolai | nicolai@test.com | user | 1100 |
| aliaksei | aliaksei@test.com | user | 1050 |
| carlos | carlos@test.com | user | 980 |

---

## Notes

- Appearance preferences (theme, board color, sound, lobby size) are saved to both localStorage and the backend for registered users
- Anonymous users can browse and view games but cannot create games or leave comments
- Real-time gameplay and WebSocket features are out of scope for this sprint
