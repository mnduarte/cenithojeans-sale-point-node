const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const UpdateDbSchema = mongoose.Schema(
  {
    filename: String,
    executed: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    },
    error: {
      message: String,
      stack: String
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
);

UpdateDbSchema.plugin(autoIncrement, {
  model: 'UpdateDb',
  startAt: 10
});

module.exports = mongoose.model('UpdateDb', UpdateDbSchema);
