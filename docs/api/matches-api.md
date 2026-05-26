# Matches
REST API endpoints for browsing and playing matches. Viewing matches is open to anyone, creating and joining matches requires a logged in user.

## Errors (viewing matches)
The following errors might be returned by the endpoints for viewing matches.

| HTTP status code | Error code | Description |
|---|---|---|
| 404 | NOT_FOUND | Match not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (viewing matches)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| GET /api/matches | Get a paginated list of matches. Not role restricted. | **Query param:** ?page= (optional, default 1), ?limit= (optional, default 10), ?status= (optional, one of: waiting, in-progress, completed), ?playerId= (optional, filter by player), ?rounds= (optional, one of: 3/5/7), ?timeControl= (optional, one of: 10/30/90), ?straightsAllowed= (optional, true or false) | **200:** { page, limit, total, results: [{ _id, players, maxPlayers, category, buyIn, status, winnerId, score, startedAt, endedAt }] } |
| GET /api/matches/:id | Get a single match by ID. Not role restricted. | **Route param:** :id (required) | **200:** { _id, players, maxPlayers, category, buyIn, status, winnerId, score, startedAt, endedAt } |

## Errors (match actions)
The following errors might be returned by the endpoints for match actions.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). Also returned if the match is full, the user has already joined, or the user has insufficient points for the buy-in. |
| 401 | UNAUTHORIZED | Access token is missing or invalid. |
| 403 | FORBIDDEN_ACCESS | Insufficient role permissions. |
| 404 | NOT_FOUND | Match not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (match actions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| POST /api/matches | Create a new match and join it as the first player. Requires logged in user. | **Headers:** Content-Type: application/json **Body:** rounds, timeControl (both required, valid values: rounds 3/5/7, timeControl 10/30/90), straightsAllowed (optional, default true), maxPlayers (optional, default 2, valid values: 2/3/5), buyIn (optional, default 1, valid values: 1/10/50) | **201:** { message: "Game created", match: { _id, players, maxPlayers, category, buyIn, status } } |
| POST /api/matches/:id/join | Join an existing match that is still waiting for players. Requires logged in user. | **Route param:** :id (required) | **200:** { message: "Joined match", match: { _id, players, maxPlayers, category, buyIn, status } } |
| POST /api/matches/:id/leave | Leave a match before it has started. Requires logged in user. | **Route param:** :id (required) | **200:** { message: "Left the match", match } or { message: "Match deleted (no players left)" } |
| PATCH /api/matches/:id/result | Record the result of a completed match. Requires logged in user or admin. | **Headers:** Content-Type: application/json **Route param:** :id (required) **Body:** winnerId, score (both required) | **200:** { _id, players, maxPlayers, category, buyIn, status: "completed", winnerId, score, endedAt } |
