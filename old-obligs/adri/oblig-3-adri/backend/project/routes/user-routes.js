import express from "express"; //to access express.Router()
import * as userControllers from "../controllers/user-controllers.js"; //import all controller functions, now accessible through the userControllers object.

const router = express.Router(); //defines a "mini express app" holding a group of routes

//we define base path in index.js, separation of concerns, if we ever want to change the base path we just do it from one place
router.post("/", userControllers.createUser); //POST /users create new user
router.post("/login", userControllers.login); //POST /users/login login
router.get("/", userControllers.getUsers); //GET /users fetch list of all users
router.get("/leaderboard", userControllers.getLeaderboard); //GET /users/leaderboard fetch users with rankings by wins, win percentage or number of matches
router.get("/activity", userControllers.getActivity); //GET /users/activity fetch current platform activity
router.get("/:id", userControllers.getUser); //GET /users/:id fetch a user by id
router.patch("/:id", userControllers.updateUser); //PATCH /users/:id update a user profile by id
router.patch("/:id/ban", userControllers.banUser); //PATCH /users/:id/ban ban user by id
router.delete("/:id", userControllers.deleteUser); //DELETE /users/:id delete user by id

export default router; //export users routes to be imported in index.js

//ADD VALIDATORS FOR PROPER INCOMING DATA HANDLING
//ADD VALIDATORS FOR PROPER INCOMING DATA HANDLING
//ADD VALIDATORS FOR PROPER INCOMING DATA HANDLING