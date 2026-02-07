// @Vendors
const mongoose = require("mongoose");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const PrinterSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    networkName: {
      type: String,
      required: true,
    },
    store: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDefault: {
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
PrinterSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return _.omit(obj, ["__v"]);
};

// NO usar autoIncrement para Printer - usamos ObjectId nativo
PrinterSchema.plugin(Autopopulate);

module.exports = mongoose.model("Printer", PrinterSchema);
