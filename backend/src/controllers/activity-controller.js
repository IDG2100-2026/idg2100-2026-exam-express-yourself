import { getPlatformActivity } from "../services/activity-service.js";

export async function getActivity(req, res, next) {
  try {
    const activity = await getPlatformActivity();
    res.json(activity);
  } catch (err) {
    next(err);
  }
}
