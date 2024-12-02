// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const AccountSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

/**
 * Instance method to expose to the LatBoard API only the related fields.
 */

AccountSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

AccountSchema.plugin(autoIncrement, {
  model: "Account",
  startAt: 1,
});
AccountSchema.plugin(Autopopulate);

module.exports = mongoose.model("Account", AccountSchema);
