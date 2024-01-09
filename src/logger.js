const CoreLogger = require("core-logger");
const loggerParams = {
  level: "debug",
};
const logger = new CoreLogger(loggerParams);

module.exports = logger;
