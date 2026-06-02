# Comments
REST API endpoints for reading and posting comments on matches and tournaments. Viewing comments is open to anyone, posting requires a logged in user, and deleting requires an admin.

## Errors (viewing comments)
The following errors might be returned by the endpoints for viewing comments.

| HTTP status code | Error code | Description |
|---|---|---|
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (viewing comments)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| GET /api/comments | Get a paginated list of comments. Not role restricted. | **Query param:** ?page= (optional, default 1), ?limit= (optional, default 10), ?targetType= (optional, one of: Match, Tournament), ?targetId= (optional, filter by the target document ID), ?search= (optional, searches comment text) | **200:** { page, limit, total, results: [{ _id, text, authorId, targetType, targetId, createdAt }] } |

## Errors (comment actions)
The following errors might be returned by the endpoints for comment actions.

| HTTP status code | Error code | Description |
|---|---|---|
| 400 | INVALID_REQUEST | Request has either missing required field(s), contains invalid field(s), and/or has incorrect format(s). |
| 401 | UNAUTHORIZED | Access token is missing or invalid. |
| 403 | FORBIDDEN_ACCESS | Insufficient role permissions. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (comment actions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| POST /api/comments | Post a new comment on a match or tournament. Requires logged in user. Rate limited. | **Headers:** Content-Type: application/json **Body:** text (required, 2-500 chars), targetType (required, one of: Match, Tournament), targetId (required, valid ID) | **201:** { _id, text, authorId, targetType, targetId, createdAt } |

## Errors (admin actions)
The following errors might be returned by the endpoints for admin actions.

| HTTP status code | Error code | Description |
|---|---|---|
| 401 | UNAUTHORIZED | Access token is missing or invalid. |
| 403 | FORBIDDEN_ACCESS | Insufficient role permissions. Admin role required. |
| 404 | NOT_FOUND | Comment not found. |
| 500 | INTERNAL_SERVER_ERROR | Unexpected error occurred on the server side. |

## Endpoints (admin actions)

| URI (verb and path) | Description | Inputs | Outputs |
|---|---|---|---|
| DELETE /api/comments/:id | Soft delete a comment. The comment is marked as deleted and hidden from results but kept in the database. Requires admin. | **Route param:** :id (required) | **200:** { message: "Comment deleted" } |
