/* jshint esversion: 6 */
// @Vendors

const AuditLog = require("../schemas/audit-logs.schema");
const moment = require("moment");

const ENVIROMENT = process.env.NODE_ENV
  ? process.env.NODE_ENV.toLocaleUpperCase()
  : "LOCAL";

class AuditLogService {
  /**
   * Placeholder for Audit Logs save.
   * In the meantime we track users usage.
   * @param {String} severity - The log severity.
   * @param {String} message - The message related to the log.
   */
  log(severity, message, author) {
    const logMessage = `${moment().format(
      "DD/MM/YY H:mm:ss"
    )} ::: ${ENVIROMENT} LOG SERVICE :::: - ${severity}: ${message}`;
    console.log(logMessage);
    const audit = new AuditLog({ severity, message, author });
    audit.save();
  }
}

module.exports = new AuditLogService();
