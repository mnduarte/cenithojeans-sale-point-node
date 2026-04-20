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
        "mongodb://cenithojeans:vNlQiXU07ijyhmfA@ac-zhzwztv-shard-00-00.2gdhwkr.mongodb.net:27017,ac-zhzwztv-shard-00-01.2gdhwkr.mongodb.net:27017,ac-zhzwztv-shard-00-02.2gdhwkr.mongodb.net:27017/?ssl=true&replicaSet=atlas-lajtn5-shard-0&authSource=admin&retryWrites=true&w=majority"
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
