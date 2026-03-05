const mongoose = require("mongoose");
const { AsyncLocalStorage } = require("async_hooks");
const MongoConfig = require("./mongo.config");

// ============================================
// CONNECTION CONTEXT (per-request)
// ============================================
const connectionStore = new AsyncLocalStorage();

// ============================================
// DEFAULT CONNECTION (NODE_ENV based)
// ============================================
const env = process.env.NODE_ENV || "stg";
const databases = [MongoConfig];

databases.forEach((database) => {
  mongoose.connect(database[env].build(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on(
    "error",
    console.error.bind(
      console,
      `connection error with Database ${database.name}`
    )
  );
  db.once("open", () => {
    if (env !== "test")
      console.log(
        `Connection with database ${database.name} succeeded: ${env}`
      );
  });

  exports.db = db;
});

// ============================================
// OPTIONAL LOCAL CONNECTION
// Only established if MONGO_URI_LOCAL is set in .env
// ============================================
let localConn = null;

if (process.env.MONGO_URI_LOCAL) {
  localConn = mongoose.createConnection(process.env.MONGO_URI_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  localConn.on("error", (err) =>
    console.error("Local DB connection error:", err)
  );
  localConn.once("open", () =>
    console.log("Local DB connection succeeded (optional mode)")
  );
}

exports.connectionStore = connectionStore;
exports.getLocalConn = () => localConn;
