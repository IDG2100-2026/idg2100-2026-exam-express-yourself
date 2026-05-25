AUTH
  [X] Fix bcrypt await bug in authService.js
  [X] Email verification flow (send link, 15-min expiry, resend)
  [X] Forgot password flow
  [ ] Split eloRating into 3 values (10/30/90 sec time controls)
  [X] IP-change incident logging in authMiddleware.js

BACKEND — GAME LOGIC
  [ ] Expand game variants (2/3/5 players, buy-in 1/10/50, time 10/30/90s)
  [ ] Betting logic (pot, fold, raise, match)
  [ ] Multi-player Elo re-estimation (pair-wise)
  [ ] Weekly 100-point top-up for users
  [ ] Tournament round logic (random pairing, standings, winner bonus)
  [ ] Tournament status field (upcoming/ongoing/finished) + cancel flag
  [ ] Rate limiting incident logging (IP/user-agent/timestamp)
  [ ] DB seeding script

WEBSOCKETS
  [ ] Integrate WS server into Express
  [ ] Game channel (rolls on backend, holds from frontend, time enforcement)
  [ ] Broadcast other players' holds in real-time
  [ ] Real-time comments on game + tournament pages

WEB COMPONENTS
  [ ] Finish dice-poker-board, dice-poker-die, dice-poker-monitor
  [ ] Wrap game board in React component
  [ ] Restore game state on reload
  [ ] Sound effects (gated by user sound setting)

FRONTEND PAGES
  [ ] HomePage — tournament overview + platform activity stats
  [ ] LobbyPage — variant filtering + pagination
  [ ] GamePage — live board, betting UI, leave button, spectator view
  [ ] TournamentsPage — upcoming/past split, pagination, sort, search
  [ ] TournamentPage — full detail, standings, join/leave, countdown, admin controls
  [ ] ProfilePage — 3 Elo ratings, stats, points, paginated games
  [X] LoginPage / RegisterPage — wire up real JWT auth
  [X] ForgotPasswordPage (new)
  [X] 404 Not Found page (new)
  [X] Verify static pages (Privacy, About Us, About Game, Terms)

ADMIN PAGES (none exist yet)
  [ ] Dashboard (activity, security incidents, links)
  [ ] User administration (search, list, ban, promote)
  [ ] Comment administration (list, delete)
  [ ] Tournament creation form
HEADER
  [ ] Expandable appearance menu (theme, sound, board color, lobby size)
  [ ] Greeting + profile pic when logged in
  [ ] Admin-only nav link

MATCHMAKING
  [ ] Room-based matchmaking (replace queue)
  [ ] Auto-start when required players joined
  [ ] Anonymous users — spectate only, redirect to login on join