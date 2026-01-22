// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Cashier = new BaseModel("Cashier");

// @Services
const getAllCashiers = async (store = "ALL") => {
  const filter = store === "ALL" ? {} : { store };

  const cashiers = await Cashier.aggregate([
    {
      $match: { ...filter, active: { $ne: false } },
    },
    {
      $project: {
        id: "$_id",
        name: 1,
        store: 1,
        color: 1,
        position: 1,
        active: 1,
        isAdmin: 1,
        _id: 0,
      },
    },
    {
      $sort: { position: 1 },
    },
  ]);

  return cashiers;
};

Controllers.getAllByStore = async (req, res) => {
  try {
    const { store } = req.body;
    const cashiers = await getAllCashiers(store);

    res.send({
      results: cashiers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener el listado de cajeros" });
  }
};

Controllers.getAll = async (req, res) => {
  try {
    const cashiers = await getAllCashiers("ALL");

    res.send({
      results: cashiers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener el listado de cajeros" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const { name, store, color, position, isAdmin } = req.body;

    await Cashier.create({
      name,
      store,
      color,
      position,
      active: true,
      isAdmin: isAdmin || false,
    });

    const cashiers = await getAllCashiers("ALL");

    res.send({
      results: cashiers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear cajero" });
  }
};

Controllers.update = async (req, res) => {
  try {
    const { id, name, store, color, position, active, isAdmin } = req.body;

    // Validar que id existe
    if (!id) {
      return res.status(400).json({ message: "ID de cajero requerido" });
    }

    // Obtener el schema directamente para evitar sanitize con $ne
    const CashierSchema = require("../schemas/cashier.schema");

    // Si hay otro cajero en esa posición, lo movemos
    const cashiersCount = await CashierSchema.countDocuments({
      active: { $ne: false },
    });
    await CashierSchema.findOneAndUpdate(
      { position, _id: { $ne: id } },
      { position: cashiersCount }
    );

    // Actualizar el cajero
    const updatedCashier = await CashierSchema.findByIdAndUpdate(
      id,
      { name, store, color, position, active, isAdmin },
      { new: true }
    );

    if (updatedCashier) {
      const cashiers = await getAllCashiers("ALL");
      res.send({ results: cashiers });
    } else {
      res.status(404).json({ message: "Cajero no encontrado" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error al modificar cajero" });
  }
};

Controllers.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCashier = await Cashier.remove({ _id: id });
    if (deletedCashier) {
      const cashiers = await getAllCashiers("ALL");

      res.send({
        results: cashiers,
      });
    } else {
      res.status(404).json({ message: "Cajero no encontrado" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar cajero" });
  }
};

module.exports = {
  Controllers,
};
