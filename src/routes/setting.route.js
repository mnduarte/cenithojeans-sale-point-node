const express = require("express");
const router = express.Router();
const { Controllers } = require("../controllers/setting.controller");

router.get("/", Controllers.getSetting);
router.put("/", Controllers.updateSetting);

module.exports = router;
