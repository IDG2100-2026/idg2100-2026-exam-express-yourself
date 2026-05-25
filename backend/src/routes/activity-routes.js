import express from "express";
import { getActivity } from "../controllers/activity-controller.js";

const activityRoutes = express.Router();

activityRoutes.get("/", getActivity);

export default activityRoutes;
