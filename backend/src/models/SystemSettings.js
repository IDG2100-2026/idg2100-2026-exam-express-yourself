import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
});

export default mongoose.model("SystemSettings", systemSettingsSchema);
