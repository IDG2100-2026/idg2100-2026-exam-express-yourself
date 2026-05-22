import express from "express";
import { getActivity } from "../controllers/activityController.js";

const activityRoutes = express.Router();

activityRoutes.get("/", getActivity);

export default activityRoutes;
