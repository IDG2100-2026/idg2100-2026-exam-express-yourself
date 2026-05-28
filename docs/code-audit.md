# Code Audit — Full Project Review

> Generated 2026-05-28. Excludes `old-obligs/`. Covers backend and frontend.

---

## 🔴 Critical / Breaking

### 1. Password hashing is not secure
**File:** `backend/src/utils/password-hash.js`

SHA-256 with a single static app-wide salt is used. This is a fast hash — trivially brute-forced with GPU hardware, and every user with the same password produces the same hash. Must be replaced with bcrypt/Argon2id with per-user salts.

```
FIX: We are still using crypto!!
```
---

### 2. WebSocket `userId` is never authenticated
**File:** `backend/src/websockets/game-ha«ndler.js`

Every message handler reads `userId` directly from the client payload (`message.userId`). Any connected client can impersonate any player by sending `{ type: "roll", matchId: "...", userId: "<victim>" }`. JWT verification must be added.

````
FIX: we are not implemented the game, so game-handler is irrelevant
````

---

### 3. `sendToRoom` broadcasts never actually send
**File:** `backend/src/websockets/helpers.js` line 23

`client.readyState === socket.OPEN` — `socket.OPEN` is `undefined` on a `ws` socket instance; `OPEN` is a static class property (`WebSocket.OPEN === 1`). The condition is always false, so **no message is ever broadcast to room members**.

````
FIX: we are not implemented the game, so is irrelevant
````
---

### 4. `registerUser` always returns `undefined` in the response
**File:** `backend/src/services/auth-service.js`

The service has no `return newUser` statement. The controller sends `{ message: "...", newUser }` but `newUser` is always `undefined`.

````
fixed: Added return newUser in registerUser line 44
````
---

### 5. Auth endpoints have no rate limiting
**File:** `backend/server.js` lines 38–41

`authRouter` is mounted before `apiRateLimiter` is applied. `/api/auth/login`, `/api/auth/register`, and `/api/auth/forgot-password` are completely unprotected against brute-force.

---

### 6. `getNextBettingPlayer` can return `-1`
**File:** `backend/src/websockets/helpers.js` line 40

The fallback returns `-1` when no eligible player is found, and this value is assigned directly to `match.currentPlayerIndex`. This corrupts game state — `match.players[-1]` is always `undefined`.

---

### 7. `passwordReset.js` has a broken import
**File:** `backend/src/models/passwordReset.js` line 3

`import { ref } from "process"` — `ref` does not exist as a named export from Node's `process` module. This is a copy-paste error from a React `useRef` import and will fail at runtime.

---

### 8. Circular dependency: auth-controller ↔ auth-service
**Files:** `backend/src/services/auth-service.js` line 12 / `backend/src/controllers/auth-controller.js`

`auth-service.js` imports `getAccessToken` from `auth-controller.js`, which imports from `auth-service.js`. In ESM this can cause one module to see a partially-initialized binding of the other. `getAccessToken` should be moved to a utility module.

---

### 9. `authorize("user")` locks admins out of all gameplay
**Files:** `backend/src/routes/tournament-routes.js` lines 38–39, `backend/src/routes/match-routes.js` lines 26–28

`authorize` does a strict `includes(req.role)` check. Since admins have `role: "admin"`, they cannot join/leave matches or tournaments. Almost certainly unintentional.

---

### 10. `recordResult` has no ownership check
**File:** `backend/src/routes/match-routes.js` line 29

`PATCH /api/matches/:id/result` is accessible by any authenticated user. There is no check that the caller is actually a participant in the match. Any logged-in user can set results for any match.

---

## 🟠 Serious / Functional Bugs

### 11. Tournament result reporting never updates the Match document
**File:** `backend/src/services/tournament-service.js` line 380

`reportMatchResult` only updates the bracket sub-document. The actual `Match` document's `status` and `winnerId` remain at `"waiting"` forever. The real match and the tournament bracket are permanently out of sync.

---

### 12. Folded players are not skipped when advancing turn
**File:** `backend/src/websockets/game-handler.js` line 129

`handleEndTurn` does `nextPlayerIndex = currentPlayerIndex + 1` with no skip for folded players. The game gets stuck if the next player has `hasFolded: true`. (Compare `getNextBettingPlayer` in `helpers.js` which does skip folds — the rolling phase has no equivalent.)

---

### 13. `handleJoin` has no auth check and no reconnect deduplication
**File:** `backend/src/websockets/game-handler.js` line 41

Any client can join any `matchId` with any `userId`. There is no DB lookup to confirm the user is a participant, and reconnecting adds a second entry for the same `userId` alongside the stale closed socket.

---

### 14. Race condition on concurrent rolls
**File:** `backend/src/websockets/game-handler.js` line 56

`handleRoll` does `findById → mutate → save` with no atomic locking. Two simultaneous roll requests read the same `rollsUsed`, both compute `rollsUsed + 1`, and both save — producing incorrect roll counts.

---

### 15. Tournament next-round pairing uses full participant list, not winners
**File:** `backend/src/services/tournament-service.js` line 342

`shuffleAndPair` reshuffles `tournament.participants` (the original full list) every round. Eliminated players continue to be paired. The tournament winner is then whoever accumulated the most wins — but ties are broken silently by array order.

---

### 16. Buy-in deducted in tournament rounds without a balance check
**File:** `backend/src/services/tournament-service.js` line 344

`$inc: { points: -matchBuyIn }` is applied unconditionally. If a player's points would go negative, the `User` schema's `min: 0` constraint fires a Mongoose validation error that crashes round advancement mid-tournament.

---

### 17. `sendToRoom` throws and aborts on closed sockets
**File:** `backend/src/websockets/helpers.js` line 23

`.send()` on a closed socket throws synchronously. This aborts the entire broadcast loop — players after the disconnected socket in the room array never receive the message.

---

### 18. `endGame` never cleans up the `games` Map
**File:** `backend/src/websockets/route-handler.js` line 84

After a game ends, the room entry in the `games` Map is never deleted. This is a memory leak, and late messages on completed-game sockets continue to be processed.

---

### 19. Email exposed in public profile endpoint
**File:** `backend/src/services/user-service.js` line 30

`GET /api/users/:id` is a public route but the response includes the user's email address. Any unauthenticated visitor can harvest emails by iterating user IDs.

---

### 20. `express.static("uploads")` uses a relative path
**File:** `backend/server.js` line 36

If the server starts from a directory other than the project root, uploads become inaccessible. Should use `path.join(import.meta.dirname, "uploads")`.

---

### 21. Multer file type check is spoofable
**File:** `backend/src/middlewares/upload.js`

Only `file.mimetype` (a client-supplied header) is checked. An attacker can upload any file with `Content-Type: image/png` and it passes. Should check magic bytes with a library like `file-type`.

---

### 22. Uploaded files have no extension
**File:** `backend/src/middlewares/upload.js`

Multer's `dest: "uploads/"` stores files without extensions. Browsers can't infer MIME type from the filename, so images don't display correctly in some clients.

---

### 23. Leaderboard `straightsAllowed` filter is inverted
**File:** `backend/src/services/leaderboard-service.js` line 14

The no-filter branch condition includes `!straightsAllowed`. When `straightsAllowed === false`, `!false === true`, so the condition evaluates to true and the filter is silently ignored.

---

### 24. Profile page — success message never shows
**File:** `frontend/src/pages/profile/Profile.jsx` line 25

`setSaveSuccess` is called with `null` twice (in `startEditing` and `handleSave`) but is never called with an actual success string. The user sees no feedback after saving changes.

---

### 25. `AdminTournamentCreate` edit mode silently discards most fields
**File:** `frontend/src/pages/admin/tournament-create/AdminTournamentCreate.jsx` line 74

When editing, only `title`, `description`, `rules`, and `startDate` are submitted. All game settings (rounds, timeControl, buy-in, elo range, trophy) are rendered in the form but never sent.

---

### 26. `AppearanceProvider` crashes on corrupted localStorage
**File:** `frontend/src/providers/AppearanceProvider.jsx` line 15

`JSON.parse(saved)` has no try/catch. Corrupted or manually edited localStorage crashes the entire app on load.

---

### 27. `loadMoreGames` has no error handling
**File:** `frontend/src/pages/profile/Profile.jsx` line 40

The `.then()/.finally()` chain has no `.catch()`. On failure, `isLoadingGames` stays `true` forever (the "Load more" button shows "Loading..." permanently).

---

### 28. Seed users cannot log in
**File:** `backend/scripts/seed.js` line 24

The seed script hashes passwords with `crypto.createHash("sha256")` directly, bypassing the Mongoose pre-save hook. The production auth service uses whatever is in `password-hash.js`. The algorithms differ, so all seeded passwords produce non-matching hashes.

---

## 🟡 Dead Code

| File | What's dead |
|------|-------------|
| `frontend/src/services/activity-service.js` | Entire file — `getActivity()` is never imported or called anywhere. `platform-activity-service.js` is what's used. |
| `frontend/src/components/Game-board/GameBoard.jsx` | Entire component — never imported by any page. `Game.jsx` has its own inline WebSocket logic. |
| `frontend/src/hooks/useWebSockets.js` | Only consumed by the dead `GameBoard.jsx`. |
| `frontend/src/services/comments-service.js` — `getComments` | Defined and exported but never called. Comments go through WebSockets. |
| `backend/src/controllers/auth-controller.js` lines 16–17 | `TokenVerification` and `sendVerificationMail` imported but never used in this file. |
| `backend/src/routes/auth-routes.js` line 20 | `authenticate` and `authorize` imported but no route in this file uses them. |
| `frontend/src/providers/AuthProvider.jsx` line 11 | `const [error, setError]` — `setError` is never called; `error` is never exposed in context. |
| `frontend/src/components/web-components/dice-poker-board.js` — `_startNewMatch` | Method defined but never called. |
| `frontend/src/pages/all-games/AllGames.jsx` | Route registered in `App.jsx` but no navigation link points to it — unreachable from the UI. |
| `frontend/src/pages/login/Login.jsx` line 23 | `setSearchParams` destructured from `useSearchParams` but never called. |
| `frontend/src/pages/ResetPassword/ResetPassword.jsx` line 9 | `setSearchParams` destructured from `useSearchParams` but never called. |

---

## 🔵 Minor / Polish

- **`backend/src/controllers/match-controller.js` line 41** — `console.log("Game started! Sending game:started...")` left in production code.
- **`frontend/src/pages/game/Game.jsx`** — 7 `console.log`/`console.error` calls left in at lines 60, 67, 72, 116, 180, 185, 188.
- **`frontend/src/pages/tournament/Tournament.jsx`** — `console.log`/`console.error` at lines 159, 164, 167.
- **`backend/src/controllers/auth-controller.js` line 55** — `resetPasswordController` returns `201` (Created) instead of `200`.
- **`backend/src/controllers/auth-controller.js` line 74** — Refresh token cookie missing `secure: true` and `sameSite` — transmitted over plain HTTP and vulnerable to CSRF in production.
- **`frontend/src/main.jsx` line 1** — `StrictMode` imported but the app is not wrapped in it.
- **`frontend/src/layouts/admin-layout/AdminLayout.jsx` lines 1–2** — Two separate `import` lines from `"react-router-dom"` — should be merged into one.
- **`frontend/src/pages/ResetPassword/ResetPassword.jsx` line 2** — Imports from `"react-router"` while every other file in the project uses `"react-router-dom"`.
- **`frontend/src/pages/ResetPassword/ResetPassword.jsx` line 78** — Both named (`export const`) and default export for the same component — the named export is redundant.
- **`frontend/src/pages/about-game/AboutGame.jsx`** — Says dice show "9, 10, Jack, Queen, King, Ace" but the code uses `7, 8, J, Q, K, A`.
- **`frontend/src/pages/game/Game.jsx` line 56** — Game WebSocket hardcodes port `3000` while the comments WebSocket uses the `VITE_WS_URL` env var. These should be consistent.
- **`backend/src/websockets/betting-handler.js` line 10** — `// TODO: not yet done` comment on `endRound` import was never resolved.
- **`backend/src/config/db.js` line 12** — `console.log(..., MONGODB_URI)` could log credentials if the URI ever embeds them.
- **`backend/src/config/auth-config.js`** — TTL constants mix milliseconds and seconds with no naming convention to indicate unit (suggest `_MS` / `_SEC` suffixes).
- **`backend/src/services/elo-service.js` line 42** — K-factor `32` is a magic number hardcoded inside the function; should be a named constant in `constants.js`.
- **`backend/src/routes/tournament-routes.js` lines 38–39`** — `joinTournament` and `leaveTournament` use `authorize("user")` which also blocks admins (same root cause as critical issue #9, but worth noting for these specific routes).
- **`backend/src/websockets/route-handler.js`** — `endRound` emits inconsistent payload shapes: fold path uses `winnerIndex`, showdown path uses `winnerIndexes`. The frontend must handle two different field names for the same concept.
