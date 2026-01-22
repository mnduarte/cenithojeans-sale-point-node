// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const CashierSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    store: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
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
 * Instance method to expose to the API only the related fields.
 */
CashierSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return _.omit(obj, ["__v"]);
};

CashierSchema.plugin(autoIncrement, {
  model: "Cashier",
  startAt: 1,
});
CashierSchema.plugin(Autopopulate);

module.exports = mongoose.model("Cashier", CashierSchema);
