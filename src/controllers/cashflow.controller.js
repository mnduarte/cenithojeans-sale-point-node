// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Cashflow = new BaseModel("Cashflow");
// @Services

Controllers.create = async (req, res) => {
  try {
    const {
      type,
      amount,
      employee,
      store,
      description,
      items,
      typePayment,
      date,
    } = req.body;

    const newCashFlow = await Cashflow.create({
      type,
      amount,
      employee,
      store,
      description,
      items,
      typePayment,
      date,
    });

    res.send({
      results: newCashFlow,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Error al crear` });
  }
};

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
      { $match: { ...query, cancelled: { $exists: false } } },
      {
        $project: {
          id: "$_id",
          type: 1,
          amount: 1,
          employee: 1,
          store: 1,
          description: 1,
          typePayment: 1,
          items: 1,
          _id: 0,
        },
      },
    ]);

    const cashflowByType = {
      incomes: [],
      outgoings: [],
    };

    cashflows
      .map((cashflow) => ({
        ...cashflow,
        cash:
          !Boolean(cashflow.typePayment) || cashflow.typePayment === "cash"
            ? cashflow.amount
            : 0,
        transfer: cashflow.typePayment === "transfer" ? cashflow.amount : 0,
      }))
      .forEach((cashflow) => {
        cashflow.type === "ingreso"
          ? cashflowByType.incomes.push(cashflow)
          : cashflowByType.outgoings.push(cashflow);
      });

    res.send({ results: cashflowByType });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

Controllers.getOutgoingsByDay = async (req, res) => {
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

    query.store = store;
    query.type = "egreso";

    const outgoings = await Cashflow.aggregate([
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

    res.send({ results: outgoings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

Controllers.update = async (req, res) => {
  try {
    const { id, dataIndex, value } = req.body;
    const updatedPrice = await Cashflow.findByIdAndUpdate(
      { _id: id },
      { [dataIndex]: value }
    );

    const transformedResults = {
      ...updatedPrice._doc,
      id: updatedPrice._id,
    };

    if (updatedPrice.checkoutDate) {
      transformedResults.checkoutDate = formatCheckoutDate(
        updatedPrice.checkoutDate
      );
    }

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

Controllers.remove = async (req, res) => {
  try {
    const { cashflowIds } = req.body;

    let cashflowCancelled;

    const chasflowsIdsToUpdate = cashflowIds.map(({ id }) => id);

    await Cashflow.updateMany(
      { _id: { $in: chasflowsIdsToUpdate } },
      { $set: { cancelled: true } }
    );

    cashflowCancelled = await Cashflow.aggregate([
      { $match: { _id: { $in: chasflowsIdsToUpdate } } },
      {
        $project: {
          id: "$_id",
          type: 1,
          amount: 1,
          employee: 1,
          store: 1,
          description: 1,
          items: 1,
          _id: 0,
        },
      },
    ]);

    res.send({
      results: cashflowCancelled,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

module.exports = {
  Controllers,
};
