import { BusinessLogicError } from "../utils/errors.js";
import {
  getAllUsers as getAllUsersService,
  getUser as getUserService,
  updateUser as updateUserService,
  uploadAvatar as uploadAvatarService,
  banUser as banUserService,
  makeAdmin as makeAdminService,
  unBannUser as unBannUserService,
  unMakeAdmin as unMakeAdminService,
} from "../services/user-service.js";

// Get a paginated list of all users (GET /api/users?page=&limit=&search=)
export async function getUsers(req, res, next) {
  const result = await getAllUsersService(req.validated);
  res.status(200);
  res.json(result);
}

// Get a single user profile with their recent matches (GET /api/users/:id?matchPage=&matchLimit=)
export async function getUser(req, res, next) {
  const result = await getUserService(req.params.id, req.userId, req.validated);
  res.status(200);
  res.json(result);
}

// Update a user's profile fields or password (PATCH /api/users/:id)
export async function updateUser(req, res, next) {
  const user = await updateUserService(
    req.params.id,
    req.validated,
    req.userId,
  );
  res.status(200);
  res.json(user);
}

// Upload a profile avatar image (PATCH /api/users/:id/avatar)
export async function uploadAvatar(req, res, next) {
  if (!req.file) {
    throw new BusinessLogicError("No file uploaded", 400);
  }
  const profileImageUrl = `/uploads/${req.file.filename}`;
  const user = await uploadAvatarService(
    req.params.id,
    profileImageUrl,
    req.userId,
  );
  res.status(200);
  res.json({ profileImageUrl });
}

// Ban a user so they can no longer join tournaments or matches (POST /api/users/:id/ban)
export async function banUser(req, res, next) {
  const user = await banUserService(req.params.id);
  res.status(200);
  res.json({ message: `${user.username} has been banned` });
}

export async function unBannUser(req, res, next) {
  const user = await unBannUserService(req.params.id);
  res.status(200).json({ message: `${user.username} has been unbanned` });
}

// Give a user the admin role (POST /api/users/:id/make-admin)
export async function makeAdmin(req, res, next) {
  const user = await makeAdminService(req.params.id);
  res.status(200);
  res.json({ message: `${user.username} is now an admin` });
}

export async function unMakeAdmin(req, res, next) {
  if (req.params.id === req.userId) {
    throw new BusinessLogicError("You cannot remove your own admin role", 403);
  }
  const user = await unMakeAdminService(req.params.id);
  res
    .status(200)
    .json({ message: `${user.username} is not not an admin anymore` });
}
