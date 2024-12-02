// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const SaleSchema = mongoose.Schema(
  {
    store: {
      type: String,
    },
    employee: {
      type: String,
    },
    order: {
      type: Number,
    },
    typeSale: {
      type: String,
    },
    typePayment: {
      type: String,
    },
    typeShipment: {
      type: String,
    },
    transfer: {
      type: Number,
    },
    cash: {
      type: Number,
    },
    items: {
      type: Number,
    },
    subTotalItems: {
      type: Number,
    },
    devolutionItems: {
      type: Number,
    },
    subTotalDevolutionItems: {
      type: Number,
    },
    percentageToDisccountOrAdd: {
      type: Number,
    },
    username: {
      type: String,
    },
    statusRelatedToCost: {
      type: String,
    },
    total: {
      type: Number,
    },
    description: {
      type: String,
    },
    checkoutDate: {
      type: Date,
    },
    cancelled: {
      type: Boolean,
    },
    isWithPrepaid: {
      type: Boolean,
    },
    approved: {
      type: Boolean,
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

SaleSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

SaleSchema.plugin(autoIncrement, {
  model: "Sale",
  startAt: 1,
});
SaleSchema.plugin(Autopopulate);

module.exports = mongoose.model("Sale", SaleSchema);
