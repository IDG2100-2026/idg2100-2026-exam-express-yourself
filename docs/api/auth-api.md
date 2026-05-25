# Authentication
REST API endpoints for managing user registrations, sessions, and password resets. Registration and login are open to anyone, session management requires a valid refresh token cookie, and logout requires a logged in user.

## Errors (register user)
The following errors might be returned by the endpoints for registering users.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). |
| 409 | CONFLICT | Username or email is already in use. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (register user)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| POST /api/auth/register | Register a new user account. Not role restricted. | **Headers:** Content-Type: application/json **Body:** username, email, password, age (all required) | **201:** { message: "User registered successfully", newUser: { _id, username, email, age, role } } |
| GET /api/auth/verify-email | Verify a user's email address using the code sent to their inbox after registering. Not role restricted. | **Query param:** ?code= (required) - verification code from email | **200:** { message: "email verified successfully! You can now login" } |

## Errors (sessions)
The following errors might be returned by the endpoints for sessions.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). |
| 401 | UNAUTHORIZED | Invalid credentials, unverified account, no refresh token cookie, or session not found. |
| 403 | FORBIDDEN_ACCESS | Account is banned. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (sessions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| POST /api/auth/login | Log in with email and password. Sets a signed httpOnly refresh token cookie on success. Not role restricted. | **Headers:** Content-Type: application/json **Body:** email, password (both required) | **200:** { accessToken, user: { _id, username, role, eloRating, profileImageUrl, appearance } } |
| POST /api/auth/sessions/token | Get a new access token using the refresh token cookie. Called automatically by the client when an access token expires. Not role restricted. | **Cookie:** refreshToken (set automatically by browser on login) | **200:** { accessToken, user: { _id, username, email, role } } |
| DELETE /api/auth/sessions/current | Log out the current user. Deletes the session from the database and clears the refresh token cookie. Requires logged in user. | **Cookie:** refreshToken (set automatically by browser) | **200:** { message: "logged out successfully" } |

## Errors (password reset)
The following errors might be returned by the endpoints for password resets.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (password reset)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| POST /api/auth/forgot-password | Request a password reset email. Always returns 200 regardless of whether the email exists to prevent user enumeration. Not role restricted. | **Headers:** Content-Type: application/json **Body:** email (required) | **200:** { message: "If the email exists, a password reset link has been sent" } |
| POST /api/auth/reset-password | Reset a user's password using the code from the reset email. Not role restricted. | **Headers:** Content-Type: application/json **Body:** code, newPassword (both required) | **201:** { message: "Password has been changed successfully" } |
