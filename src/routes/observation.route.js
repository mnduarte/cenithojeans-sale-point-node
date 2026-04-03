const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/observation.controller");

router.post("/add-observation", Controllers.create);
router.get("/observations", Controllers.getObservations);
router.get("/observations-by-date", Controllers.getObservationsByDate);

module.exports = router;
