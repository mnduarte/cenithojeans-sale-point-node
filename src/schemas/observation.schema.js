// @Vendors
const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");
const Autopopulate = require("mongoose-autopopulate");
const _ = require("lodash");

const ObservationSchema = mongoose.Schema(
  {
    observation: {
      type: String,
    },
    store: {
      type: String,
    },
    store: {
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

ObservationSchema.methods.toJSON = function () {
  const obj = this.toObject();

  return _.omit(obj, ["__v"]);
};

ObservationSchema.plugin(autoIncrement, {
  model: "Observation",
  startAt: 1,
});
ObservationSchema.plugin(Autopopulate);

module.exports = mongoose.model("Observation", ObservationSchema);
