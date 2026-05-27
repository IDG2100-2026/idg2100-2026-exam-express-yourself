import express from "express";
import { getPlatformActivityData } from "../controllers/platform-activity-controller.js";

const platformActivityRouter = express.Router();


// Public routes
platformActivityRouter.get("/", getPlatformActivityData); // get platform activity stats


export default platformActivityRouter;
