const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/accounttransfer.controller");

router.post("/", Controllers.getAllByUser);
router.post("/add", Controllers.create);
router.put("/", Controllers.update);
router.delete("/:id", Controllers.delete);

module.exports = router;
