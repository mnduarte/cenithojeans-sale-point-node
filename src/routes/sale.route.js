const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/sale.controller");

router.get("/sales", Controllers.getSales);
router.get("/orders", Controllers.getOrders);
router.get("/sales-by-employees", Controllers.getSalesByEmployees);
router.put("/update-order", Controllers.updateOrder);
router.put("/update-sale-by-employee", Controllers.updateSaleByEmployee);
router.post("/cancel-order", Controllers.cancelOrders);
router.post("/add-sale", Controllers.create);
router.post("/add-sale-by-employee", Controllers.createSaleByEmployee);
router.post("/print-sale", Controllers.print);

module.exports = router;
