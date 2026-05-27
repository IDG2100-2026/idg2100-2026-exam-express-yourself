import { getSecurityIncidents as getSecurityIncidentsService } from "../services/security-incidents-service.js";


// Get the 50 most recent security incidents (GET /api/security-incidents)
export async function getSecurityIncidents(req, res, next) {
  const incidents = await getSecurityIncidentsService();
  res.status(200);
  res.json(incidents);
}
