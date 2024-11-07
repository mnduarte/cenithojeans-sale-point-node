// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const { formatDate } = require("../utils/formatUtils");
const Cost = new BaseModel("Cost");

Controllers.getCosts = async (req, res) => {
  try {
    const { startDate, endDate, employee, typeShipment, checkoutDate } =
      req.query;

    const start = new Date(startDate);
    const end = new Date(
      new Date(endDate).setDate(new Date(endDate).getDate() + 1)
    );

    const query = {
      date: {
        $gte: start,
        $lt: end,
      },
    };

    if (checkoutDate === "with") {
      query.checkoutDate = { $exists: true, $ne: null };
    }

    if (checkoutDate === "wihtout") {
      query.$or = [
        { checkoutDate: { $exists: false } },
        { checkoutDate: null },
      ];
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
          checkoutDate: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$dateApproved",
            },
          },
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
      date: formatDate(date),
      account,
      numOrder,
      amount,
      approved,
      dateApproved: formatDate(dateApproved),
      employee,
      customer,
      typeShipment,
      checkoutDate: formatDate(checkoutDate),
    });

    const transformedResult = {
      ...newCost._doc,
      id: newCost._id,
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
        date: formatDate(date),
        account,
        numOrder,
        amount,
        approved,
        dateApproved: formatDate(dateApproved),
        employee,
        customer,
        typeShipment,
        checkoutDate: formatDate(checkoutDate),
      },
      { new: true }
    );

    if (!costToUpdate) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    const transformedResults = {
      ...costToUpdate._doc,
      id: costToUpdate._id,
    };

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

Controllers.removeCosts = async (req, res) => {
  try {
    const { costsIds } = req.body;

    const idsToDelete = costsIds.map((cost) => cost.id);
    const query = { _id: { $in: idsToDelete } };

    await Cost.removeMany(query);

    res.send({
      results: { message: "Datos eliminados correctamente" },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

module.exports = {
  Controllers,
};
