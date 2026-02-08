// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const AccountTransfer = new BaseModel("AccountTransfer");
const Sale = new BaseModel("Sale"); // <-- AGREGAR ESTO
// @Services

const getAllAcountsForTransfer = async (store = "ALL") => {
  const filter = store === "ALL" ? {} : { store };

  const accounts = await AccountTransfer.aggregate([
    {
      $match: filter,
    },
    {
      $project: {
        id: "$_id",
        name: 1,
        acronym: 1,
        active: 1,
        store: 1,
        position: 1,
        _id: 0,
      },
    },
  ]);

  return accounts;
};

Controllers.getAllByUser = async (req, res) => {
  try {
    const { store } = req.body;
    const employee = await getAllAcountsForTransfer(store);

    res.send({
      results: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el listado de precios" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const { name, acronym, store, position, active } = req.body;

    await AccountTransfer.create({
      name,
      acronym,
      store,
      active,
      position,
    });

    const accounts = await getAllAcountsForTransfer();

    res.send({
      results: accounts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear cuenta" });
  }
};

Controllers.update = async (req, res) => {
  try {
    const { id, name, acronym, store, position, active } = req.body;

    // ============ OBTENER NOMBRE ACTUAL ANTES DE ACTUALIZAR ============
    const currentAccount = await AccountTransfer.findOne({ _id: id });
    const oldName = currentAccount ? currentAccount.name : null;
    // ===================================================================

    const accounts = await getAllAcountsForTransfer();

    await AccountTransfer.findOneAndUpdate(
      { position },
      { position: accounts.length },
    );

    const updatedAccountTransfer = await AccountTransfer.findByIdAndUpdate(
      { _id: id },
      { name, acronym, store, position, active },
    );

    if (updatedAccountTransfer) {
      // ============ ACTUALIZAR VENTAS SI CAMBIÓ EL NOMBRE ============
      if (oldName && oldName !== name) {
        console.log(`Actualizando ventas: "${oldName}" → "${name}"`);

        const updateResult = await Sale.updateMany(
          { accountForTransfer: oldName },
          { $set: { accountForTransfer: name } },
        );

        console.log(`Ventas actualizadas: ${updateResult.modifiedCount}`);
      }
      // ==============================================================

      const accounts = await getAllAcountsForTransfer();

      res.send({
        results: accounts,
      });
    } else {
      res.status(404).json({ message: "Account not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error al modificar cuenta" });
  }
};

Controllers.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccount = await AccountTransfer.remove({ _id: id });

    // NOTA: No hacemos nada con las Sales que referencian esta cuenta
    // Las ventas históricas mantienen el nombre de la cuenta para registro

    if (deletedAccount) {
      const accounts = await getAllAcountsForTransfer();

      res.send({
        results: accounts,
      });
    } else {
      res.status(404).json({ message: "Account not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cuenta" });
  }
};

module.exports = {
  Controllers,
  getAllAcountsForTransfer,
};
