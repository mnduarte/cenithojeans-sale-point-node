// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const PriceSchema = mongoose.Schema(
  {
    price: {
      type: Number,
    },
    active: {
      type: Boolean,
    },
    type: {
      type: String,
      enum: ["jeans", "remera"],
      default: "jeans",
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

PriceSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

PriceSchema.plugin(autoIncrement, {
  model: "Price",
  startAt: 1,
});
PriceSchema.plugin(Autopopulate);

module.exports = mongoose.model("Price", PriceSchema);
