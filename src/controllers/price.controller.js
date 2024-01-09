// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Price = new BaseModel("Price");
// @Services

const getAllPrices = async () =>
  Price.aggregate([
    {
      $project: {
        id: "$_id",
        price: 1,
        active: 1,
        _id: 0,
      },
    },
  ]);

Controllers.getAll = async (req, res) => {
  try {
    const prices = await getAllPrices();

    res.send({
      results: prices,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el listado de precios" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const { price, active } = req.body;

    await Price.create({
      price,
      active,
    });

    const prices = await getAllPrices();

    res.send({
      results: prices,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio" });
  }
};

Controllers.update = async (req, res) => {
  try {
    const { id, price, active } = req.body;
    const updatedPrice = await Price.findByIdAndUpdate(
      { _id: id },
      { price, active }
    );

    if (updatedPrice) {
      const prices = await getAllPrices();

      res.send({
        results: prices,
      });
    } else {
      res.status(404).json({ message: "Price not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al modificar precio" });
  }
};

Controllers.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPrice = await Price.remove({ _id: id });
    if (deletedPrice) {
      const prices = await getAllPrices();

      res.send({
        results: prices,
      });
    } else {
      res.status(404).json({ message: "Price not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar precio" });
  }
};

module.exports = {
  Controllers,
};
