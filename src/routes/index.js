const express = require("express");
const router = express.Router();
const userRoutes = require("./user.route");
const priceRoutes = require("./price.route");
const employeeRoutes = require("./employee.route");
const storeRoutes = require("./store.route");
const saleRoutes = require("./sale.route");
const cashflowRoutes = require("./cashflow.route");
const observationRoutes = require("./observation.route");
const graphRoutes = require("./graph.route");
const adminRoutes = require("./admin.route");
const costRoutes = require("./cost.route");

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
router.use("/store", storeRoutes);
router.use("/sale", saleRoutes);
router.use("/cashflow", cashflowRoutes);
router.use("/observation", observationRoutes);
router.use("/graph", graphRoutes);
router.use("/admin", adminRoutes);
router.use("/cost", costRoutes);

module.exports = router;
