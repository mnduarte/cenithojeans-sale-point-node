const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/printer.controller");

router.get("/", Controllers.getAll);
router.post("/by-store", Controllers.getByStore);

module.exports = router;
