// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const { formatDate } = require("../utils/formatUtils");
const Sale = new BaseModel("Sale");
const Cost = new BaseModel("Cost");
const Account = new BaseModel("Account");

Controllers.getCosts = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      accounts,
      employees,
      typeShipment,
      checkoutDate,
      store,
    } = req.query;

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

    if (accounts) {
      query.account = { $in: accounts.split(",") };
    }

    if (employees) {
      query.employee = { $in: employees.split(",") };
    }

    if (typeShipment) {
      query.typeShipment = typeShipment;
    }

    if (store) {
      query.store = store;
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
          items: 1,
          store: 1,
          checkoutDate: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$checkoutDate",
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

    const propsCost = {
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
    };

    const order = await Sale.findOne({
      order: numOrder,
      employee,
    });

    propsCost.items = order ? order.items : null;
    propsCost.store = order ? order.store : null;

    const newCost = await Cost.create(propsCost);

    const transformedResult = {
      ...newCost._doc,
      id: newCost._id,
    };

    /* ACTUALIZA ORDEN */
    const costs = await Cost.find(
      {
        numOrder,
        employee,
      },
      {
        approved: 1,
        amount: 1,
      }
    );

    let totalAmount = 0;
    let allApproved = true;

    for (const cost of costs) {
      if (!cost.approved) {
        allApproved = false;
        break;
      }
      totalAmount += cost.amount;
    }

    order.approved = order && totalAmount >= order.transfer && allApproved;
    await order.save();

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

    const propsCost = {
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
    };

    const order = await Sale.findOne({
      order: numOrder,
      employee,
    });

    propsCost.items = order ? order.items : null;
    propsCost.store = order ? order.store : null;

    const costToUpdate = await Cost.findByIdAndUpdate(id, propsCost, {
      new: true,
    });

    if (!costToUpdate) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    const transformedResults = {
      ...costToUpdate._doc,
      id: costToUpdate._id,
    };

    /* ACTUALIZA ORDEN */
    const costs = await Cost.find(
      {
        numOrder,
        employee,
      },
      {
        approved: 1,
        amount: 1,
      }
    );

    let totalAmount = 0;
    let allApproved = true;

    for (const cost of costs) {
      if (!cost.approved) {
        allApproved = false;
        break;
      }
      totalAmount += cost.amount;
    }

    order.approved = order && totalAmount >= order.transfer && allApproved;
    await order.save();

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

/**ACCOUNTS */

Controllers.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.aggregate([
      { $match: {} },
      {
        $project: {
          id: "$_id",
          name: 1,
          _id: 0,
        },
      },
    ]);

    res.send({ results: accounts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar cuentas" });
  }
};

Controllers.createAccount = async (req, res) => {
  try {
    const { name } = req.body;

    const newAccount = await Account.create({
      name,
    });

    const transformedResult = {
      ...newAccount._doc,
      id: newAccount._id,
    };

    res.send({ results: transformedResult });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Account" });
  }
};

Controllers.updateAccount = async (req, res) => {
  try {
    const { id, name } = req.body;

    const accountToUpdate = await Account.findByIdAndUpdate(
      id,
      {
        name,
      },
      { new: true }
    );

    if (!accountToUpdate) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    const transformedResults = {
      ...accountToUpdate._doc,
      id: accountToUpdate._id,
    };

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

Controllers.removeAccounts = async (req, res) => {
  try {
    const { accountsIds } = req.body;

    const idsToDelete = accountsIds.map((cost) => cost.id);
    const query = { _id: { $in: idsToDelete } };

    await Account.removeMany(query);

    res.send({
      results: { message: "Datos eliminados correctamente" },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error remove accounts" });
  }
};

module.exports = {
  Controllers,
};
