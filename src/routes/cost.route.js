const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/cost.controller");

router.get("/costs", Controllers.getCosts);
router.post("/add-cost", Controllers.create);
router.put("/update-cost", Controllers.update);

module.exports = router;
