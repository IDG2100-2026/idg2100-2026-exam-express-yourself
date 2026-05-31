# Code Audit — Full Project Review

> Re-audited 2026-05-31. Six parallel agents reviewed backend auth/security, game/WebSocket backend, tournament service, frontend pages, and frontend services/infrastructure. Previous baseline: 2026-05-29. Excludes `old-obligs/`.

---

## Status legend
- ✅ **FIXED**
- ⚠️ **PARTIALLY FIXED**
- ❌ **STILL OPEN**
- 🆕 **NEW FINDING**

---

## 🔴 Critical / Security

### 1. JWT_SECRET undefined silently forges all tokens 🆕
**File:** `backend/src/utils/jwt.js:5`

`JWT_SECRET` is read once at module load from `process.env`. If the variable is missing, `jwt.sign`/`jwt.verify` receive `undefined` and silently fall back to the string `"undefined"` as the secret. Any attacker who discovers this pattern can forge valid tokens for any `userId` and `role`.

**Fix:** Add a startup guard — if `JWT_SECRET` is falsy, throw immediately so the server refuses to boot.

---

### 2. endGame and recordResult can both complete the same match ❌
**Files:** `backend/src/websockets/route-handler.js:79`, `backend/src/services/match-service.js:292-362`

`endGame` (WebSocket path) does not check whether `match.status === "completed"` before writing. If a REST call to `PATCH /api/matches/:id/result` races with the WebSocket `endGame`, both read `status='in-progress'`, both set `status='completed'`, both run the ELO update, and both award pot points — the winner receives double points and ELO is calculated twice.

---

### 3. Missing awaits in endRound and handleRoll cause stale DB writes 🆕
**Files:** `backend/src/websockets/route-handler.js:61`, `backend/src/websockets/game-handler.js:73`

- `endRound` calls `endGame(...)` without `await`, so its own `match.save()` can land after `endGame` has already written its state, overwriting the completed match with a stale document.
- `handleRoll` calls `handleEndTurn(...)` without `await` after the 3rd roll; `handleEndTurn` immediately fetches the pre-save document from DB and broadcasts stale dice values to the room.

---

### 4. JSON.parse in WebSocket message handler has no try/catch 🆕
**File:** `backend/src/websockets/websocket.js:43`

`JSON.parse(message)` is called with no surrounding try/catch. A malformed frame from any client throws a `SyntaxError` that propagates out of the async `message` handler uncaught, breaking that socket silently for all subsequent messages.

---

### 5. Ban check after password check leaks password validity 🆕
**File:** `backend/src/services/auth-service.js:69`

`authenticateUser` checks the password first, then checks `isBanned`. A banned user who supplies the wrong password receives `"Invalid credentials"`; the same user with the correct password receives `"Account is banned"`. The differing response lets anyone confirm a banned account's correct password via response differentiation.

**Fix:** Check `isBanned` before checking the password, or return the same `"Invalid credentials"` error in both cases.

---

## 🟠 Serious / Functional Bugs

### 6. Tournament buy-in not deducted when a user joins ❌
**File:** `backend/src/services/tournament-service.js:179`

`joinTournament` checks `user.points >= tournament.buyIn` but never deducts the points. Deduction only happens when matches are created at round start. A user with 10 points and a buyIn of 10 can join multiple tournaments simultaneously, exceeding their available balance.

---

### 7. Buy-in deducted in rounds without a balance check ❌
**File:** `backend/src/services/tournament-service.js:343`

`$inc: { points: -matchBuyIn }` is applied via `findByIdAndUpdate` without `runValidators: true`. This bypasses Mongoose's `min: 0` constraint, so a player with fewer points than the buyIn ends up with a negative balance.

---

### 8. reportMatchResult never updates the Match document ❌
**File:** `backend/src/services/tournament-service.js:319`

`reportMatchResult` sets `foundMatch.winner` on the tournament bracket sub-document but never calls `Match.findByIdAndUpdate(foundMatch.gameId, { winnerId, status: "completed" })`. The actual `Match` record stays `status: 'waiting'` and `winnerId: null` indefinitely, breaking game history and leaderboard stats.

---

### 9. Second 401 after token refresh not handled ❌
**File:** `frontend/src/api.js:59`

After a successful token refresh, `authFetch` retries the original request. If that retry also returns `401` (e.g. account banned mid-session, or the new token is immediately rejected), the code falls through to the generic error path — `clearAccessToken()` is never called, `auth-expired` is never dispatched, and the user stays stuck in a broken authenticated state.

---

### 10. leaveTournament has no status guard ❌
**File:** `backend/src/services/tournament-service.js:192`

A player can call `leaveTournament` on a tournament with `status: 'in-progress'` or `'completed'`. Removing a participant mid-tournament means the bracket still references their ID in existing matches, but they can never be paired again — the bracket stalls.

---

### 11. updateTournament has no status guard 🆕
**File:** `backend/src/services/tournament-service.js:490`

An admin can modify `numberOfRounds`, `category`, or `buyIn` on a live tournament. Reducing `numberOfRounds` below `currentRound` causes the next `reportMatchResult` call to immediately declare the tournament finished with wrong win counts.

---

### 12. deleteTournament does not clean up Match documents 🆕
**File:** `backend/src/services/tournament-service.js:547`

`deleteTournament` deletes the `Tournament` document but performs no `Match.deleteMany({ tournamentId })`. All associated `Match` records remain in the database with a dangling `tournamentId` reference.

---

### 13. Refresh token cookie missing `secure` and `sameSite` ⚠️
**File:** `backend/src/controllers/auth-controller.js:76`

`httpOnly: true` and a scoped `path` are set. `secure: true` and `sameSite` are absent, leaving the cookie transmittable over plain HTTP and vulnerable to CSRF on the token-refresh endpoint.

---

### 14. Multer file type check is spoofable ❌
**File:** `backend/src/middlewares/upload.js:9`

Only `file.mimetype` (a client-supplied header) is checked. Any file can be uploaded with `Content-Type: image/png`. Validate actual magic bytes using a library such as `file-type`.

---

### 15. Tournament shuffle is biased ❌
**Files:** `backend/src/services/tournament-service.js:225`, `backend/src/services/tournament-service.js:332`

Both round-1 pairing (`startTournament`) and subsequent-round pairing (`reportMatchResult`) use `participants.sort(() => 0.5 - Math.random())`, a known non-uniform distribution. Replace with Fisher-Yates for fair random pairings.

---

### 16. resendVerifyEmail sends to already-verified users and has no input validation 🆕
**Files:** `backend/src/services/auth-service.js:51`, `backend/src/controllers/auth-controller.js:39`

- `resendUserVerification` does not check `user.isVerified` — it will create a new token and send a spurious email to users who are already verified.
- `resendVerifyEmailController` reads `email` from `req.body` with no express-validator middleware. Submitting `email: undefined` causes `User.findOne({ email: undefined })`, which in Mongoose matches the first document with no email field.

---

### 17. Logout route shares the token-refresh rate limiter 🆕
**File:** `backend/src/routes/auth-routes.js:73`

`DELETE /sessions/current` (logout) is protected by `sessionTokenLimiter` (10 req/min), the same limiter as `POST /sessions/token`. An attacker who sends 10 fast token-refresh requests exhausts the window, preventing the victim from logging out until it resets.

---

### 18. Uploaded files stored without file extension ❌
**File:** `backend/src/middlewares/upload.js:6`

Multer's `dest: "uploads/"` stores files without extensions. Browsers cannot determine MIME type from filename, so avatar images may not render. Combined with issue 14, this also raises the risk of serving unidentifiable files.

---

### 19. db.js and seed.js log the MongoDB URI in plaintext ❌
**Files:** `backend/src/config/db.js:12`, `backend/scripts/seed.js:13`

Both log the full connection URI. If the URI contains credentials they will appear in logs. Strip credentials before logging.

---

### 20. Sound implementation incomplete ❌
**Files:** `frontend/src/providers/AppearanceProvider.jsx`, web components

The appearance context exposes a `sound` toggle and the menu renders an on/off control, but there are no audio files, no `Audio` objects, and no event hooks in the game components. The README requires sounds for round start/end, dice rolls, holds, and game end.

---

### 21. Board background color not applied to web component ❌
**Files:** `frontend/src/components/appearance-menu/AppearanceMenu.jsx`, `frontend/src/components/web-components/dice-poker-board.js:406`

`AppearanceMenu` lets the user pick a `boardColor`, but the web component hardcodes `--board-bg-color: #0b5f0b` inside its shadow DOM. The chosen color is never passed to the component as a CSS custom property on the host element.

---

### 22. No game state restoration on page reload ❌
**File:** `frontend/src/components/web-components/dice-poker-board.js`

All web component state (dice values, held state, current player, round) is stored in in-memory instance properties. A browser refresh wipes all game state. The README explicitly requires state restoration on page reload.

---

### 23. Web components missing disconnectedCallback ❌
**Files:** `frontend/src/components/web-components/dice-poker-board.js`, `frontend/src/components/web-components/dice-poker-die.js`

`DicePokerMonitor` correctly removes listeners in `disconnectedCallback`. `DicePokerBoard` and `DicePokerDie` have no `disconnectedCallback` — their shadow DOM listeners are never removed when the elements are unmounted. `DicePokerDie` also has an active `_rollTimer` that can fire on a disconnected element.

---

## 🟡 Minor / Polish

- **`frontend/src/pages/profile/Profile.jsx:322`** 🆕 — Unconditional access to `opponent.username` crashes with `TypeError` when a match has fewer than 2 players or the opponent's `userId` is null. Wrap with optional chaining: `opponent?.username`.
- **`frontend/src/pages/profile/Profile.jsx:121`** 🆕 — `handleSave` replaces the entire `formData` object with `{ password: '', newPassword: '' }` after a password change, wiping `username`, `email`, and `bio`. A subsequent save without re-entering data sends an empty update.
- **`frontend/src/pages/tournament/Tournament.jsx:411`** 🆕 — Live-matches list uses array index as React `key`. When matches change order or are removed, React reuses DOM nodes by position and can display stale winner data.
- **`frontend/src/pages/login/Login.jsx:32`** ❌ — `useEffect` reads `searchParams` from the outer scope but has an empty dependency array `[]`. Works by intent (mount-only), but ESLint will warn and the stale closure can break if the component ever re-mounts with a different code in the URL.
- **`frontend/src/pages/game/Game.jsx:342`** — Comments rendered with `key={index}`. Use `comment._id` for a stable key.
- **`frontend/src/pages/lobby/Lobby.jsx:104,119,136`** — The "All" reset buttons inside filter groups have no `key` prop while sibling buttons do.
- **`frontend/src/pages/all-games/AllGames.jsx`** ❌ — Route registered in `App.jsx` but reachable only from the Profile page; no main nav link.
- **`frontend/src/pages/profile/Profile.jsx:99-109`** ⚠️ — `setSaveSuccess` is only called on email or password change. A user who saves only their bio or avatar gets no confirmation.
- **`backend/src/services/elo-service.js:42`** ❌ — K-factor `32` is a bare magic number. Move to a named constant in `constants.js`.
- **`backend/scripts/seed.js:273`** ⚠️ — Log says `'password123'`; actual seeded password is `Password123!`. Misleads developers trying to log in with seed data.
- **`frontend/src/pages/game/Game.jsx:186,190`** — Two active `console.log` / `console.error` calls left in production code.

---

## 🔵 Dead Code

| File | What's dead | Status |
|------|-------------|--------|
| `frontend/src/providers/AuthProvider.jsx` | `const [error, setError]` — set in catch block but never exposed in context value or rendered | ❌ |
| `frontend/src/services/activity-service.js` | `getActivity()` — exported but never imported anywhere | ❌ |
| `frontend/src/hooks/useWebSockets.js` | `useGameWebSocket` — exported but never imported by any component | ❌ |
| `frontend/src/pages/game/Game.jsx:46-159` | ~100 lines of WebSocket betting/board logic fully commented out with a TODO | ❌ |
| `frontend/src/layouts/admin-layout/AdminLayout.jsx:1-2` | Two consecutive `import` lines from `"react-router-dom"` — should be one | ❌ |

---

## ✅ Confirmed Fixed

| Issue | Evidence |
|-------|----------|
| Password hashing not secure (SHA-256 + static salt) | Replaced with bcrypt/crypto with per-user salts |
| `/sessions/token` and `/sessions/current` had no rate limiting | Per-route `sessionTokenLimiter` added to auth routes |
| WebSocket connections not authenticated | JWT verified on connection; socket closed with 4001 if invalid |
| WebSocket messages trusted client-supplied `userId` | Game handler now uses `socket.userId` from verified token |
| IP-mismatch incident not logged during token refresh | `logIncident` call added in `createAccessTokenService` |
| Banned users could bypass ban via token refresh | `isBanned` check added in `createAccessTokenService` |
| Security incidents endpoint lacked admin authorization | `authorize("admin")` middleware added |
| `Login.jsx` crashed on email verification (`setLoading` undefined) | State now correctly uses `setIsLoading` |
| `AdminDashboard.jsx` crashed rendering incidents (`inc` undefined) | Loop variable corrected |
| `resetPasswordController` returned `201 Created` for an update | Changed to `200 OK` |
| `passwordReset.js` field named `expireAt` (missing 's') | Renamed to `expiresAt` for consistency |
| `registerUser` always returned `undefined` | `return newUser` added |
| `passwordReset.js` broken `import { ref } from "process"` | Now imports from `crypto` and `auth-config` |
| Circular dependency: `auth-controller` ↔ `auth-service` | `getAccessToken` moved to `utils/jwt.js` |
| Email exposed in public profile endpoint | Owner/admin check added in `user-service.js` |
| `express.static` used relative path | `path.join(import.meta.dirname, "uploads")` in `server.js` |
| Leaderboard `straightsAllowed` filter inverted | Logic corrected in `leaderboard-service.js` |
| `loadMoreGames` had no error handling | `.catch` and `.finally` added |
| Dead imports in `auth-controller.js` | Removed |
| Dead imports in `auth-routes.js` | Removed |
| `ResetPassword.jsx` imported from wrong router package | Fixed |
| `Game.jsx` WebSocket hardcoded port `3000` | Now uses `VITE_WS_URL` env variable |
| Password reset did not invalidate existing sessions | `Session.deleteMany({ userId })` added in `resetPassword` |
| `verifyEmailService` silently succeeded on invalid tokens | Now throws `BusinessLogicError` |
| `AppearanceProvider` crashed on corrupted localStorage | `JSON.parse` wrapped in try/catch with `defaultAppearance` fallback |
| `AdminTournamentCreate` edit mode discarded most fields | All fields now loaded and submitted in edit mode |
| Blank `<p></p>` always rendered in `ResetPassword.jsx` | Conditional rendering fixed |
| `main.jsx` app not wrapped in `StrictMode` | `StrictMode` now wraps `<App />` |
| Token TTL unit inconsistency | `REFRESH_TOKEN_TTL` in ms for cookie `maxAge`, JWT values in seconds |
