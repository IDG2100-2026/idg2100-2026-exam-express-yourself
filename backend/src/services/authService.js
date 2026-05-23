import User from "../models/User.js";
import { chechPassword, hashPassword } from "../utils/passwordHash.js";
import { Session } from "../models/Sessions.js";

export const registerUser = async (userData) => {
    const newUser = await new User({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        age: userData.age,
        roles: userData.role || 'user'
    });
    return await newUser.save();
}