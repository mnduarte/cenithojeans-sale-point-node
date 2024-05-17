// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Sale = new BaseModel("Sale");
const Cashflow = new BaseModel("Cashflow");
const Observation = new BaseModel("Observation");

// @Services
Controllers.deleteData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      const addOneDayDate = new Date(
        new Date(endDate).setDate(new Date(endDate).getDate() + 1)
      );

      query.createdAt = {
        $gte: new Date(startDate),
        $lt: addOneDayDate,
      };
    }

    await Sale.removeMany(query);
    await Cashflow.removeMany(query);
    await Observation.removeMany(query);

    res.send({
      results: { message: "Datos eliminados correctamente" },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

module.exports = {
  Controllers,
};
