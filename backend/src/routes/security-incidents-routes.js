import express from "express";
import { getSecurityIncidents } from "../controllers/security-incidents-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";

const securityIncidentsRouter = express.Router();


securityIncidentsRouter.use(authenticate);


// Admin only
securityIncidentsRouter.get("/", authorize("admin"), getSecurityIncidents); // get all security incidents

export default securityIncidentsRouter;
