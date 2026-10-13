import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    userAgent: {
      type: String,
      maxlength: 500,
    },

    ipAddress: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Expired sessions ko MongoDB background mein delete kar sakta hai.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
