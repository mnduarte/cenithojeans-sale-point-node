// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const { formatDate } = require("../utils/formatUtils");
const Sale = new BaseModel("Sale");
const Cost = new BaseModel("Cost");
const Account = new BaseModel("Account");
const Employee = new BaseModel("Employee");

const adjustItemsForCosts = (costs) => {
  const seenGroups = new Set();

  return costs.map((cost) => {
    const groupKey = `${cost.numOrder}-${cost.employee || "null"}`;

    if (seenGroups.has(groupKey)) {
      return { ...cost, items: null };
    }

    seenGroups.add(groupKey);
    return cost;
  });
};

const now = new Date();
const fifteenDaysAgo = new Date();
fifteenDaysAgo.setDate(now.getDate() - 15);

Controllers.getCosts = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      accounts,
      employees,
      typeShipment,
      checkoutDate,
      approved,
      store,
      q,
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
      query.$or = [{ store: store }, { store: null }];
    }

    if (checkoutDate === "with") {
      query.checkoutDate = { $exists: true, $ne: null };
    }

    if (checkoutDate === "wihtout") {
      query.$or = [
        { checkoutDate: { $exists: false } },
        { checkoutDate: null },
      ];
    }

    if (approved === "approved") {
      query.approved = { $exists: true, $ne: null };
    }

    if (approved === "withoutApproved") {
      query.$or = [{ approved: { $exists: false } }, { approved: null }];
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
          linkedOnOrder: 1,
          backgroundColor: 1,
          textColor: 1,
          color: 1,
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

    const updatedCostsForItems = adjustItemsForCosts(costs);

    if (q) {
      const filteredCosts = updatedCostsForItems.filter((cost) => {
        // Extrae solo los valores de las propiedades específicas
        const searchableText = [
          "date",
          "account",
          "numOrder",
          "amount",
          "store",
          "items",
          "dateApproved",
          "employee",
          "customer",
          "typeShipment",
          "checkoutDate",
        ]
          .map((key) => (cost[key] ? cost[key].toString().toLowerCase() : ""))
          .join(" ");
        return searchableText.includes(q.toLowerCase());
      });
      return res.send({ results: filteredCosts });
    }

    res.send({ results: updatedCostsForItems });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar gastos" });
  }
};

Controllers.getCostsByDateApproved = async (req, res) => {
  try {
    const { dateApproved, store } = req.query;

    const start = new Date(dateApproved);
    const end = new Date(
      new Date(dateApproved).setDate(new Date(dateApproved).getDate() + 1)
    );

    const query = {
      dateApproved: {
        $gte: start,
        $lt: end,
      },
    };

    if (store) {
      query.$or = [{ store: store }, { store: null }];
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
          linkedOnOrder: 1,
          checkoutDate: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$checkoutDate",
            },
          },
          _id: 0,
        },
      },
      { $sort: { numOrder: 1, employee: 1 } },
    ]);

    const updatedCostsForItems = adjustItemsForCosts(costs);

    res.send({ results: updatedCostsForItems });
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
      typeSale: "pedido",
      createdAt: { $gte: fifteenDaysAgo },
    });

    let dataEmployee = {};
    if (!order && employee) {
      dataEmployee = await Employee.findOne({
        name: employee,
      });
    }

    propsCost.items = Boolean(order) ? order.items : null;
    propsCost.checkoutDate = Boolean(order)
      ? order.checkoutDate
      : formatDate(checkoutDate);
    propsCost.typeShipment = Boolean(order) ? order.typeShipment : typeShipment;
    propsCost.store = Boolean(order) ? order.store : dataEmployee.store || null;
    propsCost.linkedOnOrder = Boolean(order);

    const newCost = await Cost.create(propsCost);

    const transformedResult = {
      ...newCost._doc,
      id: newCost._id,
    };

    /* ACTUALIZA ORDEN */

    if (order) {
      const costs = await Cost.find(
        {
          numOrder,
          employee,
          createdAt: { $gte: fifteenDaysAgo },
        },
        {
          approved: 1,
          amount: 1,
        }
      );

      let totalAmount = 0;
      let allApproved = true;

      for (const cost of costs) {
        totalAmount += cost.amount;
      }

      for (const cost of costs) {
        if (!cost.approved) {
          allApproved = false;
          break;
        }
      }

      const isApproved = order && totalAmount >= order.transfer && allApproved;

      order.approved = isApproved;

      if (order.transfer) {
        order.statusRelatedToCost =
          Boolean(totalAmount) && order.transfer > totalAmount
            ? "partialPayment"
            : isApproved && !Boolean(order.cash)
            ? "approved"
            : isApproved && Boolean(order.cash)
            ? "approvedHasCash"
            : "withoutPayment";
      }

      if (!order.transfer) {
        order.statusRelatedToCost = null;
      }

      await order.save();
    }

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
      typeSale: "pedido",
      createdAt: { $gte: fifteenDaysAgo },
    });

    let dataEmployee = {};
    if (!order && employee) {
      dataEmployee = await Employee.findOne({
        name: employee,
      });
    }

    propsCost.items = Boolean(order) ? order.items : null;
    propsCost.checkoutDate = Boolean(order)
      ? order.checkoutDate
      : formatDate(checkoutDate);
    propsCost.typeShipment = Boolean(order) ? order.typeShipment : typeShipment;
    propsCost.store = Boolean(order) ? order.store : dataEmployee.store || null;
    propsCost.linkedOnOrder = Boolean(order);

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
    if (order) {
      const costs = await Cost.find(
        {
          numOrder,
          employee,
          createdAt: { $gte: fifteenDaysAgo },
        },
        {
          approved: 1,
          amount: 1,
        }
      );

      let totalAmount = 0;
      let allApproved = true;

      for (const cost of costs) {
        totalAmount += cost.amount;
      }

      for (const cost of costs) {
        if (!cost.approved) {
          allApproved = false;
          break;
        }
      }

      const isApproved = order && totalAmount >= order.transfer && allApproved;

      order.approved = isApproved;

      if (order.transfer) {
        order.statusRelatedToCost =
          Boolean(totalAmount) && order.transfer > totalAmount
            ? "partialPayment"
            : isApproved && !Boolean(order.cash)
            ? "approved"
            : isApproved && Boolean(order.cash)
            ? "approvedHasCash"
            : "withoutPayment";
      }

      if (!order.transfer) {
        order.statusRelatedToCost = null;
      }

      await order.save();
    }

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

Controllers.updateColor = async (req, res) => {
  try {
    const { costsIds, backgroundColor, textColor, color } = req.body;

    const idsToChangeColor = costsIds.map((cost) => cost.id);

    await Cost.updateMany(
      { _id: { $in: idsToChangeColor } },
      {
        $set: {
          backgroundColor,
          textColor,
          color,
        },
      }
    );

    res.send({
      results: { message: "Colores de pagos actualizados correctamente" },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when updating Cost" });
  }
};

Controllers.removeCosts = async (req, res) => {
  try {
    const { costsIds } = req.body;

    const idsToDelete = costsIds.map((cost) => cost.id);
    const query = { _id: { $in: idsToDelete } };

    const costs = await Cost.aggregate([
      { $match: query },
      {
        $project: {
          numOrder: 1,
          employee: 1,
          items: 1,
          store: 1,
        },
      },
    ]);

    const { numOrder, employee, items, store } = costs[0];

    const order = await Sale.findOne({
      order: numOrder,
      employee,
      items,
      store,
      typeSale: "pedido",
      createdAt: { $gte: fifteenDaysAgo },
    });

    if (order) {
      order.statusRelatedToCost = null;

      await order.save();
    }

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
