import { getPlatformActivity } from "../services/activityService.js";

export async function getActivity(req, res) {
  try {
    const activity = await getPlatformActivity(); // get the function from services
    return res.status(200).json({ activity }); // returns a 200 status with the activity!
  } catch (err) {
    return res.status(500).json({ Error: err.message }); // If any 500 status code, it gets returned
  }
}

export default getActivity;
