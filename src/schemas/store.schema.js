// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const StoreSchema = mongoose.Schema(
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

StoreSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

StoreSchema.plugin(autoIncrement, {
  model: "Store",
  startAt: 1,
});
StoreSchema.plugin(Autopopulate);

module.exports = mongoose.model("Store", StoreSchema);
