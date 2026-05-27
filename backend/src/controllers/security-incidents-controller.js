import SecurityIncident from "../models/SecurityIncident.js";


// Get the 50 most recent security incidents (GET /api/security-incidents)
export async function getSecurityIncidents(req, res, next) {
  const incidents = await SecurityIncident.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("userId", "username email");
  res.status(200);
  res.json(incidents);
}
