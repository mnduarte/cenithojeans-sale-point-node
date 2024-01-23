// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Observation = new BaseModel("Observation");
// @Services

Controllers.create = async (req, res) => {
  try {
    const { observation, store, username } = req.body;

    const newObservation = await Observation.create({
      observation,
      store,
      username,
    });

    res.send({
      results: newObservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio" });
  }
};
/*
Controllers.getCashflowByDay = async (req, res) => {
  try {
    const { date, store } = req.query;

    const addOneDayDate = new Date(
      new Date(date).setDate(new Date(date).getDate() + 1)
    );

    const query = {
      createdAt: {
        $gte: new Date(date),
        $lt: addOneDayDate,
      },
    };

    if (store !== "ALL") {
      query.store = store;
    }

    const cashflows = await Cashflow.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          type: 1,
          amount: 1,
          employee: 1,
          store: 1,
          description: 1,
          _id: 0,
        },
      },
    ]);

    const cashflowByType = {
      incomes: [],
      outgoings: [],
    };

    cashflows.forEach((cashflow) => {
      cashflow.type === "ingreso"
        ? cashflowByType.incomes.push(cashflow)
        : cashflowByType.outgoings.push(cashflow);
    });

    res.send({ results: cashflowByType });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};*/

module.exports = {
  Controllers,
};
