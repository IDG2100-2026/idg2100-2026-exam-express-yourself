# Spanish Poker Dice — Backend

Backend carried over from Oblig 2. The following changes were made to support the frontend:

**`src/models/User.js`** — added three new fields to the user schema: `appearance` (stores theme, board colour, sound, and lobby size preferences), `bio` (short profile description, max 300 characters), and `profileImageUrl` (URL to the user's profile image).

**`src/controllers/userController.js`** — extended `PATCH /api/users/:id` to accept and save `bio`, `profileImageUrl`, and `appearance`. Passwords are now properly hashed with bcrypt before saving, which was missing in the original implementation.

**`src/controllers/matchController.js`** — added `?status=` and `?playerId=` query parameters to `GET /api/matches` so the frontend can filter matches by status or by player. Results are now sorted by `updatedAt` descending. Also added `profileImageUrl` to the populate fields on both `GET /api/matches` and `GET /api/matches/:id`.

**`src/middlewares/authMiddleware.js`** — added MongoDB ObjectId validation on the `x-user-id` header. If the value is not a valid ObjectId, the request is treated as anonymous to prevent database errors.

**`app.js`** — removed the `express-rate-limit` middleware, as the 100-requests-per-15-minutes limit was being hit during local development.
