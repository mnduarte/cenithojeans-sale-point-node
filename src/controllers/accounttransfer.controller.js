// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const AccountTransfer = new BaseModel("AccountTransfer");
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
    const { name, store, position, active } = req.body;

    await AccountTransfer.create({
      name,
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
    const { id, name, store, position, active } = req.body;

    const accounts = await getAllAcountsForTransfer();

    await AccountTransfer.findOneAndUpdate(
      { position },
      { position: accounts.length }
    );

    const updatedAccountTransfer = await AccountTransfer.findByIdAndUpdate(
      { _id: id },
      { name, store, position, active }
    );

    if (updatedAccountTransfer) {
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
};
