import { getPlatformActivity as getPlatformActivityService } from "../services/platform-activity-service.js";


// Get platform-wide activity stats for the homepage and admin dashboard (GET /api/platform-activity)
export async function getPlatformActivityData(req, res, next) {
  const data = await getPlatformActivityService();
  res.status(200);
  res.json(data);
}
