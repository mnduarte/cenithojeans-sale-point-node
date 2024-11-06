// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const { formatCheckoutDate, formatDate } = require("../utils/formatUtils");
const Cost = new BaseModel("Cost");
const Employee = new BaseModel("Employee");

Controllers.getCosts = async (req, res) => {
  try {
    const { startDate, endDate, store, employee } = req.query;

    const addOneDayDate = new Date(
      new Date(endDate).setDate(new Date(endDate).getDate() + 1)
    );

    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lt: addOneDayDate,
      },
    };

    // Agregar store a la consulta si está presente
    if (store) {
      query.store = store;
    }

    // Agregar employee a la consulta si está presente
    if (employee) {
      query.employee = employee;
    }

    const sales = await Cost.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          store: 1,
          order: 1,
          employee: 1,
          typeSale: 1,
          typePayment: 1,
          typeShipment: 1,
          items: 1,
          subTotalItems: 1,
          devolutionItems: 1,
          subTotalDevolutionItems: 1,
          percentageToDisccountOrAdd: 1,
          username: 1,
          cancelled: 1,
          total: 1,
          date: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$createdAt",
            },
          },
          _id: 0,
        },
      },
    ]);

    res.send({ results: sales });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const {
      date,
      account,
      amount,
      approbed,
      dateApproved,
      employee,
      customer,
      typeShipment,
      checkoutDate,
    } = req.body;

    const newCost = await Cost.create({
      date,
      account,
      amount,
      approbed,
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
      amount,
      approbed,
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
        amount,
        approbed,
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
      ...(costToUpdate.checkoutDate && {
        checkoutDate: formatCheckoutDate(costToUpdate.checkoutDate),
      }),
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
