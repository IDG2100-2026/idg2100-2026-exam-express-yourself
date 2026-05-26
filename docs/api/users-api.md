# Users
REST API endpoints for viewing and managing user profiles. Viewing a profile is open to anyone, updating a profile requires a logged in user, and admin actions require an admin.

## Errors (viewing users)
The following errors might be returned by the endpoints for viewing users.

| HTTP status code | Error code | Description |
|---|---|---|
| 404 | NOT_FOUND | User not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (viewing users)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| GET /api/users/:id | Get a single user profile by ID, including their 10 most recent completed matches. Not role restricted. | **Route param:** :id (required) | **200:** { _id, username, email, age, role, isVerified, eloRating, points, isBanned, bio, profileImageUrl, appearance, trophies, createdAt, recentMatches } |

## Errors (user actions)
The following errors might be returned by the endpoints for user actions.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). Also returned if the old password is incorrect when changing password. |
| 401 | UNAUTHORIZED | Access token is missing or invalid. |
| 403 | FORBIDDEN_ACCESS | Insufficient role permissions. Users can only update their own profile. |
| 404 | NOT_FOUND | User not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (user actions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| PATCH /api/users/:id | Update a user profile. Requires the logged in user to be the owner of the profile or an admin. | **Headers:** Content-Type: application/json **Route param:** :id (required) **Body:** email (optional), bio (optional, max 300 chars), profileImageUrl (optional, valid URL), password (optional, requires oldPassword), oldPassword (optional, required if changing password), appearance.theme (optional, light or dark), appearance.boardColor (optional), appearance.sound (optional, true or false), appearance.lobbySize (optional, integer) | **200:** { _id, username, email, bio, profileImageUrl, appearance, trophies } |

## Errors (admin actions)
The following errors might be returned by the endpoints for admin actions.

| HTTP status code | Error code | Description |
|---|---|---|
| 401 | UNAUTHORIZED | Access token is missing or invalid. |
| 403 | FORBIDDEN_ACCESS | Insufficient role permissions. Admin role required. |
| 404 | NOT_FOUND | User not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (admin actions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| GET /api/users | Get a paginated list of all users. Supports search by username or email. Requires admin. | **Query param:** ?page= (optional, default 1), ?limit= (optional, default 10), ?search= (optional, searches username and email) | **200:** { page, limit, total, results: [{ _id, username, email, role, isBanned, eloRating, points }] } |
| POST /api/users/:id/ban | Ban a user. Banned users cannot join matches or tournaments. Requires admin. | **Route param:** :id (required) | **200:** { message: "username has been banned" } |
| POST /api/users/:id/make-admin | Grant admin role to a user. Requires admin. | **Route param:** :id (required) | **200:** { message: "username is now an admin" } |
