const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/employee.controller");

//Search Employee by id
router.post("/employees", Controllers.getAllByUser);

router.post("/add-employee", Controllers.create);
router.put("/update-employee", Controllers.update);
router.delete("/remove-employee/:id", Controllers.delete);
router.post("/add-new-num-order", Controllers.addNewNumOrder);

module.exports = router;
