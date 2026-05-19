import express from 'express';
import { loginController } from '../controllers/loginController.js';
import { validateLogin } from '../validators/loginValidator.js';
import { validate } from "../validators/validate.js";


const loginRoute = express.Router();

loginRoute.post("/login", validateLogin(), validate, loginController);


export default loginRoute;