const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/observation.controller");

router.post("/add-observation", Controllers.create);
router.get("/observations", Controllers.getObservations);

module.exports = router;
