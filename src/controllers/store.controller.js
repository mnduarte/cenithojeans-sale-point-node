// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Store = new BaseModel("Store");
// @Services

Controllers.getAll = async (req, res) => {
  try {
    const stores = await Store.findAll();

    res.send({
      results: stores,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el listado de sucursales" });
  }
};

module.exports = {
  Controllers,
};
