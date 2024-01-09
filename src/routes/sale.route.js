const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/sale.controller");

router.get("/sales", Controllers.getSales);
router.post("/add-sale", Controllers.create);
router.post("/print-sale", Controllers.print);

module.exports = router;
