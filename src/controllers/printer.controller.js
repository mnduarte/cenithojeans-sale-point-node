// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Printer = new BaseModel("Printer");

// @Services
const getAllPrinters = async (store = "ALL") => {
  const filter = store === "ALL" ? {} : { store };

  const printers = await Printer.aggregate([
    {
      $match: { ...filter, active: { $ne: false } },
    },
    {
      $project: {
        id: "$_id",
        name: 1,
        networkName: 1,
        store: 1,
        active: 1,
        isDefault: 1,
        _id: 0,
      },
    },
    {
      $sort: { isDefault: -1, name: 1 },
    },
  ]);

  return printers;
};

Controllers.getAll = async (req, res) => {
  try {
    const printers = await getAllPrinters("ALL");

    res.send({
      results: printers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener el listado de impresoras" });
  }
};

Controllers.getByStore = async (req, res) => {
  try {
    const { store } = req.body;
    const printers = await getAllPrinters(store);

    res.send({
      results: printers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener el listado de impresoras" });
  }
};

module.exports = {
  Controllers,
};
