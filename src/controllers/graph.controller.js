// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Sale = new BaseModel("Sale");

const listColours = [
  { borderColor: "#ff6384", backgroundColor: "#ff6384" },
  { borderColor: "#35a2eb", backgroundColor: "#35a2eb" },
  { borderColor: "#ADD8E6", backgroundColor: "#ADD8E6" },
  { borderColor: "#D8BFD8", backgroundColor: "#D8BFD8" },
  { borderColor: "#FFB6C1", backgroundColor: "#FFB6C1" },
  { borderColor: "#87CEFA", backgroundColor: "#87CEFA" },
  { borderColor: "#98FB98", backgroundColor: "#98FB98" },
  { borderColor: "#B0C4DE", backgroundColor: "#B0C4DE" },
  { borderColor: "#F0D58C", backgroundColor: "#F0D58C" },
  { borderColor: "#87CEEB", backgroundColor: "#87CEEB" },
  { borderColor: "#00FFFF", backgroundColor: "#00FFFF" },
  { borderColor: "#DDA0DD", backgroundColor: "#DDA0DD" },
  { borderColor: "#FFFF00", backgroundColor: "#FFFF00" },
  { borderColor: "#40E0D0", backgroundColor: "#40E0D0" },
  { borderColor: "#DEB887", backgroundColor: "#DEB887" },
  { borderColor: "#ADFF2F", backgroundColor: "#ADFF2F" },
  { borderColor: "#D2B48C", backgroundColor: "#D2B48C" },
  { borderColor: "#48D1CC", backgroundColor: "#48D1CC" },
  { borderColor: "#FFA07A", backgroundColor: "#FFA07A" },
  { borderColor: "#66CDAA", backgroundColor: "#66CDAA" },
  { borderColor: "#8FBC8F", backgroundColor: "#8FBC8F" },
  { borderColor: "#00BFFF", backgroundColor: "#00BFFF" },
  { borderColor: "#F4A460", backgroundColor: "#F4A460" },
  { borderColor: "#FFD700", backgroundColor: "#FFD700" },
  { borderColor: "#00FA9A", backgroundColor: "#00FA9A" },
  { borderColor: "#BDB76B", backgroundColor: "#BDB76B" },
  { borderColor: "#6495ED", backgroundColor: "#6495ED" },
  { borderColor: "#FF69B4", backgroundColor: "#FF69B4" },
  { borderColor: "#E9967A", backgroundColor: "#E9967A" },
  { borderColor: "#00CED1", backgroundColor: "#00CED1" },
  { borderColor: "#00FF7F", backgroundColor: "#00FF7F" },
  { borderColor: "#BC8F8F", backgroundColor: "#BC8F8F" },
  { borderColor: "#FA8072", backgroundColor: "#FA8072" },
  { borderColor: "#9370DB", backgroundColor: "#9370DB" },
  { borderColor: "#FF00FF", backgroundColor: "#FF00FF" },
  { borderColor: "#FF6347", backgroundColor: "#FF6347" },
];

const generateArrayDays = (startDate, endDate) => {
  const arrDays = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24) + 1;

  for (let i = 0; i <= differenceInDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + i);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateString = { date: `${year}-${month}-${day}` };

    arrDays.push(dateString);
  }

  return arrDays;
};

const getUniqueEmployees = (arr) => {
  const uniqueEmployees = new Set();

  arr.forEach((objeto) => {
    uniqueEmployees.add(objeto.employee);
  });

  return Array.from(uniqueEmployees);
};

const groupSalesByDay = (arrDays, sales) =>
  arrDays.map((day) => {
    const salesByDay = sales.filter((sale) => sale.date == day.date);

    return { ...day, sales: salesByDay };
  });

// @Services
Controllers.getData = async (req, res) => {
  try {
    const { startDate, endDate, store } = req.query;

    const arrDays = generateArrayDays(startDate, endDate);

    const addOneDayDate = new Date(
      new Date(endDate).setDate(new Date(endDate).getDate() + 1)
    );

    const sales = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
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
          store: 1,
          order: 1,
          employee: 1,
          typeSale: 1,
          typePayment: 1,
          typeShipment: 1,
          items: 1,
          devolutionItems: 1,
          subTotalItems: 1,
          subTotalDevolutionItems: 1,
          percentageToDisccountOrAdd: 1,
          username: 1,
          cancelled: 1,
          cash: 1,
          transfer: 1,
          total: 1,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          _id: 0,
        },
      },
    ]);

    const joinedSales = [...sales];

    const groupedSalesByDay = groupSalesByDay(arrDays, joinedSales);
    const listEmployees = getUniqueEmployees(joinedSales);

    const data = groupedSalesByDay.map((sale) => {
      const dataBySales = sale.sales.reduce(
        (acc, current) => ({
          items: acc.items + Number(current.items || 0),
          devolutionItems:
            acc.devolutionItems + Number(current.devolutionItems || 0),
          cash: acc.cash + Number(current.cash || 0),
          transfer: acc.transfer + Number(current.transfer || 0),
          total: acc.total + Number(current.total || 0),
        }),
        { items: 0, devolutionItems: 0, cash: 0, transfer: 0, total: 0 }
      );

      const dataObj = {
        date: sale.date,
        items: dataBySales.items,
        devolutionItems: dataBySales.devolutionItems,
        cash: dataBySales.cash,
        transfer: dataBySales.transfer,
        total: dataBySales.total,
        propsByEmployee: listEmployees.map((employee) => {
          const { items, cash, transfer, total } = sale.sales
            .filter((sale) => sale.employee === employee)
            .reduce(
              (acc, current) => ({
                items: acc.items + Number(current.items || 0),
                cash: acc.cash + Number(current.cash || 0),
                transfer: acc.transfer + Number(current.transfer || 0),
                total: acc.total + Number(current.total || 0),
              }),
              {
                items: 0,
                cash: 0,
                transfer: 0,
                total: 0,
              }
            );

          return {
            employee,
            items,
            cash,
            transfer,
            total,
          };
        }),
      };

      return dataObj;
    });

    const valuesDays = arrDays.map(({ date }) => date);

    const itemsAndDevolutions = {
      labels: valuesDays,
      datasets: [
        {
          label: "Prendas",
          data: data.map(({ items }) => items),
          borderColor: listColours[0].borderColor,
          backgroundColor: listColours[0].backgroundColor,
        },
        {
          label: "Devoluciones",
          data: data.map(({ devolutionItems }) => devolutionItems),
          borderColor: listColours[1].borderColor,
          backgroundColor: listColours[1].backgroundColor,
        },
      ],
    };

    const itemsByEmployee = {
      labels: valuesDays,
      datasets: listEmployees.map((employee, idx) => ({
        label: employee,
        data: data.map(
          ({ propsByEmployee }) =>
            propsByEmployee.find((emp) => employee === emp.employee).items
        ),
        borderColor: listColours[idx].borderColor,
        backgroundColor: listColours[idx].backgroundColor,
      })),
    };

    const cashAndTransfer = {
      labels: valuesDays,
      datasets: [
        {
          label: "Efectivo",
          data: data.map(({ cash }) => cash),
          borderColor: listColours[0].borderColor,
          backgroundColor: listColours[0].backgroundColor,
        },
        {
          label: "Tranferencia",
          data: data.map(({ transfer }) => transfer),
          borderColor: listColours[1].borderColor,
          backgroundColor: listColours[1].backgroundColor,
        },
      ],
    };

    const cashByEmployee = {
      labels: valuesDays,
      datasets: listEmployees.map((employee, idx) => ({
        label: employee,
        data: data.map(
          ({ propsByEmployee }) =>
            propsByEmployee.find((emp) => employee === emp.employee).cash
        ),
        borderColor: listColours[idx].borderColor,
        backgroundColor: listColours[idx].backgroundColor,
      })),
    };

    const totalSales = {
      labels: valuesDays,
      datasets: [
        {
          label: "Total",
          data: data.map(({ total }) => total),
          borderColor: listColours[0].borderColor,
          backgroundColor: listColours[0].backgroundColor,
        },
      ],
    };

    const totalSalesByEmployees = {
      labels: valuesDays,
      datasets: listEmployees.map((employee, idx) => ({
        label: employee,
        data: data.map(
          ({ propsByEmployee }) =>
            propsByEmployee.find((emp) => employee === emp.employee).total
        ),
        borderColor: listColours[idx].borderColor,
        backgroundColor: listColours[idx].backgroundColor,
      })),
    };

    res.send({
      results: {
        itemsAndDevolutions,
        itemsByEmployee,
        cashAndTransfer,
        cashByEmployee,
        totalSales,
        totalSalesByEmployees,
        data,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

module.exports = {
  Controllers,
};
