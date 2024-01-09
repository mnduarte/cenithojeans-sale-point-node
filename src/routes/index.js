const express = require("express");
const router = express.Router();
const userRoutes = require("./user.route");
const priceRoutes = require("./price.route");
const employeeRoutes = require("./employee.route");
const saleRoutes = require("./sale.route");
/*
// Función para agregar retraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Middleware para agregar retraso a todas las rutas
router.use(async (req, res, next) => {
  // Simular un retraso de 2 segundos antes de pasar a la siguiente capa
  await delay(2000);
  next();
});*/

router.use("/user", userRoutes);
router.use("/price", priceRoutes);
router.use("/employee", employeeRoutes);
router.use("/sale", saleRoutes);

module.exports = router;
