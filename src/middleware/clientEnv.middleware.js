const { connectionStore, getLocalConn } = require("../../config/database.config");

/**
 * Middleware that reads the x-client-env header and sets the appropriate
 * DB connection in AsyncLocalStorage for the duration of the request.
 *
 * - x-client-env: "local" → uses the local MongoDB connection (if configured)
 * - x-client-env: "stg"   → uses the default connection (same as NODE_ENV)
 * - header absent          → uses the default connection (no impact on other devices)
 */
module.exports = (req, res, next) => {
  const clientEnv = req.headers["x-client-env"];
  const localConn = getLocalConn();

  if (clientEnv === "local" && localConn) {
    return connectionStore.run(localConn, next);
  }

  next();
};
