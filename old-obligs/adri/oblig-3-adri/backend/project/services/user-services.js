import User from "../models/User.js"; //import User model to interact with the users collection

export async function createUser(userData) { //create and save new user to the db
    const newUser = new User(userData); //create a new User instance from the incoming data
    return newUser.save(); //save to db
}

export async function login(username, password) { //find user by username, check if password matches
    const user = await User.findOne({ username: username }); //find first user in db matching the username
    if (!user) {
        throw new Error("UNKNOWN_USER"); //throw error if no user found
    }
    if (user.password !== password) {
        throw new Error("UNKNOWN_USER"); //throw error if password does not match
    }
    return user; //return user if exists
}

export async function getUsers(search) { //return all users from db, optionally filter
    if (search) {
        return User.find({ username: { $regex: search } }); //filter by query param if provided
    }
    return User.find(); //return all users if no query param
}

export async function getUser(id) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("NOT_FOUND");
    }
    return user;
}

export async function updateUser(id, newData) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("NOT_FOUND");
    }
    if (newData.email) {
        user.email = newData.email; //updates email if provided
    }
    if (newData.password) {
        user.password = newData.password; //update password if provided
    }
    if (newData.dateOfBirth) {
        user.dateOfBirth = newData.dateOfBirth; //update dateOfBirth if provided
    }
    if (newData.aboutMe) {
        user.aboutMe = newData.aboutMe; //update aboutMe if provided
    }
    if (newData.appearance) {
        user.appearance = newData.appearance; //update appearance settings if provided
    }
    return user.save();
}

export async function deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("NOT_FOUND");
    }
    return user.deleteOne(); //deletes user from db
}

export async function banUser(id) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("NOT_FOUND");
    }
    user.banned = true; //sets banned to true
    return user.save(); //save updated user to db
}

// export async function getLeaderboard() {
// implement after matches are working
// }