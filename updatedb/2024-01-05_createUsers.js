const BaseModel = require("../src/models/base.model");

const User = new BaseModel("User");

const users = [
  {
    username: "caja1",
    password: "bogota",
    store: "BOGOTA",
    role: "EMPLOYEE",
  },
  {
    username: "caja2",
    password: "bogota",
    store: "BOGOTA",
    role: "EMPLOYEE",
  },
  {
    username: "caja3",
    password: "helguera",
    store: "HELGUERA",
    role: "EMPLOYEE",
  },
  {
    username: "admin",
    password: "admin",
    store: "BOGOTA",
    role: "ADMIN",
  },
];

module.exports = async () => {
  return User.insertMany(users);
};
