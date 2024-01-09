const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/user.controller");

router.post("/login", Controllers.login);

module.exports = router;
