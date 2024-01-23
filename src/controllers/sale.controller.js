// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const {
  formatCurrency,
  calculateTotalPercentage,
  formatCheckoutDate,
} = require("../utils/formatUtils");
const Sale = new BaseModel("Sale");

const printer = require("@woovi/node-printer");

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
    const { startDate, endDate, typeSale, store, employee, typeShipment } =
      req.query;

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

    if (typeShipment) {
      query.typeShipment = typeShipment;
    }

    query.typeSale = typeSale;

    const sales = await Sale.aggregate([
      { $match: query },
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

    res.send({ results: sales });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al buscar sales" });
  }
};

Controllers.getSalesByEmployees = async (req, res) => {
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

    const sales = await Sale.aggregate([
      { $match: query },
      {
        $project: {
          id: "$_id",
          order: 1,
          employee: 1,
          username: 1,
          items: 1,
          total: 1,
          cancelled: 1,
          _id: 0,
        },
      },
    ]);

    const getSalesByEmployees = {};

    sales.forEach((sale) => {
      getSalesByEmployees[sale.employee]
        ? getSalesByEmployees[sale.employee].push(sale)
        : (getSalesByEmployees[sale.employee] = [sale]);
    });

    res.send({ results: getSalesByEmployees });
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
      typePayment,
      items,
      subTotalItems,
      devolutionItems,
      subTotalDevolutionItems,
      percentageToDisccountOrAdd,
      username,
      numOrder,
      typeShipment,
      total,
    } = req.body;

    const lastSaleByEmployee = await Sale.findOne({
      employee,
      typeSale: "local",
      $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
    })
      .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
      .limit(1);

    const numOrderLocal =
      !lastSaleByEmployee || lastSaleByEmployee.order >= 100
        ? 1
        : lastSaleByEmployee.order + 1;

    const numOrderLocalOrPedido =
      typeSale === "local" ? numOrderLocal : numOrder;

    const totalCalculated =
      Number(total) * calculateTotalPercentage(percentageToDisccountOrAdd);

    await Sale.create({
      store,
      order: numOrderLocalOrPedido,
      employee,
      typeSale,
      typePayment,
      typeShipment,
      items,
      transfer:
        typeSale === "pedido" && typePayment === "transferencia"
          ? totalCalculated
          : "",
      cash:
        typeSale === "pedido" && typePayment === "efectivo"
          ? totalCalculated
          : "",
      subTotalItems,
      devolutionItems,
      subTotalDevolutionItems,
      percentageToDisccountOrAdd,
      username,
      total: totalCalculated,
    });

    res.send({ results: "¡Éxito! Se agrego al listado de ventas.!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

Controllers.createSaleByEmployee = async (req, res) => {
  try {
    const { items, total, employee, store, username } = req.body;

    const lastSaleByEmployee = await Sale.findOne({
      employee,
      typeSale: "local",
      $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
    })
      .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
      .limit(1);

    const numOrderLocal =
      !lastSaleByEmployee || lastSaleByEmployee.order >= 100
        ? 1
        : lastSaleByEmployee.order + 1;

    const newSaleByEmployee = await Sale.create({
      items,
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
    const updatedPrice = await Sale.findByIdAndUpdate(
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

Controllers.updateSaleByEmployee = async (req, res) => {
  try {
    const { id, dataIndex, value } = req.body;
    const updatedPrice = await Sale.findByIdAndUpdate(
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

const mappingPriceWithConcept = {
  bolsas: "Bolsas",
  envio: "Envio",
  recargoPorMenor: "Recargo",
  pagoEfectivo: "Pago efectivo",
  pagoTransferencia: "Pago transferencia",
};

const templateRecieve = async ({
  pricesSelected,
  devolutionPricesSelected,
  percentageToDisccountOrAdd,
  username,
  seller,
  typeSale,
  numOrder,
  employee,
  pricesWithconcepts,
  pricesDevolutionWithconcepts,
  totalPrice,
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
    (totalPrice -
      totalPrice *
        calculateTotalPercentage(Math.abs(percentageToDisccountOrAdd)));

  const lastSaleByEmployee = await Sale.findOne({
    employee,
    typeSale: "local",
    $or: [{ cancelled: false }, { cancelled: { $exists: false } }],
  })
    .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
    .limit(1);

  const numOrderLocal =
    !lastSaleByEmployee || lastSaleByEmployee.order >= 100
      ? 1
      : lastSaleByEmployee.order + 1;

  const numOrderLocalOrPedido = typeSale === "local" ? numOrderLocal : numOrder;

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

  if (devolutionPricesSelected.length) {
    tpl =
      tpl +
      `

  Devoluciones:\n${pricesToString(devolutionPricesSelected)}`;
  }

  if (pricesWithconcepts.length) {
    tpl =
      tpl +
      `
    \n${pricesWithToString(pricesWithconcepts)}`;
  }

  if (pricesDevolutionWithconcepts.length) {
    tpl =
      tpl +
      `
    \n${pricesWithToString(pricesDevolutionWithconcepts)}`;
  }

  tpl =
    tpl +
    `

  Total: ${alignRight(formatCurrency(totalPrice), 28)}`;

  if (percentageToDisccountOrAdd !== 0) {
    tpl =
      tpl +
      `

  ${titleTotal}      ${percentageToDisccountOrAdd}% | ${formatCurrency(
        calculateTotalDiscount
      )}
      
  Total: ${alignRight(
    formatCurrency(
      totalPrice * calculateTotalPercentage(percentageToDisccountOrAdd)
    ),
    28
  )}
      `;
  }

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
      employee,
      typeSale,
      numOrder,
      pricesWithconcepts,
      pricesDevolutionWithconcepts,
      totalPrice,
    } = req.body;

    const tpl = await templateRecieve({
      pricesSelected,
      devolutionPricesSelected,
      percentageToDisccountOrAdd,
      username,
      seller,
      employee,
      typeSale,
      numOrder,
      pricesWithconcepts,
      pricesDevolutionWithconcepts,
      totalPrice,
    });

    const formattedData = `${tpl}\n\n\n\n`;

    const rawCommands = "\x1B\x69";
    const rawDataToSend = formattedData + rawCommands;

    printer.printDirect({
      data: rawDataToSend,
      printer: "SAM4S GIANT-100", // Reemplaza con el nombre de tu impresora
      type: "RAW",
      success: function (jobID) {
        console.log("sent to printer with ID: " + jobID);
      },
      error: function (err) {
        console.log(err);
      },
    });

    //console.log(tpl);

    res.send({ results: "Se imprimio!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Hubo un error en la impresion" });
  }
};

module.exports = {
  Controllers,
};
