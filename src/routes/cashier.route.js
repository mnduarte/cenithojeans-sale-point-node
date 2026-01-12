const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/cashier.controller");

router.get("/", Controllers.getAll);
router.post("/by-store", Controllers.getAllByStore);
router.post("/add", Controllers.create);
router.put("/update", Controllers.update);
router.delete("/:id", Controllers.delete);

module.exports = router;
