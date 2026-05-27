import mongoose from "mongoose";

const securityIncidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Incident type is required. [schema]"],
      enum: {
        values: ["rate-limit", "ip-change"],
        message: "Type must be one of: rate-limit, ip-change. [schema]",
      },
    },
    ip: { type: String, default: "unknown" },
    userAgent: { type: String, default: "unknown" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const SecurityIncident = mongoose.model("SecurityIncident", securityIncidentSchema, "security_incidents");
export default SecurityIncident;
