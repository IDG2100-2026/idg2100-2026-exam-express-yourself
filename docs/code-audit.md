# Code Audit — Full Project Review

> Generated 2026-05-28. Last verified 2026-05-28. Excludes `old-obligs/` and WebSocket game handlers (`betting-handler`, `game-handler`, `helpers`, `route-handler`). Covers backend and frontend.

---

## Status legend
- ✅ **FIXED**
- ⚠️ **PARTIALLY FIXED**
- ❌ **STILL OPEN**
- 🆕 **NEW FINDING**

---

## 🔴 Critical / Security

### 1. Password hashing is not secure ❌
**File:** `backend/src/utils/password-hash.js`

SHA-256 with a single static env-var salt. Every user with the same password produces the same hash. GPU-trivially brute-forceable. Must be replaced with bcrypt/Argon2id with per-user salts.

---

### 2. Auth endpoints have no rate limiting ⚠️
**Files:** `backend/src/routes/auth-routes.js`, `backend/server.js`

`/register`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email` all have per-route rate limiters. However `/sessions/token` (refresh → access token exchange) and `/sessions/current` (logout) have none.

**Structural issue:** The global `apiRateLimiter` applied at `server.js:42` does **not** cover `/api/auth/*` routes — `authRouter` is mounted at line 39, before the global limiter, so auth routes are exempt from it. The per-route limiters in `auth-routes.js` are the only protection.

---

### 3. Refresh token cookie missing `secure` and `sameSite` ❌
**File:** `backend/src/controllers/auth-controller.js:63`

Cookie is set without `secure: true` (transmits over plain HTTP) and without `sameSite` (CSRF-vulnerable). The `clearCookie` in `logoutUser` is also inconsistent — both should be updated together.

---

### 4. Password reset does not invalidate existing sessions 🆕
**File:** `backend/src/services/auth-service.js`

`resetPassword` updates the password and deletes the reset token but never calls `Session.deleteMany({ userId })`. An attacker who triggered the reset (or holds a stolen session) retains their session after the password is changed.

---

### 5. `verifyEmailService` silently returns success on invalid/expired tokens 🆕
**File:** `backend/src/services/auth-service.js`

When the verification token is not found or expired, the service does `if (!token) return;` — no error thrown. The controller then responds `200 OK` with `"Email verified successfully!"`. The user's email is not actually verified, but they receive a success response. Should throw a `BusinessLogicError`.

---

### 6. `getAllUsers` leaks email addresses via search filter 🆕
**File:** `backend/src/services/user-service.js`

The search filter includes `{ email: { $regex: filters.search } }` and the response includes full user documents without stripping `email`. Any caller can enumerate all email addresses one character at a time. The single-user endpoint correctly strips email for non-owners; `getAllUsers` does not apply the same projection.

---

## 🟠 Serious / Functional Bugs

### 7. `send()` called in Game.jsx but never defined 🆕 ❌
**File:** `frontend/src/pages/game/Game.jsx`

The betting controls (Bet, Raise, Match, Fold buttons) call `send(...)` on click. The `send` function existed only inside a commented-out WebSocket block. When `phase === "betting" && isPlayer`, clicking any betting button throws `ReferenceError: send is not defined`.

---

### 8. `AppearanceProvider` crashes on corrupted localStorage ❌
**File:** `frontend/src/providers/AppearanceProvider.jsx:15`

`JSON.parse(saved)` has no try/catch. It runs as the `useState` initializer — if localStorage contains malformed JSON, the entire app crashes on load. Wrap in try/catch and fall back to `defaultAppearance`.

---

### 9. `authorize("user")` locks admins out of gameplay ⚠️
**Files:** `backend/src/routes/tournament-routes.js`, `backend/src/routes/match-routes.js`

`joinTournament` and `leaveTournament` still use `authorize("user")` only — admins cannot participate as players. `recordResult` correctly includes `"admin"`.

---

### 10. `recordResult` has no ownership check ⚠️
**File:** `backend/src/routes/match-routes.js`

`PATCH /api/matches/:id/result` requires authentication but does not verify the caller is a participant in the match. Any authenticated user can set results for any match.

---

### 11. Tournament result reporting never updates the Match document ⚠️
**File:** `backend/src/services/tournament-service.js`

`reportMatchResult` saves the bracket sub-document result via `tournament.save()` but never updates the underlying `Match` document's `status` or `winnerId`. The real Match and tournament bracket remain out of sync.

---

### 12. `leaveTournament` has no status guard 🆕
**File:** `backend/src/services/tournament-service.js`

A player can leave a tournament with status `in-progress` or `completed`, potentially removing a player who already has ongoing matches in the bracket and corrupting bracket state.

---

### 13. Tournament shuffle is biased 🆕
**File:** `backend/src/services/tournament-service.js`

`participants.sort(() => 0.5 - Math.random())` is a well-known anti-pattern producing a non-uniform distribution. With real buy-ins, biased pairings are a fairness/integrity concern. Replace with Fisher-Yates.

---

### 14. Buy-in deducted in tournament rounds without a balance check ❌
**File:** `backend/src/services/tournament-service.js`

`$inc: { points: -matchBuyIn }` is applied unconditionally. If a player's points would go negative, the `User` schema's `min: 0` constraint fires a Mongoose validation error that crashes round advancement mid-tournament.

---

### 15. `AdminTournamentCreate` edit mode silently discards most fields ❌
**File:** `frontend/src/pages/admin/tournament-create/AdminTournamentCreate.jsx`

In edit mode only `title`, `description`, `rules`, and `startDate` are submitted. `rounds`, `timeControl`, `buyIn`, `eloMin/Max`, and `trophyTitle/Image` are hidden from the form and silently discarded on save.

---

### 16. Multer file type check is spoofable ❌
**File:** `backend/src/middlewares/upload.js`

Only `file.mimetype` (a client-supplied header) is checked. An attacker can upload any file with `Content-Type: image/png`. Should validate magic bytes with a library like `file-type`.

---

### 17. Uploaded files have no extension ❌
**File:** `backend/src/middlewares/upload.js`

Multer's `dest: "uploads/"` stores files without extensions. Browsers cannot infer MIME type from the filename, so images may not display correctly.

---

### 18. Seed script log message uses wrong password ⚠️
**File:** `backend/scripts/seed.js`

The hashing algorithm matches production — seeded users **can** log in. However `seed.js:273` logs `"login with any email + 'password123'"` when the actual seeded password is `Password123!` (capital P, exclamation mark).

---

## ✅ Confirmed Fixed

| Issue | Evidence |
|-------|----------|
| `registerUser` always returned `undefined` | `return newUser` added in `auth-service.js` |
| `passwordReset.js` broken `import { ref } from "process"` | Removed; now imports from `crypto` and `auth-config` |
| Circular dependency: `auth-controller` ↔ `auth-service` | `getAccessToken` moved to `utils/jwt.js`; both import from there |
| Email exposed in public profile endpoint | Owner/admin check added in `user-service.js` |
| `express.static` uses relative path | `path.join(import.meta.dirname, "uploads")` in `server.js` |
| Leaderboard `straightsAllowed` filter inverted | Logic corrected in `leaderboard-service.js` |
| Profile page success message never shows | `setSaveSuccess("Email updated successfully")` and `"Password changed successfully"` added; rendered in JSX |
| `loadMoreGames` has no error handling | `.catch((err) => setGamesError(err.message))` and `.finally()` added |
| `match-controller.js` debug `console.log` left in production | Removed |
| Dead imports in `auth-controller.js` (`TokenVerification`, `sendVerificationMail`) | Removed |
| Dead imports in `auth-routes.js` (`authenticate`, `authorize`) | Removed |
| `ResetPassword.jsx` imported from `"react-router"` instead of `"react-router-dom"` | Fixed |
| `Game.jsx` WebSocket hardcoded port `3000` | Now uses `VITE_WS_URL` env variable |

---

## 🟡 Dead Code

| File | What's dead |
|------|-------------|
| `frontend/src/services/activity-service.js` | `getActivity()` — exported but never imported anywhere |
| `frontend/src/components/Game-board/GameBoard.jsx` | Entire component — never imported by any page |
| `frontend/src/hooks/useWebSockets.js` | `useGameWebSocket` — only consumed by the dead `GameBoard.jsx` |
| `frontend/src/services/comments-service.js` | `createComment` — exported but no caller found anywhere (`getAllComments` and `deleteComment` are live) |
| `frontend/src/providers/AuthProvider.jsx` | `const [error, setError]` — never set, never exposed in context |
| `frontend/src/components/web-components/dice-poker-board.js` | `_startNewMatch()` — defined but never called internally or externally |
| `frontend/src/pages/all-games/AllGames.jsx` | Route registered in `App.jsx` but no navigation link points to it |
| `frontend/src/pages/login/Login.jsx` | `setSearchParams` destructured but never called |
| `frontend/src/pages/ResetPassword/ResetPassword.jsx` | `setSearchParams` destructured but never called |
| `frontend/src/main.jsx` | `StrictMode` imported but app is not wrapped in it |

---

## 🔵 Minor / Polish

- **`backend/src/controllers/auth-controller.js:44`** ❌ — `resetPasswordController` returns `201 Created` instead of `200 OK`. Also a typo: `"Password has been changes successfully"` → `"changed"`.
- **`backend/src/config/db.js:12`** ❌ — `console.log("Connecting to MongoDB...", MONGODB_URI)` could log credentials if the URI ever includes a username/password.
- **`backend/scripts/seed.js:13`** ❌ — Same issue: logs the full `MONGODB_URI` to console.
- **`backend/src/config/auth-config.js`** ❌ — `REFRESH_TOKEN_TTL` is in milliseconds; `ACCESS_TOKEN_TTL` and `VERIFICATION_TOKEN_TTL` are in seconds. No units in the names — easy to misuse one in the wrong context.
- **`backend/src/models/passwordReset.js`** ❌ — Reuses `VERIFICATION_TOKEN_TTL` for the password reset TTL. These should be separate constants so a change to one does not silently affect the other.
- **`backend/src/services/elo-service.js:42`** ❌ — K-factor `32` is a bare magic number. Should be a named constant with a comment explaining the choice.
- **`frontend/src/pages/game/Game.jsx`** ❌ — 3 active `console.log`/`console.error` calls at lines ~181, 186, 189.
- **`frontend/src/pages/tournament/Tournament.jsx`** ❌ — 3 active `console.log`/`console.error` calls at lines ~185, 190, 193.
- **`frontend/src/layouts/admin-layout/AdminLayout.jsx`** ❌ — Two separate `import` lines from `"react-router-dom"` on consecutive lines — should be merged into one.
- **`frontend/src/pages/about-game/AboutGame.jsx`** ❌ — Describes dice as `"9, 10, Jack, Queen, King and Ace"` — verify this matches the actual game implementation.
- **`frontend/src/pages/ResetPassword/ResetPassword.jsx`** ❌ — A blank `<p></p>` is always rendered before any submission attempt (error starts as `null` but the paragraph element is unconditionally present).
- **`frontend/src/pages/login/Login.jsx`** ❌ — `useEffect` reads `searchParams` but it is missing from the dependency array (`[]`).
- **`frontend/src/pages/profile/Profile.jsx`** ❌ — Bio-only saves have no success feedback. `setSaveSuccess` is only called on email or password changes — a user who only updates their bio sees no confirmation.
