AUTH
  [X] Fix bcrypt await bug in authService.js
  [X] Email verification flow (send link, 15-min expiry, resend)
  [X] Forgot password flow
  [ ] Split eloRating into 3 values (10/30/90 sec time controls) — User model still has single eloRating
  [X] IP-change incident logging in authMiddleware.js

BACKEND — GAME LOGIC
  [~] Expand game variants (2/3/5 players, buy-in 1/10/50, time 10/30/90s) — model + constants done, match-service filters by variant
  [*] Betting logic (pot, fold, raise, match)
  [X] Multi-player Elo re-estimation (pair-wise) — updateEloMultiplayer() wired in match-service
  [X] Weekly 100-point top-up for users — scheduleWeeklyTopup() in server.js, stores lastWeeklyTopUp in SystemSettings
  [X] Tournament round logic (random pairing, standings, winner bonus) — league format in tournament-service.js, TOURNAMENT_WIN_POINTS awarded
  [X] Tournament status field (upcoming/ongoing/finished) + cancel flag
  [X] Rate limiting incident logging (IP/user-agent/timestamp)
  [X] DB seeding script

WEBSOCKETS
  [*] Integrate WS server into Express
  [*] Game channel (rolls on backend, holds from frontend, time enforcement)
  [*] Broadcast other players' holds in real-time
  [ ] Real-time comments on game + tournament pages

WEB COMPONENTS
  [~] Finish dice-poker-board, dice-poker-die, dice-poker-monitor — components exist but not integrated in Game.jsx
  [ ] Wrap game board in React component
  [ ] Restore game state on reload
  [ ] Sound effects (gated by user sound setting)

FRONTEND PAGES
  [~] HomePage — has activity stats + top games + tournaments, missing some detail
  [X] LobbyPage — sort/filter by elo/time control/pagination + load-more
  [~] GamePage — shows game info + comments, missing dice board, betting UI, leave button, spectator view
  [X] TournamentsPage — search, sort, status tabs, load-more pagination
  [X] TournamentPage — countdown, standings, join/leave, admin controls (start/cancel/delete/edit)
  [X] ProfilePage — points balance added, game history with load-more pagination
  [X] LoginPage / RegisterPage — wire up real JWT auth
  [X] ForgotPasswordPage (new)
  [X] 404 Not Found page (new)
  [X] Verify static pages (Privacy, About Us, About Game, Terms)

ADMIN PAGES
  [X] Dashboard (activity stats, links to other admin pages)
  [X] Dashboard security incidents — rate-limit + IP-change hits stored in DB, displayed on dashboard
  [X] User administration (search, list, ban, promote)
  [X] Comment administration (list, delete)
  [X] Tournament creation form
  [X] Admin layout (no footer, stripped header)

HEADER
  [X] Expandable appearance menu (theme, sound, board color, lobby size)
  [X] Greeting + profile pic when logged in
  [X] Admin-only nav link

MATCHMAKING
  [ ] Room-based matchmaking (replace queue)
  [ ] Auto-start when required players joined
  [ ] Anonymous users — spectate only, redirect to login on join
