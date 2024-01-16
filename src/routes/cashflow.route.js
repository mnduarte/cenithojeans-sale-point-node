const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/cashflow.controller");

router.post("/add-cashflow", Controllers.create);

module.exports = router;
