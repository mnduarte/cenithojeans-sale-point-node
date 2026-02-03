module.exports = {
  name: "MongoDB",
  local: {
    dbname: process.env.MONGO_DBNAME || "sales-point",
    host: process.env.MONGO_DBHOST || "0.0.0.0",
    build() {
      return `mongodb://${this.host}/${this.dbname}`;
    },
  },
  stg: {
    build() {
      // Usa variable de entorno si existe, sino usa el valor por defecto
      return (
        process.env.MONGO_URI ||
        "mongodb+srv://cenithojeans:vNlQiXU07ijyhmfA@cluster-sales-point-cen.2gdhwkr.mongodb.net/?retryWrites=true&w=majority"
      );
    },
  },
  test: {
    dbname: "sales-point-test",
    host: "127.0.0.1",
    build() {
      return `mongodb://${this.host}/${this.dbname}`;
    },
  },
};
