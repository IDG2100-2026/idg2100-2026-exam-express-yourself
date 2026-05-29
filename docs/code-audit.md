# Code Audit — Full Project Review

> Re-audited 2026-05-29 (previous baseline: 2026-05-28). Five parallel agents reviewed backend auth/security, game/tournament logic, infrastructure, frontend pages, and frontend state/services. Excludes `old-obligs/`.

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

### 2. `/sessions/token` and `/sessions/current` have no rate limiting ❌
**Files:** `backend/src/routes/auth-routes.js:71-72`, `backend/server.js:39-42`

The refresh-token and logout endpoints have no per-route rate limiter. Worse: the global `apiRateLimiter` (server.js line 42) is mounted **after** `authRouter` (line 39), so `/api/auth/*` routes are entirely exempt from it.

---

### 3. WebSocket connections are not authenticated 🆕
**File:** `backend/src/websockets/websocket.js:10-18`

The WebSocket server accepts connections without verifying a JWT. Any unauthenticated client can join game rooms and receive real-time game state. All HTTP game routes require `authenticate` middleware; the WebSocket path does not.

---

### 4. WebSocket messages have no ownership validation 🆕
**File:** `backend/src/websockets/game-handler.js:6-39`

All game-action handlers (roll, hold, bet, raise, fold, match) trust the `userId` field sent in the message payload. The server never verifies that the socket's authenticated identity matches the claimed `userId`. A malicious client can act as another player by spoofing their user ID.

---

### 5. `recordResult` has no ownership check ❌
**File:** `backend/src/routes/match-routes.js:29`, `backend/src/services/match-service.js:292-362`

`PATCH /api/matches/:id/result` accepts `authorize("user", "admin")`. Any authenticated user — not just match participants — can set the result for any match. Should be restricted to match participants or admins only.

---

### 6. `Login.jsx` crashes on email verification — `setLoading` is never defined 🆕
**File:** `frontend/src/pages/login/Login.jsx:27`

When a verification code is present in the URL, `setLoading(false)` is called (line 27) but `setLoading` is never declared as a state setter. This throws `ReferenceError: setLoading is not defined` and crashes the page for any user arriving via a verification link.

---

### 7. `AdminDashboard.jsx` crashes when rendering security incidents 🆕
**File:** `frontend/src/pages/admin/dashboard/AdminDashboard.jsx:69`

The loop variable is `incident` but line 69 references `inc.userId`. This throws `ReferenceError: inc is not defined` every time the security incidents list renders, crashing the admin dashboard.

---

### 8. `DicePokerBoard` event listeners accumulate without cleanup 🆕
**File:** `frontend/src/components/web-components/dice-poker-board.js:36-90`

`_setupDice()` is called in `connectedCallback()`, after each match ends, and in `_startNewMatch()`. Each call adds click/event listeners to dice without first removing the previous set. There is no `disconnectedCallback()` to release listeners. As a user plays multiple rounds the listener count grows exponentially, causing a severe memory leak.

---

### 9. `GameBoard.jsx` calls `updateState()` which does not exist on the web component 🆕
**File:** `frontend/src/components/Game-board/GameBoard.jsx:32,42,49,57,64,72`

`GameBoard` calls `board.updateState({ ... })` at six locations, but `DicePokerBoard` has no `updateState()` method — only `autoRoll()`, `setTurn()`, and `resetRound()`. Every call throws `TypeError: board.updateState is not a function`.

---

### 10. Token refresh race condition in `api.js` 🆕
**File:** `frontend/src/api.js:49-59`

Multiple concurrent 401 responses all invoke `refreshAccessToken()` in parallel. There is no queuing mechanism to pause in-flight requests while the first refresh completes. This results in redundant backend refresh calls and can cause subsequent requests to retry with a stale token before the refresh resolves.

---

### 11. IP-mismatch incident not logged during token refresh 🆕
**File:** `backend/src/services/auth-service.js:117-136`

When a session IP mismatch is detected during token refresh, the session is deleted and a 401 is thrown, but `logIncident(...)` is **not called**. The auth middleware correctly logs IP-change incidents for protected routes; the token-refresh path does not. The admin dashboard will miss a category of security events that the README explicitly requires.

---

## 🟠 Serious / Functional Bugs

### 12. Banned users can bypass the ban via token refresh 🆕
**File:** `backend/src/services/auth-service.js:117-136`

`createAccessTokenService` looks up the user but never checks `user.isBanned`. A user banned after login retains access until their refresh token expires. Add `if (user.isBanned) { await session.deleteOne(); throw ... }` after the user lookup.

---

### 13. Tournament buy-in not deducted when a user joins 🆕
**File:** `backend/src/services/tournament-service.js:144-186`

When a user joins a tournament no points are deducted — funds are only subtracted when matches are created at round start. The README requires users to have enough points for the buy-in to join. Without an up-front deduction, a user can join multiple tournaments simultaneously exceeding their balance.

---

### 14. Tournament result reporting never updates the Match document ⚠️
**File:** `backend/src/services/tournament-service.js:281-438`

`reportMatchResult` sets the winner on the bracket sub-document but never updates `Match.status` or `Match.winnerId`. The real Match remains `in-progress` indefinitely, breaking game history and leaderboard stats.

---

### 15. `leaveTournament` has no status guard ❌
**File:** `backend/src/services/tournament-service.js:190-202`

A player can leave a tournament with status `in-progress` or `completed`, potentially corrupting bracket state mid-tournament. Should block leaving once the tournament has started.

---

### 16. Tournament shuffle is biased ❌
**File:** `backend/src/services/tournament-service.js:229, 336`

`participants.sort(() => 0.5 - Math.random())` is a known non-uniform distribution. Both round-1 and subsequent-round pairing use this. Replace with Fisher-Yates for fair random pairings.

---

### 17. Buy-in deducted in tournament rounds without a balance check ❌
**File:** `backend/src/services/tournament-service.js:244-245, 347-348`

`$inc: { points: -matchBuyIn }` is applied unconditionally. If the player's balance is less than `matchBuyIn` the Mongoose `min: 0` constraint fires a validation error mid-round, crashing round advancement.

---

### 18. `endGame` (WebSocket) and `recordResult` (REST) can both complete the same match 🆕
**File:** `backend/src/websockets/route-handler.js:84-120`, `backend/src/services/match-service.js:338-359`

Both paths update match status and recalculate ELO independently. If both execute concurrently (e.g., a REST call races with the WebSocket end event), ELO is updated twice and points are awarded twice.

---

### 19. Global rate limiter bypassed by auth routes 🆕
**File:** `backend/server.js:39-42`

`authRouter` is mounted at line 39; the global `apiRateLimiter` is applied at line 42. Because Express processes routes in order, requests to `/api/auth/*` are fully handled before reaching the limiter. Auth routes only have per-route limiters on some endpoints.

---

### 20. Multer file type check is spoofable ❌
**File:** `backend/src/middlewares/upload.js:8-14`

Only `file.mimetype` (a client-supplied header) is checked. Any file can be uploaded with `Content-Type: image/png`. Validate magic bytes with a library such as `file-type`.

---

### 21. Uploaded files stored without file extension ❌
**File:** `backend/src/middlewares/upload.js:6`

Multer's `dest: "uploads/"` stores files without extensions. Browsers cannot determine the MIME type from the filename, so avatar images may not render. Combined with issue 20, this also raises the risk of serving malicious files.

---

### 22. `db.js` and `seed.js` log `MONGODB_URI` in plaintext ❌
**Files:** `backend/src/config/db.js:12`, `backend/scripts/seed.js:13`

Both log the full connection URI to the console. If the URI includes credentials they will appear in logs. Strip credentials before logging.

---

### 23. Sound implementation incomplete 🆕
**Files:** `frontend/src/providers/AppearanceProvider.jsx`, web components

The appearance context exposes a `sound` toggle and the menu renders an on/off control, but there are no audio files, no `Audio` objects, and no event hooks in the game components. The README requires sounds for round start/end, dice rolls, holds, and game end.

---

### 24. Board background color setting not applied to web components 🆕
**Files:** `frontend/src/components/appearance-menu/AppearanceMenu.jsx`, `frontend/src/components/web-components/dice-poker-board.js:414`

`AppearanceMenu` lets the user select a `boardColor`, but the web component hardcodes `--board-bg-color: #0b5f0b` in its shadow DOM CSS. The selected color is never passed to the component. Apply the chosen color via a CSS custom property on the host element.

---

### 25. No game state restoration on page reload 🆕
**File:** `frontend/src/components/web-components/dice-poker-board.js`, `dice-poker-die.js`, `dice-poker-monitor.js`

All web component state is stored in in-memory properties. A browser refresh wipes all game state (dice values, held state, current player, round). The README explicitly requires state restoration on page reload.

---

### 26. Web components missing `disconnectedCallback` 🆕
**Files:** `frontend/src/components/web-components/dice-poker-board.js`, `dice-poker-die.js`

`DicePokerMonitor` correctly removes event listeners in `disconnectedCallback`. `DicePokerBoard` and `DicePokerDie` have no `disconnectedCallback` — their listeners are never removed when the elements are unmounted.

---

### 27. Refresh cookie missing `secure` and `sameSite` ⚠️
**File:** `backend/src/controllers/auth-controller.js:76-81`

`httpOnly: true` and a scoped `path` are set correctly. `secure: true` and `sameSite` are absent, leaving the cookie transmittable over HTTP and vulnerable to CSRF. These should be set even in development to surface environment-specific issues early.

---

### 28. `recordResult` authorization too permissive 🆕
**File:** `backend/src/routes/match-routes.js:29`

Any authenticated user (`authorize("user", "admin")`) can report a result for any match. Should require the caller to be a participant in the match, or restrict to admins only.

---

### 29. Second 401 response after token refresh not handled 🆕
**File:** `frontend/src/api.js:59`

After a successful token refresh `authFetch` retries the original request. If that retry also returns 401 the error is not caught — no logout, no user-facing message. The refresh path should handle a second 401 by logging the user out.

---

### 30. Security incidents endpoint lacks admin authorization 🆕
**File:** `backend/src/routes/security-incidents-routes.js`

No `authorize("admin")` middleware is applied to the security incidents GET endpoint, meaning any authenticated user can read the full incident log including IP addresses and user IDs.

---

## 🟡 Dead Code

| File | What's dead | Status |
|------|-------------|--------|
| `frontend/src/providers/AuthProvider.jsx` | `const [error, setError]` — set on line 24 but never exposed in context value | ❌ |
| `frontend/src/services/activity-service.js` | `getActivity()` — exported but never imported | ❌ |
| `frontend/src/components/Game-board/GameBoard.jsx` | Entire component — never imported by any page | ❌ |
| `frontend/src/hooks/useWebSockets.js` | `useGameWebSocket` — only consumed by the dead `GameBoard.jsx` | ❌ |
| `frontend/src/pages/game/Game.jsx:46-159` | ~100 lines of WebSocket betting logic fully commented out with a TODO | 🆕 |
| `frontend/src/layouts/admin-layout/AdminLayout.jsx:1-2` | Two consecutive `import` lines from `"react-router-dom"` — should be one | ❌ |

---

## 🔵 Minor / Polish

- **`frontend/src/pages/login/Login.jsx:32`** ❌ — `useEffect` reads `searchParam` but the dependency array is `[]`. Works by intent (mount-only), but ESLint will warn and it is technically a stale closure.
- **`frontend/src/pages/game/Game.jsx:342`** 🆕 — Comments rendered with `key={index}`. Use a stable `_id` key instead to prevent subtree reconciliation bugs when comments are added or removed.
- **`frontend/src/pages/lobby/Lobby.jsx:104,119,136`** 🆕 — The "All" reset buttons inside filter groups have no `key` prop while sibling buttons do. React will warn.
- **`frontend/src/pages/all-games/AllGames.jsx`** ❌ — Route registered in `App.jsx` but reachable only from the Profile page; no main nav link.
- **`frontend/src/pages/profile/Profile.jsx:99-109`** ⚠️ — `setSaveSuccess` is only called on email or password change. A user who saves only their bio or avatar gets no confirmation.
- **`backend/src/controllers/auth-controller.js:57`** ⚠️ — `resetPasswordController` returns `201 Created` instead of `200 OK` for an update operation.
- **`backend/src/models/passwordReset.js:16`** 🆕 — Field named `expireAt` (missing 's'); `Session.js` and `UserVerification.js` both use `expiresAt`. MongoDB TTL still works but naming is inconsistent.
- **`backend/src/services/elo-service.js:42`** ❌ — K-factor `32` is a bare magic number. Move to a named constant in `constants.js`.
- **`backend/scripts/seed.js:273`** ⚠️ — Log says `'password123'`; actual seeded password is `Password123!`. Misleads developers trying to log in with seed data.
- **`frontend/src/pages/game/Game.jsx:186,190`** 🆕 — Two active `console.log` / `console.error` calls left in production code.
- **`backend/src/utils/jwt.js`** 🆕 — Rate-limit incidents logged without a `userId`, making it harder for admins to correlate incidents to accounts when a logged-in user hits the limit.

---

## ✅ Confirmed Fixed

| Issue | Evidence |
|-------|----------|
| `registerUser` always returned `undefined` | `return newUser` added in `auth-service.js` |
| `passwordReset.js` broken `import { ref } from "process"` | Now imports from `crypto` and `auth-config` |
| Circular dependency: `auth-controller` ↔ `auth-service` | `getAccessToken` moved to `utils/jwt.js` |
| Email exposed in public profile endpoint | Owner/admin check added in `user-service.js` |
| `express.static` uses relative path | `path.join(import.meta.dirname, "uploads")` in `server.js` |
| Leaderboard `straightsAllowed` filter inverted | Logic corrected in `leaderboard-service.js` |
| Profile page success message never shows | `setSaveSuccess` added for email and password changes |
| `loadMoreGames` has no error handling | `.catch` and `.finally` added |
| `match-controller.js` debug `console.log` left in production | Removed |
| Dead imports in `auth-controller.js` (`TokenVerification`, `sendVerificationMail`) | Removed |
| Dead imports in `auth-routes.js` (`authenticate`, `authorize`) | Removed |
| `ResetPassword.jsx` imported from `"react-router"` instead of `"react-router-dom"` | Fixed |
| `Game.jsx` WebSocket hardcoded port `3000` | Now uses `VITE_WS_URL` env variable |
| Password reset does not invalidate existing sessions | `Session.deleteMany({ userId })` added in `resetPassword` |
| `verifyEmailService` silently returns success on invalid/expired tokens | Now throws `BusinessLogicError` |
| `AppearanceProvider` crashes on corrupted localStorage | `JSON.parse` wrapped in try/catch with `defaultAppearance` fallback |
| `AdminTournamentCreate` edit mode discards most fields | All fields (rounds, timeControl, buyIn, eloMin/Max, trophy) now loaded and submitted in edit mode |
| Blank `<p></p>` always rendered in `ResetPassword.jsx` | Conditional rendering fixed |
| `main.jsx` app not wrapped in `StrictMode` | `StrictMode` now wraps `<App />` |
| `Game.jsx` `send()` called on undefined in betting buttons | Entire betting WebSocket block removed/commented |
| Token TTL unit inconsistency (`REFRESH_TOKEN_TTL` ms vs others seconds) | Units now correctly separated — `REFRESH_TOKEN_TTL` in ms for cookie `maxAge`, JWT values in seconds |
