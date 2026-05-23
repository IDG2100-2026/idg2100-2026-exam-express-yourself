import { registerUser, authenticateUser } from "../services/authService.js";
import { matchedData } from "express-validator";

// POST /api/users/register
export const registerUserController = async (req, res, next) => {
    try{
        const userData = matchedData(req); // get only validated fields
        const newUser = await registerUser(userData); // gives the userData that the user inputted to registerUser in authService
        res.status(201).json({message: "User registered successfully", newUser}); // Success msg, user was created successfully
    }catch(err){
        next(err); // global error handling middleware
    }
}
// POST /api/users/login
export const loginUserController = async (req, res, next) => {
    try{
        const { email, password } = matchedData(req); // destructure only email and password from the data
        const user = await authenticateUser(email, password); // verifies credentials from authService

        res.status(200).json({
            message: "Login successful",
            userId: user._id, // identifier for the user
            username: user.username, // display name 
            role: user.role, // for client side auth
            eloRating: user.eloRating, // players elo rating
            profileImageUrl: user.profileImageUrl, // for ui display of avatar img
            appearance: user.appearance, // user's ui preference
        });
    }catch(err){
        next(err); // global error handling middleware
    }
}