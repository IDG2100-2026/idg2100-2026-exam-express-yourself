# Code Audit — Full Project Review

> Re-audited 2026-05-31 (pass 2). Targeted agents reviewed all changes from the last 3 commits: unban/unmakeAdmin backend+frontend, websocket cleanup, auth-service IP logging, admin UI refactor. Previous baseline: 2026-05-31 (pass 1). Excludes `old-obligs/`.

---

## Status legend
- ✅ **FIXED**
- ⚠️ **PARTIALLY FIXED**
- ❌ **STILL OPEN**
- 🆕 **NEW FINDING**

---

## 🔴 Critical / Security

### 1. JWT_SECRET undefined silently forges all tokens ❌
**File:** `backend/src/utils/jwt.js:5`

`JWT_SECRET` is read once at module load from `process.env`. If the variable is missing, `jwt.sign`/`jwt.verify` receive `undefined` and silently fall back to the string `"undefined"` as the secret. Any attacker who discovers this pattern can forge valid tokens for any `userId` and `role`.

**Fix:** Add `if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");` immediately after line 5. Use a plain `Error`, not `BusinessLogicError` — this is a startup crash, not an HTTP response.

---

### 2. WebSocket connections are not authenticated ❌
**File:** `backend/src/websockets/websocket.js:10`

The WebSocket server accepts all connections without verifying any JWT. Any unauthenticated client can connect, receive comment history, and post comments attributed to any user ID they supply. The fix was discussed but never committed.

---

### 3. WebSocket comment author is client-supplied ❌
**File:** `backend/src/websockets/websocket.js:48`

`createComment(data.authorId, ...)` trusts the `authorId` field sent in the message payload. Since there is no authentication on the connection (finding #2), any client can post a comment as any user.

---

### 4. Ban check after password check leaks password validity 🆕
**File:** `backend/src/services/auth-service.js:69`

`authenticateUser` checks the password first, then `isBanned`. A banned user who supplies the wrong password gets `"Invalid credentials"`; the same user with the correct password gets `"Account is banned"`. The different responses confirm whether the banned account's password was correct.

**Fix:** Check `isBanned` before verifying the password, or return the same generic error in both cases.
> FIXED
---

### 5. JSON.parse in WebSocket message handler has no try/catch ❌
**File:** `backend/src/websockets/websocket.js:43`

`JSON.parse(message)` is called outside any try/catch. A malformed frame from any client throws a `SyntaxError` before the inner try block, propagates as an unhandled rejection, and leaves the socket open but broken.

---

## 🟠 Serious / Functional Bugs

### 6. unMakeAdmin has no last-admin guard 🆕
**File:** `backend/src/services/user-service.js:231`

`unMakeAdmin` sets `role = "user"` with no check for whether this is the final admin in the system. If the last admin demotes themselves (or another admin does it via the API), the system is left with zero admins and no recovery path through the API.

**Fix:** Count admins before demoting: `const adminCount = await User.countDocuments({ role: "admin" }); if (adminCount <= 1) throw new BusinessLogicError("Cannot remove the last admin", 400);`

---

### 7. unMakeAdmin has no self-demotion guard 🆕
**File:** `backend/src/services/user-service.js:231`, `backend/src/routes/user-routes.js:52`

The `unMakeAdmin` service does not compare the target `userId` against the calling admin's `req.userId`. An admin can demote themselves via `POST /api/users/:id/unmake-admin`. Their token still claims `role: "admin"` until it expires, creating an inconsistent state.

---

### 8. AdminUsers username guard is fragile and incomplete 🆕
**File:** `frontend/src/pages/admin/users/AdminUsers.jsx:192`

The guard `user.username !== "admin"` hides the make/un-make admin buttons only for the account with the literal username `"admin"`. Any admin with a different username (e.g. `"superuser"`) sees the button on their own row and can un-make-admin themselves. The correct guard is `user._id !== currentUser._id`.

---

### 9. Tournament buy-in not deducted when a user joins ❌
**File:** `backend/src/services/tournament-service.js:179`

`joinTournament` checks `user.points >= tournament.buyIn` but never deducts. Deduction only happens at round start, so a user can join multiple tournaments simultaneously exceeding their balance.

---

### 10. Buy-in deducted in rounds without a balance check ❌
**File:** `backend/src/services/tournament-service.js:343`

`$inc: { points: -matchBuyIn }` is applied via `findByIdAndUpdate` without `runValidators: true`, bypassing Mongoose's `min: 0` constraint and allowing points to go negative.

---

### 11. reportMatchResult never updates the Match document ❌
**File:** `backend/src/services/tournament-service.js:319`

`reportMatchResult` sets the winner on the bracket sub-document but never updates the actual `Match` record's `winnerId` or `status`. The match stays `status: 'waiting'` indefinitely.

---

### 12. Second 401 after token refresh not handled ❌
**File:** `frontend/src/api.js:59`

After a successful refresh, if the retried request returns 401 again, `clearAccessToken()` is never called and `auth-expired` is never dispatched — the user stays stuck in a broken authenticated state.

---

### 13. leaveTournament has no status guard ❌
**File:** `backend/src/services/tournament-service.js:192`

A player can leave a tournament with `status: 'in-progress'` or `'completed'`, orphaning bracket entries that still reference their ID.

---

### 14. updateTournament has no status guard ❌
**File:** `backend/src/services/tournament-service.js:490`

An admin can modify `numberOfRounds` or `category` on a live tournament. Reducing `numberOfRounds` below `currentRound` causes the next result report to immediately declare the tournament finished with wrong win counts.

---

### 15. deleteTournament does not clean up Match documents ❌
**File:** `backend/src/services/tournament-service.js:547`

Deleting a tournament leaves all associated `Match` documents with a dangling `tournamentId` reference.

---

### 16. Refresh token cookie missing `secure` and `sameSite` ⚠️
**File:** `backend/src/controllers/auth-controller.js:76`

`httpOnly: true` and a scoped `path` are set. `secure: true` and `sameSite` are absent, leaving the cookie transmittable over plain HTTP and vulnerable to CSRF.

---

### 17. Multer file type check is spoofable ❌
**File:** `backend/src/middlewares/upload.js:9`

Only the client-supplied `mimetype` header is checked — no magic-byte inspection.

---

### 18. Tournament shuffle is biased ❌
**Files:** `backend/src/services/tournament-service.js:225`, `:332`

Both round-1 and next-round pairing use `sort(() => 0.5 - Math.random())`, a known non-uniform distribution. Replace with Fisher-Yates.

---

### 19. resendVerifyEmail sends to already-verified users and has no input validation ❌
**Files:** `backend/src/services/auth-service.js:51`, `backend/src/controllers/auth-controller.js:39`

No `isVerified` guard and no express-validator middleware on the route. `email: undefined` causes `User.findOne({ email: undefined })`.

---

### 20. Logout route shares the token-refresh rate limiter ❌
**File:** `backend/src/routes/auth-routes.js:73`

`DELETE /sessions/current` uses `sessionTokenLimiter` (10 req/min), the same limiter as token refresh. An attacker who exhausts the window can prevent the victim from logging out.

---

### 21. Uploaded files stored without extension ❌
**File:** `backend/src/middlewares/upload.js:6`

Multer's `dest: "uploads/"` stores files without extensions. Browsers cannot determine MIME type from filename.

---

### 22. db.js and seed.js log the MongoDB URI in plaintext ❌
**Files:** `backend/src/config/db.js:12`, `backend/scripts/seed.js:13`

Both log the full connection URI. Strip credentials before logging.

---

### 23. Sound implementation incomplete ❌
No audio files, no `Audio` objects, no event hooks in game components. README requires sounds for round start/end, dice rolls, holds, and game end.

---

### 24. Board background color not applied to web component ❌
**Files:** `frontend/src/components/appearance-menu/AppearanceMenu.jsx`, `frontend/src/components/web-components/dice-poker-board.js:406`

The chosen `boardColor` is never passed to the web component as a CSS custom property on the host element; the board background is hardcoded.

---

### 25. No game state restoration on page reload ❌
**File:** `frontend/src/components/web-components/dice-poker-board.js`

All web component state is in-memory. A browser refresh wipes all game state. README explicitly requires state restoration.

---

### 26. Web components missing disconnectedCallback ❌
**Files:** `frontend/src/components/web-components/dice-poker-board.js`, `dice-poker-die.js`

Shadow DOM listeners are never removed on unmount. `DicePokerDie` also has an active `_rollTimer` that can fire on a disconnected element.

---

## 🟡 Minor / Polish

- **`frontend/src/pages/admin/users/AdminUsers.jsx:18`** 🆕 — `const [disabledBtn] = useState(true)` is declared but never referenced. Dead state.
- **`frontend/src/pages/admin/users/AdminUsers.jsx:14`** 🆕 — `setLimit` is never called anywhere; `limit` is permanently 10. Dead setter masquerading as configurable state.
- **`backend/src/controllers/user-controller.js:75`** 🆕 — Double "not" typo: `"is not not an admin anymore"`. Should be `"is no longer an admin"`.
- **`frontend/src/pages/profile/Profile.jsx:322`** — Unconditional access to `opponent.username` crashes with `TypeError` when a match has fewer than 2 players. Use optional chaining: `opponent?.username`.
- **`frontend/src/pages/profile/Profile.jsx:121`** — `handleSave` replaces the entire `formData` with `{ password: '', newPassword: '' }` after a password change, corrupting `username`, `email`, and `bio`.
- **`frontend/src/pages/tournament/Tournament.jsx:411`** — Live-matches list uses array index as React `key`. Use a stable match ID instead.
- **`frontend/src/pages/login/Login.jsx:32`** ❌ — `useEffect` reads `searchParams` but has an empty dependency array.
- **`frontend/src/pages/all-games/AllGames.jsx`** ❌ — Route registered but reachable only from the Profile page; no main nav link.
- **`frontend/src/pages/profile/Profile.jsx:99-109`** ⚠️ — `setSaveSuccess` not called when saving bio or avatar only.
- **`backend/src/services/elo-service.js:42`** ❌ — K-factor `32` is a bare magic number.
- **`backend/scripts/seed.js:273`** ⚠️ — Log says `'password123'`; actual seeded password is `Password123!`.
- **`frontend/src/pages/game/Game.jsx:173`** — TODO comment left in production code on the "Back to lobby" button.

---

## 🔵 Dead Code

| File | What's dead | Status |
|------|-------------|--------|
| `frontend/src/providers/AuthProvider.jsx` | `const [error, setError]` — set in catch block but never exposed or rendered | ❌ |
| `frontend/src/services/activity-service.js` | `getActivity()` — exported but never imported | ❌ |
| `frontend/src/hooks/useWebSockets.js` | `useGameWebSocket` — exported but never imported by any component | ❌ |
| `frontend/src/layouts/admin-layout/AdminLayout.jsx:1-2` | Two consecutive `import` lines from `"react-router-dom"` | ❌ |
| `frontend/src/pages/admin/users/AdminUsers.jsx:18` | `disabledBtn` state — declared, never used | 🆕 |

---

## ✅ Confirmed Fixed

| Issue | Evidence |
|-------|----------|
| Password hashing not secure (SHA-256 + static salt) | Replaced with bcrypt/crypto with per-user salts |
| `/sessions/token` and `/sessions/current` had no rate limiting | Per-route `sessionTokenLimiter` added to auth routes |
| IP-mismatch incident not logged during token refresh | `logIncident` call added in `createAccessTokenService` |
| Banned users could bypass ban via token refresh | `isBanned` check added in `createAccessTokenService` |
| Security incidents endpoint lacked admin authorization | `authorize("admin")` middleware added |
| `Login.jsx` crashed on email verification (`setLoading` undefined) | State now correctly uses `setIsLoading` |
| `AdminDashboard.jsx` crashed rendering incidents (`inc` undefined) | Loop variable corrected |
| `resetPasswordController` returned `201 Created` for an update | Changed to `200 OK` |
| `passwordReset.js` field named `expireAt` (missing 's') | Renamed to `expiresAt` |
| endGame + recordResult double ELO/points race | `route-handler.js` and `betting-handler.js` deleted |
| Missing awaits in endRound/handleRoll causing stale DB writes | `route-handler.js` and `game-handler.js` deleted |
| Admins could not be unbanned | `unBannUser` service + route + controller added |
| Admins could not have admin role removed | `unMakeAdmin` service + route + controller added |
| Game.jsx comment key used array index | Fixed to use `message._id` |
| `registerUser` always returned `undefined` | `return newUser` added |
| `passwordReset.js` broken import | Now imports from `crypto` and `auth-config` |
| Circular dependency: `auth-controller` ↔ `auth-service` | `getAccessToken` moved to `utils/jwt.js` |
| Email exposed in public profile endpoint | Owner/admin check added in `user-service.js` |
| `express.static` used relative path | `path.join(import.meta.dirname, "uploads")` in `server.js` |
| Leaderboard `straightsAllowed` filter inverted | Logic corrected in `leaderboard-service.js` |
| `loadMoreGames` had no error handling | `.catch` and `.finally` added |
| Dead imports in `auth-controller.js` and `auth-routes.js` | Removed |
| `Game.jsx` WebSocket hardcoded port `3000` | Now uses `VITE_WS_URL` env variable |
| Password reset did not invalidate existing sessions | `Session.deleteMany({ userId })` added |
| `verifyEmailService` silently succeeded on invalid tokens | Now throws `BusinessLogicError` |
| `AppearanceProvider` crashed on corrupted localStorage | `JSON.parse` wrapped in try/catch |
| `AdminTournamentCreate` edit mode discarded most fields | All fields now loaded and submitted |
| Blank `<p></p>` always rendered in `ResetPassword.jsx` | Conditional rendering fixed |
| `main.jsx` app not wrapped in `StrictMode` | `StrictMode` now wraps `<App />` |
| Token TTL unit inconsistency | `REFRESH_TOKEN_TTL` in ms, JWT values in seconds |
