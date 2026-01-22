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
    dateCashierId: {
      type: Number,
      ref: "Cashier",
    },
    dateCashierName: {
      type: String,
    },
    accountCashierId: {
      type: Number,
      ref: "Cashier",
    },
    accountCashierName: {
      type: String,
    },
    numOrderCashierId: {
      type: Number,
      ref: "Cashier",
    },
    numOrderCashierName: {
      type: String,
    },
    amountCashierId: {
      type: Number,
      ref: "Cashier",
    },
    amountCashierName: {
      type: String,
    },
    approvedCashierId: {
      type: Number,
      ref: "Cashier",
    },
    approvedCashierName: {
      type: String,
    },
    dateApprovedCashierId: {
      type: Number,
      ref: "Cashier",
    },
    dateApprovedCashierName: {
      type: String,
    },
    employeeCashierId: {
      type: Number,
      ref: "Cashier",
    },
    employeeCashierName: {
      type: String,
    },
    customerCashierId: {
      type: Number,
      ref: "Cashier",
    },
    customerCashierName: {
      type: String,
    },
    typeShipmentCashierId: {
      type: Number,
      ref: "Cashier",
    },
    typeShipmentCashierName: {
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
