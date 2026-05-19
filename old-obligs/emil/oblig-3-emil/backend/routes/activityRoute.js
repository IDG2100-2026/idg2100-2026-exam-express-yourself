import express from "express";

import { getActivity } from "../controllers/activityController.js";

const activityRoute = express.Router();

activityRoute.get("/activity", getActivity);

export default activityRoute;
