// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const {
  formatCurrency,
  calculateTotalPercentage,
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

    const now = new Date();
    now.setHours(now.getHours() - 3);

    const lastSaleByEmployee = await Sale.findOne({
      employee,
    })
      .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
      .limit(1);

    const numOrderLocal =
      !lastSaleByEmployee || lastSaleByEmployee.order >= 100
        ? 1
        : lastSaleByEmployee.order + 1;

    const numOrderLocalOrPedido =
      typeSale === "local" ? numOrderLocal : numOrder;

    await Sale.create({
      store,
      order: numOrderLocalOrPedido,
      employee,
      typeSale,
      typePayment,
      typeShipment,
      items,
      subTotalItems,
      devolutionItems,
      subTotalDevolutionItems,
      percentageToDisccountOrAdd,
      username,
      total:
        Number(total) * calculateTotalPercentage(percentageToDisccountOrAdd),
      createdAt: now,
    });

    res.send({ results: "¡Éxito! Se agrego al listado de ventas.!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error when creating the Sale" });
  }
};

const mappingPriceWithConcept = {
  bolsas: "Bolsas",
  envio: "Envio",
  recargoPorMenor: "Recargo Por Menor",
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
            18 - mappingPriceWithConcept[item.concept].length
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
  })
    .sort({ createdAt: -1 }) // Ordenar por createdAt en orden descendente
    .limit(1);

  const numOrderLocal =
    !lastSaleByEmployee || lastSaleByEmployee.order >= 100
      ? 1
      : lastSaleByEmployee.order + 1;

  const numOrderLocalOrPedido = typeSale === "local" ? numOrderLocal : numOrder;

  let tpl = `Cenitho Jeans - ${formattedDateTime}\n
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
