import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // SHA-256 hash of the current refresh token.
    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    // Shared ID across rotated tokens in the same session family.
    familyId: {
      type: String,
      required: true,
      index: true,
    },

    // Hash of the replacement token after rotation.
    replacedByTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },

    revocationReason: {
      type: String,
      enum: [
        "logout",
        "logout_all",
        "token_reuse",
        "suspicious_login",
        "admin_action",
        "expired",
      ],
      default: null,
    },

    userAgent: {
      type: String,
      maxlength: 500,
      default: "",
    },

    ipAddress: {
      type: String,
      maxlength: 100,
      default: "",
    },

    deviceName: {
      type: String,
      maxlength: 200,
      default: "Unknown device",
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    suspiciousActivity: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// MongoDB deletes expired sessions asynchronously.
// Always validate expiresAt in application code too.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.index({ user: 1, revokedAt: 1 });
sessionSchema.index({ user: 1, familyId: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
