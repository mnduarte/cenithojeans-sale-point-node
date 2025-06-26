const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/sale.controller");

router.get("/sales", Controllers.getSales);
router.get("/orders", Controllers.getOrders);
router.get("/orders-checkoutdate", Controllers.getOrdersCheckoutDate);
router.get("/reports", Controllers.getReports);
router.get("/reports-by-employees", Controllers.getReportsByEmployees);
router.get("/sales-cash-by-employees", Controllers.getSalesCashByEmployees);
router.get(
  "/sales-transfer-by-employees",
  Controllers.getSalesTransferByEmployees
);
router.put("/update-order", Controllers.updateOrder);
router.put("/update-sale-by-employee", Controllers.updateSaleByEmployee);
router.post("/cancel-order", Controllers.cancelOrders);
router.post("/remove-sale", Controllers.removeSales);
router.post("/last-num-order-by-seller", Controllers.getLastNumOrder);
router.post("/add-sale", Controllers.create);
router.post("/add-sale-by-employee", Controllers.createSaleByEmployee);
router.post("/print-sale", Controllers.print);

module.exports = router;
