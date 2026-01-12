// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const CostSchema = mongoose.Schema(
  {
    date: {
      type: Date,
    },
    account: {
      type: String,
    },
    numOrder: {
      type: String,
    },
    amount: {
      type: Number,
    },
    approved: {
      type: Boolean,
    },
    dateApproved: {
      type: Date,
    },
    employee: {
      type: String,
    },
    customer: {
      type: String,
    },
    typeShipment: {
      type: String,
    },
    checkoutDate: {
      type: Date,
    },
    items: {
      type: Number,
    },
    store: {
      type: String,
    },
    linkedOnOrder: {
      type: Boolean,
    },
    backgroundColor: {
      type: String,
    },
    textColor: {
      type: String,
    },
    color: {
      type: String,
    },
    // Campos de cajero
    cashierId: {
      type: Number,
      ref: "Cashier",
    },
    cashierName: {
      type: String,
    },
    // Cajero que editó por última vez
    lastEditCashierId: {
      type: Number,
      ref: "Cashier",
    },
    lastEditCashierName: {
      type: String,
    },
    checkoutCashierId: {
      type: Number,
      ref: "Cashier",
    },
    checkoutCashierName: {
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

CostSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

CostSchema.plugin(autoIncrement, {
  model: "Cost",
  startAt: 1,
});
CostSchema.plugin(Autopopulate);

module.exports = mongoose.model("Cost", CostSchema);
