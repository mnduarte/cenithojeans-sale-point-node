// @Vendors
const mongoose = require("mongoose");
const autoIncrement = require("mongoose-plugin-autoinc").autoIncrement;

const AuditLogSchema = mongoose.Schema(
  {
    author: String,
    message: String,
    severity: String,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

AuditLogSchema.plugin(autoIncrement, {
  model: "AuditLog",
  startAt: 1,
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);
