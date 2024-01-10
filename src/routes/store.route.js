const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/store.controller");

//Search Employee by id
router.get("/stores", Controllers.getAll);

module.exports = router;
