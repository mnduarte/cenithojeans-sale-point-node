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
    dbname:
      "cenithojeans:<password>@cluster-sales-point-cen.2gdhwkr.mongodb.net",
    host: "?retryWrites=true&w=majority",
    build() {
      return `mongodb+srv://cenithojeans:vNlQiXU07ijyhmfA@cluster-sales-point-cen.2gdhwkr.mongodb.net/?retryWrites=true&w=majority`;
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
