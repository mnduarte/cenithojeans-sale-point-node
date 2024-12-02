// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Employee = new BaseModel("Employee");
// @Services

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
        activeForCost: 1,
        store: 1,
        position: 1,
        _id: 0,
      },
    },
  ]);

  return employees;
};

Controllers.getAllByUser = async (req, res) => {
  try {
    const { store } = req.body;
    const employee = await getAllEmployees(store);

    res.send({
      results: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el listado de precios" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const { name, store, position, active, activeForCost } = req.body;

    await Employee.create({
      name,
      store,
      active,
      position,
      activeForCost,
    });

    const employee = await getAllEmployees();

    res.send({
      results: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio" });
  }
};

Controllers.addNewNumOrder = async (req, res) => {
  try {
    const { employeeId, newNumOrder } = req.body;

    await Employee.findByIdAndUpdate(
      { _id: employeeId },
      { newNumOrder, enableNewNumOrder: true }
    );

    res.send({ results: "Se estableció N Orden" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio" });
  }
};

Controllers.update = async (req, res) => {
  try {
    const { id, name, store, position, active, activeForCost } = req.body;

    const employees = await getAllEmployees();

    await Employee.findOneAndUpdate(
      { position },
      { position: employees.length }
    );

    const updatedEmployee = await Employee.findByIdAndUpdate(
      { _id: id },
      { name, store, position, active, activeForCost }
    );

    if (updatedEmployee) {
      const employee = await getAllEmployees();

      res.send({
        results: employee,
      });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error al modificar precio" });
  }
};

Controllers.delete = async (req, res) => {
  const { id, store } = req.params;

  try {
    const deletedEmployee = await Employee.remove({ _id: id });
    if (deletedEmployee) {
      const employees = await getAllEmployees();

      res.send({
        results: employees,
      });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar precio" });
  }
};

module.exports = {
  Controllers,
};
