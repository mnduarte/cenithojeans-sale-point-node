const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/graph.controller");

router.get("/get-data", Controllers.getData);

module.exports = router;
