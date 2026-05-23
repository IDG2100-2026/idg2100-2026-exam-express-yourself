import { registerUser } from "../services/authService.js";
import { matchedData } from "express-validator";

export const registerUserController = async (req, res, next) => {
    try{
        const userData = matchedData(req);
        const newUser = await registerUser(userData);
        if(!newUser){
            return res.status(400).json({message: "Could not create a new user"})
        }
        res.status(201).json({message: "User registered successfully", newUser});
    }catch(err){
        next(err);
    }
}