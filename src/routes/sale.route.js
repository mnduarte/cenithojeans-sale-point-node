const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/sale.controller");

router.get("/sales", Controllers.getSales);
router.put("/update-sale", Controllers.update);
router.post("/cancel-order", Controllers.cancelOrders);
router.get("/orders", Controllers.getOrders);
router.post("/add-sale", Controllers.create);
router.post("/print-sale", Controllers.print);

module.exports = router;
