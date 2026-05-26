# Tournaments
REST API endpoints for browsing and participating in tournaments. Viewing tournaments is open to anyone, joining and leaving requires a logged in user, and creating or managing tournaments requires an admin.

## Errors (viewing tournaments)
The following errors might be returned by the endpoints for viewing tournaments.

| HTTP status code | Error code | Description |
|---|---|---|
| 404 | NOT_FOUND | Tournament not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (viewing tournaments)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| GET /api/tournaments | Get a paginated list of tournaments. Not role restricted. | **Query param:** ?page= (optional, default 1), ?limit= (optional, default 10), ?status= (optional, one of: upcoming, in-progress, completed, cancelled), ?search= (optional, min 3 chars, searches by title), ?sort= (optional, one of: date, title, players, default date) | **200:** { page, limit, total, results: [{ _id, title, description, startDate, status, category, buyIn, eloRange, numberOfRounds, participants, trophy, createdBy, winnerId }] } |
| GET /api/tournaments/:id | Get a single tournament by ID. Not role restricted. | **Route param:** :id (required) | **200:** { _id, title, description, rules, startDate, status, category, buyIn, eloRange, numberOfRounds, participants, bracket, trophy, createdBy, winnerId, currentRound } |
| GET /api/tournaments/:id/standings | Get the bracket standings for a tournament. Not role restricted. | **Route param:** :id (required) | **200:** { title, status, winner, standings: [{ round, matches: [{ player1, player2, winner }] }] } |

## Errors (tournament actions)
The following errors might be returned by the endpoints for tournament actions.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). Also returned if the tournament is not in upcoming status, or the user has already joined. |
| 401 | UNAUTHORIZED | Access token is missing or invalid. |
| 403 | FORBIDDEN_ACCESS | Insufficient role permissions. Also returned if the user is banned. |
| 404 | NOT_FOUND | Tournament not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (tournament actions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| POST /api/tournaments/:id/join | Join a tournament that is still upcoming. Requires logged in user. | **Route param:** :id (required) | **200:** { message: "Joined tournament", tournament: { _id, title, status, participants } } |
| POST /api/tournaments/:id/leave | Leave a tournament. Requires logged in user. | **Route param:** :id (required) | **200:** { message: "Left tournament" } |

## Errors (admin actions)
The following errors might be returned by the endpoints for admin actions.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). Also returned if the tournament is not in the required status, there are fewer than 2 participants, or a match result has already been recorded. |
| 401 | UNAUTHORIZED | Access token is missing or invalid. |
| 403 | FORBIDDEN_ACCESS | Insufficient role permissions. Admin role required. |
| 404 | NOT_FOUND | Tournament or match not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (admin actions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| POST /api/tournaments | Create a new tournament. Requires admin. | **Headers:** Content-Type: multipart/form-data **Body:** title (required), startDate (required), description (optional, max 500 chars), rules (optional, max 1000 chars), numberOfRounds (optional, default 3), buyIn (optional, default 0), eloRange.min (optional, default 0), eloRange.max (optional, default 9999), category.rounds (optional, one of: 3/5/7), category.timeControl (optional, one of: 10/30/90), category.straightsAllowed (optional, default true), trophyTitle (optional), trophyImage (optional, file) | **201:** { message: "Tournament created", tournament: { _id, title, startDate, status, category, buyIn, eloRange, numberOfRounds, trophy, createdBy } } |
| PUT /api/tournaments/:id | Update tournament details. Requires admin. | **Headers:** Content-Type: application/json **Route param:** :id (required) **Body:** any updatable tournament fields | **200:** { message: "Tournament updated", tournament } |
| POST /api/tournaments/:id/start | Start a tournament, shuffle participants, and generate round 1 matches. Requires admin. | **Route param:** :id (required) | **200:** { message: "Tournament started!", matches: ["Match 1: player1 vs player2", ...] } |
| POST /api/tournaments/:id/cancel | Cancel a tournament. Requires admin. | **Route param:** :id (required) | **200:** { message: "Tournament cancelled", tournament } |
| PUT /api/tournaments/:id/matches/:matchId/result | Record the result of a tournament match and advance the bracket. Requires admin. | **Headers:** Content-Type: application/json **Route param:** :id (required), :matchId (required) **Body:** winnerId (required) | **200:** { message: "Result recorded", tournament: { _id, title, status, bracket, winnerId } } |
| DELETE /api/tournaments/:id | Delete a tournament. Requires admin. | **Route param:** :id (required) | **200:** { message: "Tournament deleted" } | 