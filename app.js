require("dotenv").config();
const packageInfo = require("./package.json");
const express = require("express");
const config = require("./config/app.config");
const logger = require("./src/logger");
const cors = require("cors");
const boom = require("express-boom");

const routes = require("./src/routes");

const app = express();

// @Database Connection
require("./config/database.config");

app.use(express.json());
app.use(cors());
app.use(boom());
app.use("/", routes);

if (config.local) {
  const port = process.env.PORT || config.local.port;
  app.listen(port, () => {
    logger.info(`Application ${packageInfo.name} started at port ${port}`, {
      type: "application_start",
      applicationName: packageInfo.name,
      version: packageInfo.version,
      port,
    });
  });
}

module.exports = app;
