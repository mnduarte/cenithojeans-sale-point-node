// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const EmployeeSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    store: {
      type: String,
    },
    newNumOrder: {
      type: String,
    },
    enableNewNumOrder: {
      type: Boolean,
    },
    active: {
      type: Boolean,
    },
    position: {
      type: Number,
    },
    activeForCost: {
      type: Boolean,
    },
    // Tipo de venta asignado: "ambos", "local", "pedido"
    saleType: {
      type: String,
      enum: ["ambos", "local", "pedido"],
      default: "ambos",
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

EmployeeSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

EmployeeSchema.plugin(autoIncrement, {
  model: "Employee",
  startAt: 1,
});
EmployeeSchema.plugin(Autopopulate);

module.exports = mongoose.model("Employee", EmployeeSchema);
