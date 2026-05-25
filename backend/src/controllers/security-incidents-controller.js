import SecurityIncident from "../models/SecurityIncident.js";

export const getSecurityIncidents = async (req, res, next) => {
  try {
    const incidents = await SecurityIncident.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "username email");
    res.json(incidents);
  } catch (err) {
    next(err);
  }
};
