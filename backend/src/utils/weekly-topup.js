import User from "../models/User.js";
import SystemSettings from "../models/SystemSettings.js";
import { MSEC_PER_DAY } from "../config/constants.js";

const TOPUP_AMOUNT = 100;
const WEEK_MS = 7 * MSEC_PER_DAY;
const CHECK_INTERVAL_MS = MSEC_PER_DAY; // check once per day

async function runTopup() {
  const result = await User.updateMany({}, { $inc: { points: TOPUP_AMOUNT } });
  await SystemSettings.findOneAndUpdate(
    { key: "lastWeeklyTopUp" },
    { value: new Date() },
    { upsert: true },
  );
  console.log(`Weekly top-up: +${TOPUP_AMOUNT} points to ${result.modifiedCount} users`);
}

async function checkAndRun() {
  const setting = await SystemSettings.findOne({ key: "lastWeeklyTopUp" });
  const lastRun = setting?.value ? new Date(setting.value) : null;
  if (!lastRun || Date.now() - lastRun.getTime() >= WEEK_MS) {
    await runTopup();
  }
}

export function scheduleWeeklyTopup() {
  checkAndRun().catch((err) => console.error("Weekly top-up check failed:", err));
  setInterval(() => {
    checkAndRun().catch((err) => console.error("Weekly top-up check failed:", err));
  }, CHECK_INTERVAL_MS);
}
