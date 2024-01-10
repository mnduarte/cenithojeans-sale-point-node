const BaseModel = require("../src/models/base.model");

const Store = new BaseModel("Store");

const stores = [
  {
    name: "BOGOTA",
  },
  {
    name: "HELGUERA",
  },
];

module.exports = async () => {
  return Store.insertMany(stores);
};
