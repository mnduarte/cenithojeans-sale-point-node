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
    // Montos BASE (antes de aplicar descuento/recargo) - para cálculo correcto en pago mixto
    baseCash: {
      type: Number,
      default: 0,
    },
    baseTransfer: {
      type: Number,
      default: 0,
    },
    items: {
      type: Number,
    },
    // Items por tipo de producto
    itemsJeans: {
      type: Number,
      default: 0,
    },
    itemsRemeras: {
      type: Number,
      default: 0,
    },
    // Items devolución por tipo
    itemsDevolutionJeans: {
      type: Number,
      default: 0,
    },
    itemsDevolutionRemeras: {
      type: Number,
      default: 0,
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
    // Subtotales CASH por tipo de producto
    subTotalCashJeans: {
      type: Number,
      default: 0,
    },
    subTotalCashRemeras: {
      type: Number,
      default: 0,
    },
    // Subtotales TRANSFER por tipo de producto
    subTotalTransferJeans: {
      type: Number,
      default: 0,
    },
    subTotalTransferRemeras: {
      type: Number,
      default: 0,
    },
    // Subtotales devolución CASH por tipo
    subTotalDevolutionCashJeans: {
      type: Number,
      default: 0,
    },
    subTotalDevolutionCashRemeras: {
      type: Number,
      default: 0,
    },
    // Subtotales devolución TRANSFER por tipo
    subTotalDevolutionTransferJeans: {
      type: Number,
      default: 0,
    },
    subTotalDevolutionTransferRemeras: {
      type: Number,
      default: 0,
    },
    // Montos de recargos y descuentos
    amountOfSurchargesCash: {
      type: Number,
      default: 0,
    },
    amountOfDiscountCash: {
      type: Number,
      default: 0,
    },
    amountOfSurchargesTransfer: {
      type: Number,
      default: 0,
    },
    amountOfDiscountTransfer: {
      type: Number,
      default: 0,
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
    accountForTransfer: {
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
    cancellationReason: {
      type: String,
    },
    cancellationByUser: {
      type: String,
    },
    cancellationDate: {
      type: Date,
    },
    isWithPrepaid: {
      type: Boolean,
    },
    approved: {
      type: Boolean,
    },
    cashierId: {
      type: Number,
      ref: "Cashier",
    },
    cashierName: {
      type: String,
    },
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
