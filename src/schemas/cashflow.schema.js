// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const CashflowSchema = mongoose.Schema(
  {
    type: {
      type: String,
    },
    amount: {
      type: Number,
    },
    employee: {
      type: String,
    },
    description: {
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

CashflowSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

CashflowSchema.plugin(autoIncrement, {
  model: "Cashflow",
  startAt: 1,
});
CashflowSchema.plugin(Autopopulate);

module.exports = mongoose.model("Cashflow", CashflowSchema);
