import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    location: {
      country: { type: String, default: null },
      region: { type: String, default: null },
      city: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      source: { type: String, default: "ip" },
    },

    status: {
      type: String,
      enum: ["success"],
      default: "success",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);

export default LoginActivity;
