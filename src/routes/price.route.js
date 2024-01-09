const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/price.controller");

router.get("/prices", Controllers.getAll);

router.post("/add-price", Controllers.create);
router.put("/update-price", Controllers.update);
router.delete("/remove-price/:id", Controllers.delete);

module.exports = router;
