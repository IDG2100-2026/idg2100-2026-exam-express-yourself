import SecurityIncident from "../models/SecurityIncident.js";


// Get the 50 most recent security incidents for the admin dashboard
export async function getSecurityIncidents() {
  const incidents = await SecurityIncident.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("userId", "username email");

  return incidents;
}


// Record a new security incident (rate-limit hit or IP change)
export async function logIncident({ type, ip, userAgent, userId = null }) {
  return await SecurityIncident.create({ type, ip, userAgent, userId });
}
