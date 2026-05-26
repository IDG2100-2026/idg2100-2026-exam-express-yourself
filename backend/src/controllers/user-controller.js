import {
  getAllUsers as getAllUsersService,
  getUser as getUserService,
  updateUser as updateUserService,
  banUser as banUserService,
  makeAdmin as makeAdminService,
} from "../services/user-service.js";


// Get a paginated list of all users (GET /api/users?page=&limit=&search=)
export async function getUsers(req, res, next) {
  const result = await getAllUsersService(req.validated);
  res.status(200);
  res.json(result);
}


// Get a single user profile with their recent matches (GET /api/users/:id)
export async function getUser(req, res, next) {
  const result = await getUserService(req.params.id);
  res.status(200);
  res.json(result);
}


// Update a user's profile fields or password (PATCH /api/users/:id)
export async function updateUser(req, res, next) {
  const user = await updateUserService(req.params.id, req.validated);
  res.status(200);
  res.json(user);
}


// Ban a user so they can no longer join tournaments or matches (POST /api/users/:id/ban)
export async function banUser(req, res, next) {
  const user = await banUserService(req.params.id);
  res.status(200);
  res.json({ message: `${user.username} has been banned` });
}


// Give a user the admin role (POST /api/users/:id/make-admin)
export async function makeAdmin(req, res, next) {
  const user = await makeAdminService(req.params.id);
  res.status(200);
  res.json({ message: `${user.username} is now an admin` });
}
