const mongoose = require("mongoose");
const _ = require("lodash");

const SettingSchema = mongoose.Schema(
  {
    showCashToUsers: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

SettingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return _.omit(obj, ["__v"]);
};

module.exports = mongoose.model("Setting", SettingSchema);
