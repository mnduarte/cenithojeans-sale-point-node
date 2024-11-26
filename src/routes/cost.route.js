const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/cost.controller");

router.get("/costs", Controllers.getCosts);
router.post("/add-cost", Controllers.create);
router.put("/update-cost", Controllers.update);
router.post("/remove-cost", Controllers.removeCosts);

router.get("/accounts", Controllers.getAccounts);
router.post("/add-account", Controllers.createAccount);
router.put("/update-account", Controllers.updateAccount);
router.post("/remove-account", Controllers.removeAccounts);

module.exports = router;
