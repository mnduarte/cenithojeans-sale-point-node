// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const {
  formatCurrency,
  calculateTotalPercentage,
  formatCheckoutDate,
} = require("../utils/formatUtils");
const Sale = new BaseModel("Sale");
const Employee = new BaseModel("Employee");
const Cashflow = new BaseModel("Cashflow");
const Cost = new BaseModel("Cost");

//const printer = require("@woovi/node-printer");

const now = new Date();
const fifteenDaysAgo = new Date();
fifteenDaysAgo.setDate(now.getDate() - 15);

const getAllEmployees = async (store = "ALL") => {
  const filter = store === "ALL" ? {} : { store };

  const employees = await Employee.aggregate([
    {
      $match: filter,
    },
    {
      $project: {
        id: "$_id",
        name: 1,
        active: 1,
        store: 1,
        position: 1,
        _id: 0,
      },
    },
  ]);

  return employees;
};

Controllers.getSales = async (req, res) => {
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

    const sales = await Sale.aggregate([
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

Controllers.getOrders = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      typeSale,
      store,
      employee,
      typeShipment,
      checkoutDate,
    } = req.query;

    const addOneDayDate = new Date(
      new Date(endDate).setDate(new Date(endDate).getDate() + 1)
    );

    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lt: addOneDayDate,
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

    if (store) {
      query.store = store;
    }

    if (employee) {
      query.employee = employee;
    }

    if (typeShipment) {
      query.typeShipment = typeShipment;
    }

    query.typeSale = typeSale;

    const orders = await Sale.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          store: 1,
          order: 1,
          employee: 1,
          typeShipment: 1,
          lastTypePaymentUpdated: 1,
          transfer: 1,
          cash: 1,
          items: 1,
          username: 1,
          total: 1,
          cancelled: 1,
          isWithPrepaid: 1,
          checkoutDate: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$checkoutDate",
            },
          },
          approved: 1,
          statusRelatedToCost: 1,
          date: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$createdAt",
            },
          },
          _id: 1,
        },
      },
    ]);

    res.send({ results: orders.map((order) => ({ ...order })) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar ordenes" });
  }
};

Controllers.getOrdersCheckoutDate = async (req, res) => {
  try {
    const { startDate, endDate, typeSale, store, employee, typeShipment } =
      req.query;

    const addOneDayDate = new Date(
      new Date(endDate).setDate(new Date(endDate).getDate() + 1)
    );

    const query = {
      checkoutDate: {
        $gte: new Date(startDate),
        $lt: addOneDayDate,
      },
    };

    if (store) {
      query.store = store;
    }

    if (typeShipment) {
      query.typeShipment = typeShipment;
    }

    if (employee) {
      query.employee = employee;
    }

    query.typeSale = typeSale;

    const orders = await Sale.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          store: 1,
          order: 1,
          employee: 1,
          typeShipment: 1,
          lastTypePaymentUpdated: 1,
          transfer: 1,
          cash: 1,
          items: 1,
          username: 1,
          total: 1,
          cancelled: 1,
          approved: 1,
          checkoutDate: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$checkoutDate",
            },
          },
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

    res.send({ results: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar ordenes" });
  }
};

Controllers.getSalesCashByEmployees = async (req, res) => {
  try {
    const { date, store } = req.query;

    const addOneDayDate = new Date(
      new Date(date).setDate(new Date(date).getDate() + 1)
    );

    const cashflows = await Cashflow.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(date),
            $lt: addOneDayDate,
          },
          type: "ingreso",
          cancelled: { $ne: true },
          $or: [{ typePayment: { $exists: false } }, { typePayment: "cash" }],

          ...(store !== "ALL" && { store: store }),
        },
      },
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

    const sales = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(date),
            $lt: addOneDayDate,
          },
          typeSale: "local",
          $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
          cancelled: { $ne: true },
          $and: [{ checkoutDate: { $exists: false } }],
          ...(store !== "ALL" && { store: store }),
        },
      },
      {
        $project: {
          id: "$_id",
          order: 1,
          typeSale: 1,
          employee: 1,
          username: 1,
          items: 1,
          cash: 1,
          transfer: 1,
          total: 1,
          total: 1,
          cancelled: 1,
          description: 1,
          _id: 0,
        },
      },
      {
        $sort: { id: 1 },
      },
    ]);

    const orders = await Sale.aggregate([
      {
        $match: {
          checkoutDate: {
            $gte: new Date(date),
            $lt: addOneDayDate,
          },
          typeSale: "pedido",
          cash: { $gt: 0 },
          $or: [
            {
              $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
            },
            {
              $or: [
                { isWithPrepaid: false },
                { isWithPrepaid: { $exists: false } },
              ],
            },
          ],
          cancelled: { $ne: true },
          ...(store !== "ALL" && { store: store }),
        },
      },
      {
        $project: {
          id: "$_id",
          order: 1,
          typeSale: 1,
          employee: 1,
          username: 1,
          items: 1,
          cash: 1,
          transfer: 1,
          total: 1,
          total: 1,
          cancelled: 1,
          description: 1,
          _id: 0,
        },
      },
    ]);

    const ordersWithPrepaid = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(date),
            $lt: addOneDayDate,
          },
          typeSale: "pedido",
          isWithPrepaid: true,
          cash: { $gt: 0 },
          $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
          cancelled: { $ne: true },
          ...(store !== "ALL" && { store: store }),
        },
      },
      {
        $project: {
          id: "$_id",
          order: 1,
          typeSale: 1,
          employee: 1,
          username: 1,
          items: 1,
          cash: 1,
          transfer: 1,
          total: 1,
          total: 1,
          cancelled: 1,
          description: 1,
          isWithPrepaid: 1,
          _id: 0,
        },
      },
    ]);

    const getSalesByEmployees = {};

    sales
      .map((sale) => ({
        ...sale,
        cash:
          !Boolean(sale.cash) && !Boolean(sale.transfer)
            ? sale.total
            : sale.cash,
        isSale: true,
        withFlag: Number(sale.transfer || 0) > 0,
      }))
      .forEach((sale) => {
        getSalesByEmployees[sale.employee]
          ? getSalesByEmployees[sale.employee].push(sale)
          : (getSalesByEmployees[sale.employee] = [sale]);
      });

    cashflows
      .map((cashflow) => ({
        ...cashflow,
        cash: cashflow.amount,
        withBackground: true,
      }))
      .forEach((cashflow) => {
        getSalesByEmployees[cashflow.employee]
          ? getSalesByEmployees[cashflow.employee].push(cashflow)
          : (getSalesByEmployees[cashflow.employee] = [cashflow]);
      });

    ordersWithPrepaid
      .map((order) => ({
        ...order,
      }))
      .forEach((order) => {
        getSalesByEmployees[order.employee]
          ? getSalesByEmployees[order.employee].push(order)
          : (getSalesByEmployees[order.employee] = [order]);
      });

    orders
      .map((order) => ({
        ...order,
      }))
      .forEach((order) => {
        getSalesByEmployees[order.employee]
          ? getSalesByEmployees[order.employee].push(order)
          : (getSalesByEmployees[order.employee] = [order]);
      });

    const reOrderSalesByEmployees = {};
    const employees = await getAllEmployees();
    const sortEmployeeByPosition = employees.sort(
      (a, b) =>
        (a.position || employees.length + 1) -
        (b.position || employees.length + 1)
    );
    sortEmployeeByPosition.forEach((employee) => {
      if (getSalesByEmployees[employee.name]) {
        reOrderSalesByEmployees[employee.name] =
          getSalesByEmployees[employee.name];
      }
    });

    res.send({ results: reOrderSalesByEmployees, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

Controllers.getSalesTransferByEmployees = async (req, res) => {
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

    query.typeSale = "local";

    query.$or = [{ cancelled: false }, { cancelled: { $exists: false } }];
    query.cancelled = { $ne: true };
    query.$and = [
      { transfer: { $exists: true, $ne: null, $gt: 0 } },
      { cancelled: { $exists: false } },
    ];

    const sales = await Sale.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          order: 1,
          typeSale: 1,
          employee: 1,
          username: 1,
          items: 1,
          cash: 1,
          transfer: 1,
          total: 1,
          total: 1,
          cancelled: 1,
          _id: 0,
        },
      },
      {
        $sort: { id: 1 },
      },
    ]);

    const cashflows = await Cashflow.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(date),
            $lt: addOneDayDate,
          },
          type: "ingreso",
          cancelled: { $ne: true },
          $or: [
            { typePayment: { $exists: false } },
            { typePayment: "transfer" },
          ],

          ...(store !== "ALL" && { store: store }),
        },
      },
      {
        $project: {
          id: "$_id",
          type: 1,
          amount: 1,
          employee: 1,
          store: 1,
          description: 1,
          items: 1,
          typePayment: 1,
          _id: 0,
        },
      },
      {
        $sort: { id: 1 },
      },
    ]);

    const cashflowWrapper = cashflows.map((cashflow) => ({
      ...cashflow,
      transfer: cashflow.amount,
      withBackground: true,
    }));

    const employees = await getAllEmployees();

    const joinedSales = [...sales, ...cashflowWrapper]
      .map((sale) => {
        const findDetailFromEmployee = employees.find(
          (emp) => sale.employee === emp.name
        );

        return { ...sale, position: findDetailFromEmployee.position };
      })
      .sort(
        (a, b) =>
          (a.position || employees.length + 1) -
          (b.position || employees.length + 1)
      );

    res.send({ results: joinedSales });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

Controllers.getReports = async (req, res) => {
  try {
    const { month, year, store, typeSale } = req.query;

    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfNextMonth = new Date(year, month + 1, 1);

    const employees = await getAllEmployees();

    if (typeSale === "local") {
      const query = {
        createdAt: {
          $gte: firstDayOfMonth,
          $lt: firstDayOfNextMonth,
        },
      };

      query.store = store;
      query.typeSale = typeSale;

      query.$or = [{ cancelled: false }, { cancelled: { $exists: false } }];
      query.cancelled = { $ne: true };
      query.$and = [{ checkoutDate: { $exists: false } }];

      const salesByDays = await Sale.aggregate([
        {
          $match: {
            ...query,
            $or: [{ cash: { $gt: 0 } }, { transfer: { $gt: 0 } }],
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: "$cash",
            transfer: "$transfer",
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            week: { $isoWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            salesGeneral: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            salesGeneral: 1,
          },
        },
        {
          $sort: { week: 1 }, // Opcional: ordenar por semana ascendente
        },
      ]);

      const ordersByDays = await Sale.aggregate([
        {
          $match: {
            checkoutDate: {
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth,
            },
            typeSale: "pedido",
            store: store,
            cash: { $gt: 0 },
            $or: [
              {
                $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
              },
              {
                $or: [
                  { isWithPrepaid: false },
                  { isWithPrepaid: { $exists: false } },
                ],
              },
            ],
            cancelled: { $ne: true },
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: "$cash",
            transfer: "$transfer",
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$checkoutDate",
              },
            },
            week: { $isoWeek: "$checkoutDate" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            salesGeneral: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            salesGeneral: 1,
          },
        },
        {
          $sort: { week: 1 }, // Opcional: ordenar por semana ascendente
        },
      ]);

      const ordersWithPrepaid = await Sale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth,
            },
            typeSale: "pedido",
            isWithPrepaid: true,
            cash: { $gt: 0 },
            $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
            cancelled: { $ne: true },
            store: store,
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: "$cash",
            transfer: "$transfer",
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            week: { $isoWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            salesGeneral: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            salesGeneral: 1,
          },
        },
        {
          $sort: { week: 1 }, // Opcional: ordenar por semana ascendente
        },
      ]);

      const salesByEmployees = await Sale.aggregate([
        {
          $match: {
            ...query,
            $or: [{ cash: { $gt: 0 } }, { transfer: { $gt: 0 } }],
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: 1,
            transfer: 1,
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            week: { $isoWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date", employee: "$employee" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: { week: "$_id.week", employee: "$_id.employee" },
            days: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $sort: { "_id.employee": 1 }, // Ordenar por empleado ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            employees: {
              $push: {
                employee: "$_id.employee",
                days: "$days",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            employees: 1,
            _id: 0,
          },
        },
        {
          $sort: { week: 1 },
        },
      ]);

      const ordersByEmployees = await Sale.aggregate([
        {
          $match: {
            checkoutDate: {
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth,
            },
            typeSale: "pedido",
            cash: { $gt: 0 },
            store: store,
            $or: [
              {
                $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
              },
              {
                $or: [
                  { isWithPrepaid: false },
                  { isWithPrepaid: { $exists: false } },
                ],
              },
            ],
            cancelled: { $ne: true },
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: 1,
            transfer: 1,
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$checkoutDate",
              },
            },
            week: { $isoWeek: "$checkoutDate" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date", employee: "$employee" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: { week: "$_id.week", employee: "$_id.employee" },
            days: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $sort: { "_id.employee": 1 }, // Ordenar por empleado ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            employees: {
              $push: {
                employee: "$_id.employee",
                days: "$days",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            employees: 1,
            _id: 0,
          },
        },
        {
          $sort: { week: 1 },
        },
      ]);

      const ordersWithPrepaidByEmployees = await Sale.aggregate([
        {
          $match: {
            ...query,
            typeSale: "pedido",
            isWithPrepaid: true,
            cash: { $gt: 0 },
            $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
            cancelled: { $ne: true },
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: 1,
            transfer: 1,
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            week: { $isoWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date", employee: "$employee" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: { week: "$_id.week", employee: "$_id.employee" },
            days: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $sort: { "_id.employee": 1 }, // Ordenar por empleado ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            employees: {
              $push: {
                employee: "$_id.employee",
                days: "$days",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            employees: 1,
            _id: 0,
          },
        },
        {
          $sort: { week: 1 },
        },
      ]);

      const queryCashflow = {
        createdAt: {
          $gte: firstDayOfMonth,
          $lt: firstDayOfNextMonth,
        },
      };

      queryCashflow.store = store;

      const cashflowsResumeOutgoings = await Cashflow.aggregate([
        {
          $match: {
            ...queryCashflow,
            type: "egreso",
            cancelled: { $ne: true },
          },
        },
        {
          $project: {
            id: "$_id",
            type: 1,
            amount: 1,
            store: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            week: { $isoWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date" },
            amount: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: "$_id.week",
            days: {
              $push: {
                date: "$_id.date",
                amount: "$amount",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            days: 1,
          },
        },
        {
          $sort: { week: 1 }, // Opcional: ordenar por semana ascendente
        },
      ]);

      const cashflowsResumeIncomes = await Cashflow.aggregate([
        {
          $match: {
            ...queryCashflow,
            type: "ingreso",
            cancelled: { $ne: true },
            $or: [{ typePayment: { $exists: false } }, { typePayment: "cash" }],
          },
        },
        {
          $project: {
            id: "$_id",
            type: 1,
            amount: 1,
            items: 1,
            store: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            week: { $isoWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date" },
            amount: { $sum: "$amount" },
            items: { $sum: "$items" },
          },
        },
        {
          $group: {
            _id: "$_id.week",
            days: {
              $push: {
                date: "$_id.date",
                amount: "$amount",
                items: "$items",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            days: 1,
          },
        },
        {
          $sort: { week: 1 }, // Opcional: ordenar por semana ascendente
        },
      ]);

      const cashflowsResumeIncomesByEmployee = await Cashflow.aggregate([
        {
          $match: {
            ...queryCashflow,
            type: "ingreso",
            cancelled: { $ne: true },
            $or: [{ typePayment: { $exists: false } }, { typePayment: "cash" }],
          },
        },
        {
          $project: {
            id: "$_id",
            employee: 1,
            type: 1,
            amount: 1,
            items: 1,
            store: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            week: { $isoWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date", employee: "$employee" },
            amount: { $sum: "$amount" },
            items: { $sum: "$items" },
          },
        },
        {
          $group: {
            _id: { week: "$_id.week", employee: "$_id.employee" },
            days: {
              $push: {
                date: "$_id.date",
                amount: "$amount",
                items: "$items",
              },
            },
            totalAmount: { $sum: "$amount" },
            totalItems: { $sum: "$items" },
          },
        },
        {
          $group: {
            _id: "$_id.week",
            employees: {
              $push: {
                employee: "$_id.employee",
                days: "$days",
                totalAmount: "$totalAmount",
                totalItems: "$totalItems",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            employees: 1,
            _id: 0,
          },
        },
        {
          $sort: { week: 1 }, // Opcional: ordenar por semana ascendente
        },
      ]);

      const weekWithDays = {};

      salesByDays.forEach((resumeWeek) => {
        weekWithDays[resumeWeek.week] = resumeWeek.salesGeneral.map(
          ({ date }) => date
        );
      });

      const salesGeneral = salesByDays.map((resumeWeek) => {
        const weekSalesByEmployees = salesByEmployees.find(
          ({ week }) => week === resumeWeek.week
        );

        resumeWeek.salesByEmployees = weekSalesByEmployees.employees
          .map((saleByEmployee) => {
            const findDetailFromEmployee = employees.find(
              (emp) => saleByEmployee.employee === emp.name
            );

            return {
              employee: saleByEmployee.employee,
              position: findDetailFromEmployee
                ? findDetailFromEmployee.position
                : employees.length,
              sales: weekWithDays[resumeWeek.week].map((day) => {
                const foundSale = saleByEmployee.days.find(
                  (s) => s.date === day
                );

                const weekIncomesByEmployee =
                  cashflowsResumeIncomesByEmployee.find(
                    (e) => e.week === resumeWeek.week
                  );

                if (!!weekIncomesByEmployee) {
                  const foundEmployeeIncome =
                    weekIncomesByEmployee.employees.find(
                      (e) => e.employee === saleByEmployee.employee
                    );

                  if (foundEmployeeIncome) {
                    const foundDayIncomeByEmployee =
                      foundEmployeeIncome.days.find((e) => e.date === day);

                    if (foundDayIncomeByEmployee && foundSale) {
                      foundSale.items =
                        foundSale.items + (foundDayIncomeByEmployee.items || 0);

                      foundSale.cash =
                        foundSale.cash + foundDayIncomeByEmployee.amount;
                    }
                  }
                }

                const weekOrdersByEmployee = ordersByEmployees.find(
                  (e) => e.week === resumeWeek.week
                );

                if (!!weekOrdersByEmployee) {
                  const foundEmployee = weekOrdersByEmployee.employees.find(
                    (e) => e.employee === saleByEmployee.employee
                  );

                  if (foundEmployee) {
                    const foundDayByEmployee = foundEmployee.days.find(
                      (e) => e.date === day
                    );

                    if (foundDayByEmployee && foundSale) {
                      foundSale.items =
                        foundSale.items + (foundDayByEmployee.items || 0);

                      foundSale.cash = foundSale.cash + foundDayByEmployee.cash;
                    }
                  }
                }

                const weekOrdersWithPrepaidByEmployee =
                  ordersWithPrepaidByEmployees.find(
                    (e) => e.week === resumeWeek.week
                  );

                if (!!weekOrdersWithPrepaidByEmployee) {
                  const foundEmployee =
                    weekOrdersWithPrepaidByEmployee.employees.find(
                      (e) => e.employee === saleByEmployee.employee
                    );

                  if (foundEmployee) {
                    const foundDayByEmployee = foundEmployee.days.find(
                      (e) => e.date === day
                    );

                    if (foundDayByEmployee && foundSale) {
                      foundSale.items =
                        foundSale.items + (foundDayByEmployee.items || 0);

                      foundSale.cash = foundSale.cash + foundDayByEmployee.cash;
                    }
                  }
                }

                return (
                  foundSale || {
                    date: day,
                    items: 0,
                    cash: 0,
                    transfer: 0,
                    total: 0,
                  }
                );
              }),
            };
          })
          .sort(
            (a, b) =>
              (a.position || employees.length + 1) -
              (b.position || employees.length + 1)
          );

        //Maneja Ingreso Total Diario
        const cashflowByWeekIncome = cashflowsResumeIncomes.find(
          (cashflow) => cashflow.week === resumeWeek.week
        );

        const ordersByWeek = ordersByDays.find(
          (order) => order.week === resumeWeek.week
        );

        const ordersWithPrepaidByWeek = ordersWithPrepaid.find(
          (order) => order.week === resumeWeek.week
        );

        //Maneja Egresos Total Diario
        const cashflowByWeekOutgoing = cashflowsResumeOutgoings.find(
          (cashflow) => cashflow.week === resumeWeek.week
        );

        resumeWeek.salesGeneral.map((sale) => {
          sale.totalBox = sale.cash;

          if (cashflowByWeekIncome) {
            const cashflowByDay = cashflowByWeekIncome.days.find(
              (cashflow) => cashflow.date === sale.date
            );

            if (cashflowByDay) {
              const saleCash = sale.cash;

              sale.items = sale.items + (cashflowByDay.items || 0);
              sale.cash = saleCash + cashflowByDay.amount;
              sale.totalBox = saleCash + cashflowByDay.amount;
            }
          }

          if (ordersByWeek) {
            const orderByDay = ordersByWeek.salesGeneral.find(
              (order) => order.date === sale.date
            );

            if (orderByDay) {
              const saleCash = sale.cash;

              sale.items = sale.items + (orderByDay.items || 0);
              sale.cash = saleCash + orderByDay.cash;
              sale.totalBox = saleCash + orderByDay.cash;
            }
          }

          if (ordersWithPrepaidByWeek) {
            const orderByDay = ordersWithPrepaidByWeek.salesGeneral.find(
              (order) => order.date === sale.date
            );

            if (orderByDay) {
              const saleCash = sale.cash;

              sale.items = sale.items + (orderByDay.items || 0);
              sale.cash = saleCash + orderByDay.cash;
              sale.totalBox = saleCash + orderByDay.cash;
            }
          }

          if (cashflowByWeekOutgoing) {
            const cashflowByDay = cashflowByWeekOutgoing.days.find(
              (cashflow) => cashflow.date === sale.date
            );
            if (cashflowByDay) {
              const saleCash = sale.cash;

              sale.outgoings = cashflowByDay.amount;
              sale.totalBox = saleCash - cashflowByDay.amount;
            }
          }

          return sale;
        });

        return resumeWeek;
      });

      res.send({
        results: {
          salesGeneral,
          typeSale,
          salesByEmployees,
        },
      });

      return;
    }

    if (typeSale === "pedido") {
      const salesByDays = await Sale.aggregate([
        {
          $match: {
            checkoutDate: {
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth,
            },
            typeSale: "pedido",
            store: store,
            $or: [
              {
                $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
              },
            ],
            cancelled: { $ne: true },
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: "$cash",
            transfer: "$transfer",
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$checkoutDate",
              },
            },
            week: { $isoWeek: "$checkoutDate" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            salesGeneral: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            salesGeneral: 1,
          },
        },
        {
          $sort: { week: 1 }, // Opcional: ordenar por semana ascendente
        },
      ]);

      const salesByEmployees = await Sale.aggregate([
        {
          $match: {
            checkoutDate: {
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth,
            },
            typeSale: "pedido",
            store: store,
            $or: [
              {
                $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
              },
            ],
            cancelled: { $ne: true },
          },
        },
        {
          $project: {
            id: "$_id",
            order: 1,
            employee: 1,
            cash: 1,
            transfer: 1,
            items: 1,
            total: 1,
            _id: 0,
            date: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$checkoutDate",
              },
            },
            week: { $isoWeek: "$checkoutDate" },
          },
        },
        {
          $group: {
            _id: { week: "$week", date: "$date", employee: "$employee" },
            items: { $sum: "$items" },
            cash: { $sum: "$cash" },
            transfer: { $sum: "$transfer" },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { "_id.week": 1, "_id.date": 1 }, // Ordenar por semana ascendente y fecha ascendente
        },
        {
          $group: {
            _id: { week: "$_id.week", employee: "$_id.employee" },
            days: {
              $push: {
                date: "$_id.date",
                items: "$items",
                cash: "$cash",
                transfer: "$transfer",
                total: "$total",
              },
            },
          },
        },
        {
          $sort: { "_id.employee": 1 }, // Ordenar por empleado ascendente
        },
        {
          $group: {
            _id: "$_id.week",
            employees: {
              $push: {
                employee: "$_id.employee",
                days: "$days",
              },
            },
          },
        },
        {
          $project: {
            week: "$_id",
            employees: 1,
            _id: 0,
          },
        },
        {
          $sort: { week: 1 },
        },
      ]);

      const weekWithDays = {};

      salesByDays.forEach((resumeWeek) => {
        weekWithDays[resumeWeek.week] = resumeWeek.salesGeneral.map(
          ({ date }) => date
        );
      });

      const salesGeneral = salesByDays.map((resumeWeek) => {
        const weekSalesByEmployees = salesByEmployees.find(
          ({ week }) => week === resumeWeek.week
        );

        resumeWeek.salesByEmployees = weekSalesByEmployees.employees
          .map((saleByEmployee) => {
            const findDetailFromEmployee = employees.find(
              (emp) => saleByEmployee.employee === emp.name
            );

            return {
              employee: saleByEmployee.employee,
              position: findDetailFromEmployee
                ? findDetailFromEmployee.position
                : 0,
              sales: weekWithDays[resumeWeek.week].map((day) => {
                const foundSale = saleByEmployee.days.find(
                  (s) => s.date === day
                );

                return (
                  foundSale || {
                    date: day,
                    items: 0,
                    cash: 0,
                    transfer: 0,
                    total: 0,
                  }
                );
              }),
            };
          })
          .sort(
            (a, b) =>
              (a.position || employees.length + 1) -
              (b.position || employees.length + 1)
          );

        resumeWeek.salesGeneral.map((sale) => {
          sale.totalBox = sale.total;

          return sale;
        });

        return resumeWeek;
      });

      res.send({
        results: {
          salesGeneral,
          typeSale,
        },
      });

      return;
    }

    res.send({
      results: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const {
      store,
      employee,
      typeSale,
      items,
      subTotalItems,
      devolutionItems,
      subTotalDevolutionItems,
      username,
      numOrder,
      typeShipment,
      totalCash,
      totalTransfer,
      totalFinal,
      isWithPrepaid,
    } = req.body;

    let lastNumOrder = numOrder;

    const lastSaleByEmployee = await Sale.findOne({
      employee: employee,
      typeSale: "local",
      $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
      cancelled: { $ne: true },
    })
      .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
      .limit(1);

    if (lastSaleByEmployee && numOrder === lastSaleByEmployee.order) {
      const findEmployee = await Employee.findOne({
        name: seller,
      });

      lastNumOrder = findEmployee.enableNewNumOrder
        ? findEmployee.newNumOrder
        : !lastSaleByEmployee || lastSaleByEmployee.order >= 100
        ? 1
        : lastSaleByEmployee.order + 1;
    }

    await Sale.create({
      store,
      order: lastNumOrder,
      employee,
      typeSale,
      typeShipment,
      items,
      transfer: totalTransfer,
      cash: totalCash,
      subTotalItems,
      devolutionItems,
      subTotalDevolutionItems,
      username,
      total: totalFinal,
      isWithPrepaid,
    });

    res.send({ results: "¡Éxito! Se agrego al listado de ventas.!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

Controllers.createSaleByEmployee = async (req, res) => {
  try {
    const { items, cash, total, employee, store, username } = req.body;

    const lastSaleByEmployee = await Sale.findOne({
      employee,
      typeSale: "local",
      $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
      cancelled: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(1);

    const findEmployee = await Employee.findOne({
      name: employee,
    });

    const numOrderLocal = findEmployee.enableNewNumOrder
      ? findEmployee.newNumOrder
      : !lastSaleByEmployee || lastSaleByEmployee.order >= 100
      ? 1
      : lastSaleByEmployee.order + 1;

    if (findEmployee.enableNewNumOrder) {
      findEmployee.enableNewNumOrder = false;
      await findEmployee.save();
    }

    const newSaleByEmployee = await Sale.create({
      items,
      cash,
      total,
      typeSale: "local",
      order: numOrderLocal,
      employee,
      store,
      username,
    });

    const transformedResults = {
      ...newSaleByEmployee._doc,
      id: newSaleByEmployee._id,
    };

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

Controllers.updateOrder = async (req, res) => {
  try {
    const { id, dataIndex, value } = req.body;

    const saleToUpdate = await Sale.findOne({
      _id: id,
    });

    saleToUpdate[dataIndex] = value;

    if (dataIndex === "cash") {
      saleToUpdate.total = saleToUpdate.transfer + value;
    }

    if (dataIndex === "transfer") {
      saleToUpdate.total = saleToUpdate.cash + value;
    }

    if (["transfer", "cash"].includes(dataIndex)) {
      const costs = await Cost.find(
        {
          numOrder: saleToUpdate.order,
          employee: saleToUpdate.employee,
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

      const isApproved = totalAmount >= saleToUpdate.transfer && allApproved;

      saleToUpdate.approved = isApproved;

      if (saleToUpdate.transfer) {
        saleToUpdate.statusRelatedToCost =
          Boolean(totalAmount) && saleToUpdate.transfer > totalAmount
            ? "partialPayment"
            : isApproved && !Boolean(saleToUpdate.cash)
            ? "approved"
            : isApproved && Boolean(saleToUpdate.cash)
            ? "approvedHasCash"
            : "withoutPayment";
      }

      if (!saleToUpdate.transfer) {
        saleToUpdate.statusRelatedToCost = null;
      }
    }

    await saleToUpdate.save();

    /** UPDATE COST */
    if (["checkoutDate", "items", "typeShipment"].includes(dataIndex)) {
      await Cost.updateMany(
        {
          numOrder: saleToUpdate.order,
          employee: saleToUpdate.employee,
        },
        {
          $set: {
            checkoutDate: saleToUpdate.checkoutDate,
            items: saleToUpdate.items,
            typeShipment: saleToUpdate.typeShipment,
          },
        }
      );
    }

    const transformedResults = {
      ...saleToUpdate._doc,
      id: saleToUpdate._id,
    };

    if (saleToUpdate.checkoutDate) {
      transformedResults.checkoutDate = formatCheckoutDate(
        saleToUpdate.checkoutDate
      );
    }

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

Controllers.updateSaleByEmployee = async (req, res) => {
  try {
    const { id, dataIndex, value } = req.body;

    const saleToUpdate = await Sale.findOne({
      _id: id,
    });

    saleToUpdate[dataIndex] = value;

    if (dataIndex === "cash") {
      saleToUpdate.total = saleToUpdate.transfer + value;
    }

    if (dataIndex === "transfer") {
      saleToUpdate.total = saleToUpdate.cash + value;
    }

    await saleToUpdate.save();

    const transformedResults = {
      ...saleToUpdate._doc,
      id: saleToUpdate._id,
    };

    res.send({
      results: transformedResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al modificar orden" });
  }
};

Controllers.cancelOrders = async (req, res) => {
  try {
    const { itemsIdSelected } = req.body;
    const idsToUpdate = itemsIdSelected.map(({ id }) => id);

    await Sale.updateMany(
      { _id: { $in: idsToUpdate } },
      { $set: { cancelled: true } }
    );

    const ordersCancelled = await Sale.aggregate([
      { $match: { _id: { $in: idsToUpdate } } },
      {
        $project: {
          id: "$_id",
          store: 1,
          order: 1,
          employee: 1,
          typeShipment: 1,
          transfer: 1,
          cash: 1,
          items: 1,
          username: 1,
          total: 1,
          cancelled: 1,
          checkoutDate: {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$checkoutDate",
            },
          },
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

    res.send({ results: ordersCancelled });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

Controllers.removeSales = async (req, res) => {
  try {
    const { salesIds, cashflowIds } = req.body;

    let salesCancelled, cashflowCancelled;

    if (salesIds.length) {
      const salesIdsToUpdate = salesIds.map(({ id }) => id);

      await Sale.updateMany(
        { _id: { $in: salesIdsToUpdate } },
        { $set: { cancelled: true } }
      );

      salesCancelled = await Sale.aggregate([
        { $match: { _id: { $in: salesIdsToUpdate } } },
        {
          $project: {
            id: "$_id",
            order: 1,
            typeSale: 1,
            employee: 1,
            username: 1,
            items: 1,
            cash: 1,
            transfer: 1,
            total: 1,
            total: 1,
            cancelled: 1,
            description: 1,
            _id: 0,
          },
        },
      ]);
    }

    if (cashflowIds.length) {
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
    }

    res.send({
      results: {
        salesCancelled,
        cashflowCancelled,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

Controllers.getLastNumOrder = async (req, res) => {
  try {
    const { seller } = req.body;

    const lastSaleByEmployee = await Sale.findOne({
      employee: seller,
      typeSale: "local",
      $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
      cancelled: { $ne: true },
    })
      .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
      .limit(1);

    const findEmployee = await Employee.findOne({
      name: seller,
    });

    const lastNumOrder = findEmployee.enableNewNumOrder
      ? findEmployee.newNumOrder
      : !lastSaleByEmployee || lastSaleByEmployee.order >= 100
      ? 1
      : lastSaleByEmployee.order + 1;

    res.send({ results: lastNumOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

const mappingPriceWithConcept = {
  bolsas: "Bolsas",
  envio: "Envio",
  recargoPorMenor: "Recargo",
  pagoEfectivo: "Pago efectivo",
  pagoTransferencia: "Pago transferencia",
  descuento: "Descuento",
};

const templateRecieve = async ({
  pricesSelected,
  devolutionPricesSelected,
  percentageToDisccountOrAdd,
  username,
  seller,
  typeSale,
  numOrder,
  pricesWithconcepts,
  pricesDevolutionWithconcepts,
  totalPrices,
  totalDevolutionPrices,
  percentageCash,
  percentageTransfer,
  cashWithDisccount,
  transferWithRecharge,
  totalCash,
  totalTransfer,
  totalToPay,
  total,
}) => {
  const alignRight = (text, width) => {
    const spaces = width - text.length;
    return " ".repeat(spaces) + text;
  };

  const pricesToString = (prices) => {
    return prices
      .map(
        (item) =>
          `${alignRight(item.quantity.toString(), 10)} x ${alignRight(
            formatCurrency(item.price),
            10
          )} | ${alignRight(formatCurrency(item.quantity * item.price), 10)}`
      )
      .join("\n");
  };

  const pricesWithToString = (prices) => {
    return prices
      .map(
        (item) =>
          `  ${mappingPriceWithConcept[item.concept]}: ${alignRight(
            item.quantity.toString(),
            20 - mappingPriceWithConcept[item.concept].length
          )} x ${formatCurrency(item.price)} | ${formatCurrency(
            item.quantity * item.price
          )}`
      )
      .join("\n");
  };

  const titleTotal =
    percentageToDisccountOrAdd < 0 ? "Descuento: " : "Gastos bancarios: ";

  const now = new Date();

  // Formatea la fecha y hora según tus preferencias
  const formattedDateTime = `${now.getDate()}/${
    now.getMonth() + 1
  }/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;

  const multiplyBy = percentageToDisccountOrAdd < 0 ? 1 : -1;

  const calculateTotalDiscount =
    multiplyBy *
    (totalToPay -
      totalToPay *
        calculateTotalPercentage(Math.abs(percentageToDisccountOrAdd)));

  /*const lastSaleByEmployee = await Sale.findOne({
    seller,
    typeSale: "local",
    $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
  })
    .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
    .limit(1);

  const numOrderLocal =
    !lastSaleByEmployee || lastSaleByEmployee.order >= 100
      ? 1
      : lastSaleByEmployee.order + 1;

  const numOrderLocalOrPedido = typeSale === "local" ? numOrderLocal : numOrder;*/
  const numOrderLocalOrPedido = numOrder;

  let tpl = `Cenitho Jeans - ${formattedDateTime}\n\n
Bogota 3419  (011) 2080-1916
Helguera 569 (011) 2091-3841
www.cenitho.com\n`;

  if (seller.length) {
    tpl =
      tpl +
      `
  Vendedor: ${seller}`;
  }

  tpl =
    tpl +
    `
  Cajero: ${username} | ${typeSale} | N° ${numOrderLocalOrPedido}
  
  Items:\n${pricesToString(pricesSelected)}
  Total de prendas: ${pricesSelected.reduce(
    (acc, current) => acc + current.quantity,
    0
  )}`;

  if (pricesWithconcepts.length) {
    tpl =
      tpl +
      `
    \n${pricesWithToString(pricesWithconcepts)}`;
  }

  tpl =
    tpl +
    `
Total: ${alignRight(formatCurrency(totalPrices), 28)}`;

  if (devolutionPricesSelected.length) {
    tpl =
      tpl +
      `

  Devoluciones:\n${pricesToString(devolutionPricesSelected)}
  Total de prendas: ${devolutionPricesSelected.reduce(
    (acc, current) => acc + current.quantity,
    0
  )}
Total: ${alignRight(
        formatCurrency(
          devolutionPricesSelected.reduce(
            (acc, current) => current.price * current.quantity + acc,
            0
          )
        ),
        29
      )}`;
  }

  if (pricesDevolutionWithconcepts.length) {
    tpl =
      tpl +
      `
    \n${pricesWithToString(pricesDevolutionWithconcepts)}`;
  }

  if (totalDevolutionPrices !== 0) {
    tpl =
      tpl +
      `
Total a descontar: ${alignRight(formatCurrency(totalDevolutionPrices), 17)}`;
  }

  tpl =
    tpl +
    `

Saldo a pagar: ${alignRight(formatCurrency(totalToPay), 22)}
`;

  if (totalCash !== 0) {
    tpl =
      tpl +
      `
Importe Efectivo: ${alignRight(formatCurrency(totalCash), 19)}`;
  }
  if (totalTransfer !== 0) {
    tpl =
      tpl +
      `
Importe Transferencia: ${alignRight(formatCurrency(totalTransfer), 14)}`;
  }

  if (cashWithDisccount && cashWithDisccount !== 0) {
    tpl =
      tpl +
      `

Descuento: ${alignRight(formatCurrency(cashWithDisccount), 22)}`;
  }

  if (transferWithRecharge && transferWithRecharge !== 0) {
    tpl =
      tpl +
      `
Gastos Bancarios: ${alignRight(formatCurrency(transferWithRecharge), 15)}
`;
  }

  tpl =
    tpl +
    `
Total Final: ${alignRight(formatCurrency(total), 24)}
  `;

  tpl =
    tpl +
    `
    \nLos cambios pueden realizarse dentro 
de los 20 dias presentando este ticket
\nMuchas Gracias por su Compra!
\nTicket no valido como factura`;

  return tpl;
};

Controllers.print = async (req, res) => {
  try {
    const {
      pricesSelected,
      devolutionPricesSelected,
      percentageToDisccountOrAdd,
      username,
      seller,
      typeSale,
      numOrder,
      pricesWithconcepts,
      pricesDevolutionWithconcepts,
      totalPrices,
      totalDevolutionPrices,
      percentageCash,
      percentageTransfer,
      cashWithDisccount,
      transferWithRecharge,
      totalCash,
      totalTransfer,
      totalToPay,
      total,
    } = req.body;

    const tpl = await templateRecieve({
      pricesSelected,
      devolutionPricesSelected,
      percentageToDisccountOrAdd,
      username,
      seller,
      typeSale,
      numOrder,
      pricesWithconcepts,
      pricesDevolutionWithconcepts,
      totalPrices,
      totalDevolutionPrices,
      percentageCash,
      percentageTransfer,
      cashWithDisccount,
      transferWithRecharge,
      totalCash,
      totalTransfer,
      totalToPay,
      total,
    });

    const formattedData = `${tpl}\n\n\n\n`;

    const rawCommands = "\x1B\x69";
    //const rawCommands = "\x1B";
    const rawDataToSend = formattedData + rawCommands;

    /*printer.printDirect({
      data: rawDataToSend,
      printer: "SAM4S GIANT-100", // Reemplaza con el nombre de tu impresora
      type: "RAW",
      success: function (jobID) {
        console.log("sent to printer with ID: " + jobID);
      },
      error: function (err) {
        console.log(err);
      },
    });*/

    console.log(tpl);

    res.send({ results: "Se imprimio!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Hubo un error en la impresion" });
  }
};

module.exports = {
  Controllers,
};
