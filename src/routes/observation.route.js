const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/observation.controller");

router.post("/add-observation", Controllers.create);

module.exports = router;
