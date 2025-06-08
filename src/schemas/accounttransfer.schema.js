// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const AccountTransferSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    store: {
      type: String,
    },
    active: {
      type: Boolean,
    },
    position: {
      type: Number,
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

AccountTransferSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

AccountTransferSchema.plugin(autoIncrement, {
  model: "AccountTransfer",
  startAt: 1,
});
AccountTransferSchema.plugin(Autopopulate);

module.exports = mongoose.model("AccountTransfer", AccountTransferSchema);
