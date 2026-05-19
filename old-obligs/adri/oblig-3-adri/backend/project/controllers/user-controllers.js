import * as userServices from "../services/user-services.js"; //import service functions, accessible with dot notation on the userServices object

export async function createUser(req, res) { //create new user in the db. async needed to use await since we call service function which talks to the db, which is an asynchronous operation
    try { //try run this code first, if error thrown run catch
        const userData = req.body; //get user data from request body
        await userServices.createUser(userData); //pass data to service to save to db, asynchronous operation so await keyword is used to keep code running whil db operation happens in bg
        res.status(201); //201 status code means created
        res.json({ message: "User successfully registered" }); //responds client with success message
    } catch (error) { //catches unexpected server errors and responds with status 500 and error message
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function login(req, res) { //log in existing user and return their id
    try {
        const username = req.body.username; //get username from req body
        const password = req.body.password; //get password from req body
        const user = await userServices.login(username, password); //pass data to service for db query
        res.status(200);
        res.json({ message: "Login successful", _id: user._id }); //respond with success and user id
    } catch (error) { //handles errors
        if (error.message === "UNKNOWN_USER") {
            res.status(401);
            res.json({ error: "UNKNOWN_USER", message: "Login credentials dont match existing user" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function getUsers(req, res) { //return list of all users, filterable by username
    try {
        const role = req.role;
        const search = req.query.search;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return; //stop execution here
        } else {
            const users = await userServices.getUsers(search);
            res.status(200);
            res.json(users.map((user) => {
                return {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    elo: user.elo,
                    role: user.role,
                    trophies: user.trophies
                };
            }));
        }
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export function getLeaderboard(req, res) { //return users sorted by wins, win percentage, or total matches
    res.status(200).json({ message: "not implemented yet" });
}

export function getActivity(req, res) { //return current platform activity stats
    res.status(200).json({ message: "not implemented yet" });
}

export async function getUser(req, res) { //returns one user profile by id
    try {
        const id = req.params.id;
        const user = await userServices.getUser(id);
        res.status(200);
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            elo: user.elo,
            eloChangeThisWeek: 0,
            role: user.role,
            trophies: user.trophies,
            aboutMe: user.aboutMe,
            appearance: user.appearance,
            recentGames: []
        });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "User not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function updateUser(req, res) { //updates one user profile by id
    try {
        const id = req.params.id;
        const newData = req.body;
        const newUser = await userServices.updateUser(id, newData);
        res.status(200);
        res.json({ message: "User successfully updated" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "User not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function banUser(req, res) { //bans a user by id, requires admin role
    try {
        const role = req.role;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const id = req.params.id;
        await userServices.banUser(id);
        res.status(200);
        res.json({ message: "User banned successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "User not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function deleteUser(req, res) { //deletes a user by id, requires admin role
    try {
        const role = req.role;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const id = req.params.id;
        await userServices.deleteUser(id);
        res.status(200);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "User not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export default {
    createUser,
    login,
    getUsers,
    getLeaderboard,
    getActivity,
    getUser,
    updateUser,
    banUser,
    deleteUser
};




/*
-------------------------TODO LIST:---------------------------

in getUser():
eloChangeThisWeek: 0    calculate elo change over past week from match history
recentGames: []         query matches collection for last 10 games this user played

getLeaderboard()        implement after matches are working
getActivity()           implement after matches are working

*/