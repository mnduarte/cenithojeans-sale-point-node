// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const { formatCheckoutDate, formatDate } = require("../utils/formatUtils");
const Cost = new BaseModel("Cost");
const Employee = new BaseModel("Employee");

Controllers.getCosts = async (req, res) => {
  try {
    const { startDate, endDate, employee, typeShipment, checkoutDate } =
      req.query;

    const start = new Date(startDate);
    const end = new Date(
      new Date(endDate).setDate(new Date(endDate).getDate() + 1)
    );

    const query = {
      createdAt: {
        $gte: start,
        $lt: end,
      },
    };

    if (checkoutDate === "with") {
      query.checkoutDate = { $exists: true, $ne: "" };
    } else if (checkoutDate === "without") {
      query.$or = [{ checkoutDate: { $exists: false } }, { checkoutDate: "" }];
    }

    if (employee) {
      query.employee = employee;
    }

    if (typeShipment) {
      query.typeShipment = typeShipment;
    }

    const costs = await Cost.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          date: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$date",
            },
          },
          account: 1,
          numOrder: 1,
          amount: 1,
          approved: 1,
          dateApproved: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$dateApproved",
            },
          },
          employee: 1,
          customer: 1,
          typeShipment: 1,
          checkoutDate: 1, // Keep checkoutDate as a string
          _id: 0,
        },
      },
    ]);

    res.send({ results: costs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar gastos" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const {
      date,
      account,
      numOrder,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
    } = req.body;

    const newCost = await Cost.create({
      date,
      account,
      numOrder,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
    });

    const transformedResult = {
      ...newCost._doc,
      id: newCost._id,
      date: formatDate(newCost.date),
      dateApproved: formatDate(newCost.dateApproved),
      checkoutDate: formatDate(newCost.checkoutDate),
    };

    res.send({ results: transformedResult });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Cost" });
  }
};

Controllers.update = async (req, res) => {
  try {
    const {
      id,
      date,
      account,
      numOrder,
      amount,
      approved,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
    } = req.body;

    const costToUpdate = await Cost.findByIdAndUpdate(
      id,
      {
        date,
        account,
        numOrder,
        amount,
        approved,
        dateApproved,
        employee,
        customer,
        typeShipment,
        checkoutDate,
      },
      { new: true }
    );

    if (!costToUpdate) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    const transformedResults = {
      ...costToUpdate._doc,
      id: costToUpdate._id,
      date: formatDate(costToUpdate.date),
      dateApproved: formatDate(costToUpdate.dateApproved),
      checkoutDate: formatDate(costToUpdate.checkoutDate),
    };

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

module.exports = {
  Controllers,
};
