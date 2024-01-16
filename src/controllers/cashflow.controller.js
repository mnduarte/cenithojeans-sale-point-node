// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Cashflow = new BaseModel("Cashflow");
// @Services

Controllers.create = async (req, res) => {
  try {
    const { type, amount, employee, description } = req.body;

    const newCashFlow = await Cashflow.create({
      type,
      amount,
      employee,
      description,
    });

    res.send({
      results: newCashFlow,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio" });
  }
};

module.exports = {
  Controllers,
};
