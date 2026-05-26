import express from "express";
import { getPlatformActivityData } from "../controllers/platform-activity-controller.js";

const platformActivityRouter = express.Router();


// Public routes
platformActivityRouter.get("/", getPlatformActivityData);


export default platformActivityRouter;
