// @Vendors
const Controllers = {};
const BaseModel = require("../models/base.model");
const Employee = new BaseModel("Employee");
// @Services

const getAllEmployees = async () =>
  Employee.aggregate([
    {
      $project: {
        id: "$_id",
        name: 1,
        active: 1,
        _id: 0,
      },
    },
  ]);

Controllers.getAll = async (req, res) => {
  try {
    const employee = await getAllEmployees();

    res.send({
      results: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el listado de precios" });
  }
};

Controllers.create = async (req, res) => {
  try {
    const { name, active } = req.body;

    await Employee.create({
      name,
      active,
    });

    const employee = await getAllEmployees();

    res.send({
      results: employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio" });
  }
};

Controllers.update = async (req, res) => {
  try {
    const { id, name, active } = req.body;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      { _id: id },
      { name, active }
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
    res.status(500).json({ message: "Error al modificar precio" });
  }
};

Controllers.delete = async (req, res) => {
  const { id } = req.params;

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
