const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/admin.controller");

router.get("/delete-data", Controllers.deleteData);

module.exports = router;
